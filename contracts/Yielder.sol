// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;
abstract contract Yielder {

    function deposit(uint256 amount) external virtual;

    function balance() external view virtual returns (uint256);

    function withdraw(uint256 amount) external virtual;


}
