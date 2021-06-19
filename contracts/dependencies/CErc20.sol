// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;
interface CErc20 {
    function mint(uint256) external returns (uint256);

    function exchangeRateCurrent() external returns (uint256);

    function supplyRatePerBlock() external returns (uint256);

    function redeem(uint) external returns (uint);

    function redeemUnderlying(uint) external returns (uint);

    function balanceOf(address) external view returns (uint);

    function balanceOfUnderlying(address) external view returns (uint);
}
