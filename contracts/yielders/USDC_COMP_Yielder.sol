// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./dependencies/cErc20.sol";
import "./Yielder.sol";

contract USDC_COMP_Yielder {

    ERC20 USDC = ERC20(0x07865c6E87B9F70255377e024ace6630C1Eaa37F);
    CErc20 cUSDC = CErc20(0x2973e69b20563bcc66dC63Bde153072c33eF37fe);

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
