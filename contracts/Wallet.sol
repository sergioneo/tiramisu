// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "./Vault.sol";
import "./CanSwap.sol";
import "./dependencies/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Wallet is Ownable, CanSwap {

    Vault public BACKING_VAULT;
    using ECDSA for bytes32;

    mapping(uint256 => string) public ordersPaid;
    uint256 public numberOfOrdersPaid = 0;
    mapping(uint256 => string) public ordersReceived;
    uint256 public numberOfOrdersReceived = 0;

    mapping(string => bool) public receivedPayments;

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
    ) public {
        // We check if the asset backing the payee's wallet is different from ours
        ERC20 targetAsset = payeeWallet.BACKING_VAULT().ASSET();
        uint256 hasToSend = amount;
        if (targetAsset != BACKING_VAULT.ASSET()) {
            hasToSend = getExpectedAmount(amount, BACKING_VAULT.ASSET(), targetAsset);
        }
        require(BACKING_VAULT.balanceOf(address(this)) >= hasToSend, "Not enough funds to pay");
        BACKING_VAULT.withdraw(hasToSend);
        if (targetAsset != BACKING_VAULT.ASSET()) {
            swap(hasToSend, amount, BACKING_VAULT.ASSET(), targetAsset);
        }
        targetAsset.approve(address(payeeWallet), amount);
        payeeWallet.receivePayment(cid, amount, orderId, signature);
        ordersPaid[numberOfOrdersPaid] = cid;
        numberOfOrdersPaid++;
    }

    function receivePayment(string memory cid, uint256 amount, string memory orderId, bytes memory signature) public {
        require(!receivedPayments[orderId], "PAYMENT WAS ALREADY RECEIVED");
        require(BACKING_VAULT.ASSET().allowance(msg.sender, address(this)) >= amount, "Amount not sent");
        require(validateSignature(amount, orderId, signature), "Signature doesn't match");
        BACKING_VAULT.ASSET().transferFrom(msg.sender, address(this), amount);
        receivedPayments[orderId] = true;
        _deposit();
        ordersReceived[numberOfOrdersReceived] = cid;
        numberOfOrdersReceived++;
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
