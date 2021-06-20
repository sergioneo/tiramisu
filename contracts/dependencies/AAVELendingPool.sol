// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;
interface AAVELendingPool {
    function deposit(address, uint256, address, uint16) external;
    function withdraw(address, uint256, address) external;
}
