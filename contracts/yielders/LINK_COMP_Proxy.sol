// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Yielder.sol";
import "./LINK_COMP_Yielder.sol";

contract LINK_COMP_Proxy is Yielder {

    mapping(address => LINK_COMP_Yielder) yielders;
    ERC20 LINK = ERC20(0x20fE562d797A42Dcb3399062AE9546cd06f63280);

    constructor(Vault _vault, string memory _CID) Yielder(_vault, _CID) {}

    /* Yielder interface */

    function deposit(address addr, uint256 amount) external override onlyFromVault {
        require(LINK.allowance(msg.sender, address(this)) >= amount, "Can't retrieve LINK from vault");
        LINK_COMP_Yielder yielder;
        if (address(yielders[addr]) == address(0)) {
            yielder = new LINK_COMP_Yielder();
            yielders[addr] = yielder;
        } else {
            yielder = yielders[addr];
        }
        LINK.transferFrom(msg.sender, address(this), amount);
        LINK.approve(address(yielder), amount);
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
        LINK.transfer(msg.sender, amount);
    }

    /* Testing */

    function getYielder(address addr) external view returns (address)  {
        return address(yielders[addr]);
    }

}
