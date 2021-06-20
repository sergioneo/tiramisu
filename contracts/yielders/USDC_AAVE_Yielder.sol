// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./dependencies/AAVELendingPool.sol";
import "./Yielder.sol";

contract USDC_AAVE_Yielder {

    ERC20 USDC = ERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    AAVELendingPool lendingPool = AAVELendingPool(0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9);
    ERC20 aUSDC = ERC20(0xBcca60bB61934080951369a648Fb03DF4F96263C);

    function deposit(uint256 amount) external {
        require(USDC.allowance(msg.sender, address(this)) == amount, "Can't retrieve USDC from vault");
        USDC.transferFrom(msg.sender, address(this), amount);
        USDC.approve(address(lendingPool), amount);
        lendingPool.deposit(address(USDC), amount, address(this), 0);
    }

    function balance() external view returns (uint256) {
        return aUSDC.balanceOf(address(this));
    }

    function withdraw(uint256 amount) external {
        lendingPool.withdraw(address(USDC), amount, msg.sender);
    }

}
