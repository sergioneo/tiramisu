// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Yielder.sol";
import "./USDC_COMP_Yielder.sol";

contract USDC_COMP_Proxy is Yielder {

    mapping(address => USDC_COMP_Yielder) yielders;
    ERC20 USDC = ERC20(0x07865c6E87B9F70255377e024ace6630C1Eaa37F);

    constructor(Vault _vault, string memory _CID) Yielder(_vault, _CID) {}

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
        require(yielders[addr].balance() >= amount, "That amount exceeds the current balance");
        yielders[addr].withdraw(amount);
        USDC.transfer(msg.sender, amount);
    }

    /* Testing */

    function getYielder(address addr) external view returns (address)  {
        return address(yielders[addr]);
    }

}
