// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Yielder.sol";
import "./USDC_COMP_Yielder.sol";

contract USDC_COMP_Proxy is Yielder {

    mapping(address => USDC_COMP_Yielder) yielders;
    ERC20 USDC = ERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);

    constructor(Vault _vault) Yielder(_vault) {}

    /* Yielder interface */

    function deposit(address addr, uint256 amount) external override onlyFromVault {
        require(USDC.allowance(msg.sender, address(this)) >= amount, "Can't retrieve USDC from vault");
        USDC_COMP_Yielder yielder;
        if (address(yielders[addr]) == address(0)) {
            yielder = new USDC_COMP_Yielder();
            yielders[addr] = yielder;
        } else {
            yielder = yielders[addr];
        }
        USDC.transferFrom(msg.sender, address(this), amount);
        USDC.approve(address(yielder), amount);
        yielder.deposit(amount);
    }

    function balanceOf(address addr) external view override returns (uint256) {
        if (address(yielders[addr]) == address(0)) {
            return 0;
        } else {
            return yielders[addr].balance();
        }
    }

    function withdraw(address addr, uint256 amount) external override onlyFromVault {
        require(address(yielders[addr]) != address(0), "No yielder for this address");
        require(yielders[addr].balance() <= amount, "That amount exceeds the current balance");
        yielders[addr].withdraw(amount);
        USDC.transfer(msg.sender, amount);
    }

    /* Testing */

    function getYielder(address addr) external view returns (address)  {
        return address(yielders[addr]);
    }

}
