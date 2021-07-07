// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./dependencies/CErc20.sol";
import "./Yielder.sol";

contract LINK_COMP_Yielder {

    ERC20 LINK = ERC20(0x20fE562d797A42Dcb3399062AE9546cd06f63280);
    CErc20 cLINK = CErc20(0xa713A30082AD85736DdFd210dA5d71bfAa378616);

    function deposit(uint256 amount) external {
        require(LINK.allowance(msg.sender, address(this)) == amount, "Can't retrieve USDC from vault");
        LINK.transferFrom(msg.sender, address(this), amount);
        LINK.approve(address(cLINK), amount);
        cLINK.mint(amount);
    }

    function balance() external view returns (uint256) {
        return cLINK.balanceOf(address(this)) * cLINK.exchangeRateStored() / 1e18;
    }

    function withdraw(uint256 amount) external {
        uint redeemResult = cLINK.redeemUnderlying(amount);
        require(redeemResult == 0, "redeemResult error");
        LINK.transfer(msg.sender, amount);
    }

}
