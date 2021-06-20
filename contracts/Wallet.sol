// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "./Vault.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Wallet is Ownable {

    Vault public BACKING_VAULT;

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

    function switchYielders(uint256 newYielder) public {
        BACKING_VAULT.switchYielders(newYielder);
    }

}
