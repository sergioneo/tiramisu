// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "./Yielder.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

abstract contract Vault {

    mapping(address => address) public yielderPreference;
    address public defaultYielder;

    ERC20 public ASSET;
    string public CID;

    constructor(ERC20 _asset, string memory _cid) {
        ASSET = _asset;
        CID = _cid;
    }

    function setDefaultYielder(address _yielder) public onlyDao {
        defaultYielder = _yielder;
    }

    function deposit(uint256 amount) public registryHasYielders {
        address user = msg.sender;
        require(ASSET.allowance(user, address(this)) >= amount, "Can't access funds from address");
        ASSET.transferFrom(user, address(this), amount);
        if (yielderPreference[user] == address(0)) {
            yielderPreference[user] = defaultYielder;
        }
        Yielder yielder = Yielder(yielderPreference[user]);
        ASSET.approve(address(yielder), amount);
        yielder.deposit(user, amount);
    }

    function withdraw(uint256 amount) public registryHasYielders {
        address user = msg.sender;
        require(yielderPreference[user] != address(0), "User is not onboarded with any yielders");
        Yielder yielder = Yielder(yielderPreference[user]);
        require(yielder.balanceOf(user) > amount, "Not enough funds to withdraw");
        yielder.withdraw(user, amount);
        ASSET.transfer(msg.sender, amount);
    }

    function balanceOf(address user) public view registryHasYielders returns (uint256) {
        require(yielderPreference[user] != address(0), "User is not onboarded with any yielders");
        Yielder yielder = Yielder(yielderPreference[user]);
        return yielder.balanceOf(user);
    }

    function switchYielders(address newYielderAddress) public registryHasYielders {
        address user = msg.sender;
        require(yielderPreference[user] != address(0), "User is not onboarded with any yielders");
        require(newYielderAddress != address(0), "Can't set the yielder to address 0");
        Yielder oldYielder = Yielder(yielderPreference[user]);
        require(oldYielder.balanceOf(user) > 0, "Not enough funds to switch");
        uint256 amountAvailable = oldYielder.balanceOf(user);
        oldYielder.withdraw(user, amountAvailable);
        Yielder newYielder = Yielder(newYielderAddress);
        require(newYielder.vault() == this, "This yielder was not made for this vault");
        yielderPreference[user] = newYielderAddress;
        ASSET.approve(address(newYielder), amountAvailable);
        newYielder.deposit(user, amountAvailable);
    }

    modifier registryHasYielders() {
        require(defaultYielder != address(0), "No yielders in registry");
        _;
    }

    modifier onlyDao() {
        _;
    }

}
