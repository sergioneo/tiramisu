// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "./Vault.sol";

abstract contract Yielder {

    constructor(Vault _vault) {
        vault = _vault;
    }

    Vault public vault;

    function deposit(address, uint256) external virtual;

    function balanceOf(address) external view virtual returns (uint256);

    function withdraw(address, uint256) external virtual;

    modifier onlyFromVault() {
        require(msg.sender == address(vault), "This function can only be called from the parent vault");
        _;
    }

}
