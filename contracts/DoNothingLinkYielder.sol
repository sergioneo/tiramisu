// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Yielder.sol";

contract DoNothingLinkYielder is Yielder {
    ERC20 LINK = ERC20(0x20fE562d797A42Dcb3399062AE9546cd06f63280);
    mapping(address => uint256) public balances;

    constructor(Vault _vault, string memory _CID) Yielder(_vault, _CID) {}

    /* Yielder interface */

    function deposit(address addr, uint256 amount) external override onlyFromVault {
        require(LINK.allowance(msg.sender, address(this)) >= amount, "Can't retrieve LINK from vault");
        LINK.transferFrom(msg.sender, address(this), amount);
        balances[addr] += amount;
    }

    function balanceOf(address addr) external view override returns (uint256) {
        return balances[addr];
    }

    function withdraw(address addr, uint256 amount) external override onlyFromVault {
        require(balances[addr] >= amount, "That amount exceeds the current balance");
        LINK.transfer(msg.sender, amount);
        balances[addr] -= amount;
    }

}
