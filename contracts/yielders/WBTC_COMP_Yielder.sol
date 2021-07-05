// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./dependencies/cErc20.sol";
import "./Yielder.sol";

contract USDC_COMP_Yielder {

    ERC20 WBTC = ERC20(0x442Be68395613bDCD19778e761f03261ec46C06D);
    CErc20 cWBTC = CErc20(0x541c9cB0E97b77F142684cc33E8AC9aC17B1990F);

    function deposit(uint256 amount) external {
        require(WBTC.allowance(msg.sender, address(this)) == amount, "Can't retrieve WBTC from vault");
        WBTC.transferFrom(msg.sender, address(this), amount);
        WBTC.approve(address(cWBTC), amount);
        cWBTC.mint(amount);
    }

    function balance() external view returns (uint256) {
        return cWBTC.balanceOf(address(this)) * cWBTC.exchangeRateStored() / 1e18;
    }

    function withdraw(uint256 amount) external {
        uint redeemResult = cWBTC.redeemUnderlying(amount);
        require(redeemResult == 0, "redeemResult error");
        WBTC.transfer(msg.sender, amount);
    }

}
