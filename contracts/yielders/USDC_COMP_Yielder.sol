// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./dependencies/cErc20.sol";
import "./Yielder.sol";

contract USDC_COMP_Yielder {

    ERC20 USDC = ERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    CErc20 cUSDC = CErc20(0x39AA39c021dfbaE8faC545936693aC917d5E7563);

    function deposit(uint256 amount) external {
        require(USDC.allowance(msg.sender, address(this)) == amount, "Can't retrieve USDC from vault");
        USDC.transferFrom(msg.sender, address(this), amount);
        USDC.approve(address(cUSDC), amount);
        cUSDC.mint(amount);
    }

    function balance() external view returns (uint256) {
        return cUSDC.balanceOf(address(this)) * cUSDC.exchangeRateStored() / 1e18;
    }

    function withdraw(uint256 amount) external {
        uint redeemResult = cUSDC.redeemUnderlying(amount);
        require(redeemResult == 0, "redeemResult error");
        USDC.transfer(msg.sender, amount);
    }

}
