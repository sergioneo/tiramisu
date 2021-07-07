// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "./Vault.sol";
import "./CanSwap.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Wallet is Ownable, CanSwap {

    Vault public BACKING_VAULT;
    using ECDSA for bytes32;

    mapping(uint256 => string) public ordersPaid;
    uint256 public numberOfOrdersPaid = 0;
    mapping(uint256 => string) public ordersReceived;
    uint256 public numberOfOrdersReceived = 0;

    enum PaymentStatus{ NONE, AUTHORIZED, COMPLETED }

    mapping(string => PaymentStatus) public paymentStatus;
    mapping(string => address) public payer;
    mapping(string => uint256) public orderAmount;

    constructor(Vault _vault) {
        BACKING_VAULT = _vault;
    }

    function deposit(uint256 extraAmount) public onlyOwner {
        ERC20 backingAsset = BACKING_VAULT.ASSET();
        require(backingAsset.balanceOf(address(this)) + extraAmount > 0, "You can't deposit 0 funds");
        if (extraAmount > 0) {
            require(backingAsset.allowance(msg.sender, address(this)) >= extraAmount, "Not enough allowance");
            backingAsset.transferFrom(msg.sender, address(this), extraAmount);
        }
        uint256 totalAmount = backingAsset.balanceOf(address(this));
        backingAsset.approve(address(BACKING_VAULT), totalAmount);
        BACKING_VAULT.deposit(totalAmount);
    }

    function _deposit() internal {
        ERC20 backingAsset = BACKING_VAULT.ASSET();
        uint256 amount = backingAsset.balanceOf(address(this));
        if(amount == 0) {
            return;
        }
        backingAsset.approve(address(BACKING_VAULT), amount);
        BACKING_VAULT.deposit(amount);
    }

    function withdraw(uint256 amount) public onlyOwner {
        require(BACKING_VAULT.balanceOf(address(this)) >= amount, "Not enough funds to withdraw");
        BACKING_VAULT.withdraw(amount);
        ERC20 backingAsset = BACKING_VAULT.ASSET();
        backingAsset.transfer(msg.sender, amount);
    }

    function balance() public view returns (uint256) {
        return BACKING_VAULT.balanceOf(address(this));
    }

    function backingAssetSymbol() public view returns (string memory) {
        return BACKING_VAULT.ASSET().symbol();
    }

    function switchYielders(address newYielder) public {
        BACKING_VAULT.switchYielders(newYielder);
    }

    function getDecimals() public view returns (uint256) {
        return BACKING_VAULT.ASSET().decimals();
    }

    function sendPayment(
        string memory cid,
        Wallet payeeWallet,
        uint256 amount,
        string memory orderId,
        bytes memory signature
    ) public onlyOwner {
        // We check if the asset backing the payee's wallet is different from ours
        ERC20 targetAsset = payeeWallet.BACKING_VAULT().ASSET();
        uint256 hasToSend = amount;
        if (targetAsset != BACKING_VAULT.ASSET()) {
            hasToSend = getExpectedAmount(amount, BACKING_VAULT.ASSET(), targetAsset);
        }
        require(BACKING_VAULT.balanceOf(address(this)) >= hasToSend, "Not enough funds to pay");
        BACKING_VAULT.withdraw(hasToSend);
        require(BACKING_VAULT.ASSET().balanceOf(address(this)) >= hasToSend, "Amounts withdrawn are not enough");
        if (targetAsset != BACKING_VAULT.ASSET()) {
            swap(hasToSend, amount, BACKING_VAULT.ASSET(), targetAsset);
        }
        targetAsset.approve(address(payeeWallet), amount);
        payeeWallet.authorizePayment(cid, amount, orderId, signature);
        ordersPaid[numberOfOrdersPaid] = cid;
        numberOfOrdersPaid++;
    }

    function authorizePayment(string memory cid, uint256 amount, string memory orderId, bytes memory signature) public {
        require(paymentStatus[cid] == PaymentStatus.NONE, "Payment was processed");
        require(BACKING_VAULT.ASSET().allowance(msg.sender, address(this)) >= amount, "Amount not authorized");
        require(validateSignature(amount, orderId, signature), "Signature doesn't match");
        paymentStatus[cid] = PaymentStatus.AUTHORIZED;
        payer[cid] = msg.sender;
        orderAmount[cid] = amount;
    }

    function completePayment(string memory cid) public onlyOwner {
        require(paymentStatus[cid] == PaymentStatus.AUTHORIZED, "Payment is not in the AUTHORIZED stage");
        require(payer[cid] != address(0), "Invalid payer");
        require(BACKING_VAULT.ASSET().allowance(payer[cid], address(this)) >= orderAmount[cid], "Amount not authorized");
        BACKING_VAULT.ASSET().transferFrom(payer[cid], address(this), orderAmount[cid]);
        _deposit();
        ordersReceived[numberOfOrdersReceived] = cid;
        numberOfOrdersReceived++;
        paymentStatus[cid] = PaymentStatus.COMPLETED;
    }

    function validateSignature(uint256 amount, string memory orderId, bytes memory signature) public view returns (bool) {
        // This recreates the message hash that was signed on the client.
        bytes32 hash = keccak256(abi.encodePacked(amount, orderId));
        bytes32 messageHash = hash.toEthSignedMessageHash();
        // Verify that the message's signer is the owner of the order
        address signer = messageHash.recover(signature);
        return (signer == owner());
    }

}
