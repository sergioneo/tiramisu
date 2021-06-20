// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "./Yielder.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

abstract contract Vault {

    mapping(uint256 => Yielder) public yielderRegistry;
    mapping(address => uint256) public yielderPreference;
    uint256 public yieldersRegistrySize = 0;

    ERC20 public ASSET;
    string CID;

    constructor(ERC20 _asset, string memory _cid) {
        ASSET = _asset;
        CID = _cid;
    }

    function onboardYielder(Yielder _yielder) public {
        require(address(_yielder.vault()) == address(this), "Yielder has to be setup for this vault");
        yieldersRegistrySize++;
        yielderRegistry[yieldersRegistrySize] = _yielder;
    }

    function deposit(uint256 amount) public registryHasYielders {
        address user = msg.sender;
        require(ASSET.allowance(user, address(this)) >= amount, "Can't access funds from address");
        ASSET.transferFrom(user, address(this), amount);
        if (yielderPreference[user] == 0) {
            yielderPreference[user] = 1;
        }
        Yielder yielder = yielderRegistry[yielderPreference[user]];
        ASSET.approve(address(yielder), amount);
        yielder.deposit(user, amount);
    }

    function withdraw(uint256 amount) public registryHasYielders {
        address user = msg.sender;
        require(yielderPreference[user] != 0, "User is not onboarded with any yielders");
        Yielder yielder = yielderRegistry[yielderPreference[user]];
        require(yielder.balanceOf(user) > amount, "Not enough funds to withdraw");
        yielder.withdraw(user, amount);
        ASSET.transfer(msg.sender, amount);
    }

    function balanceOf(address user) public view registryHasYielders returns (uint256) {
        require(yielderPreference[user] != 0, "User is not onboarded with any yielders");
        Yielder yielder = yielderRegistry[yielderPreference[user]];
        return yielder.balanceOf(user);
    }

    function switchYielders(uint256 newYielderCode) public registryHasYielders {
        address user = msg.sender;
        require(yielderPreference[user] != 0, "User is not onboarded with any yielders");
        require(address(yielderRegistry[newYielderCode]) != address(0), "That yielder doesn't exist");
        Yielder oldYielder = yielderRegistry[yielderPreference[user]];
        require(oldYielder.balanceOf(user) > 0, "Not enough funds to switch");
        uint256 amountAvailable = oldYielder.balanceOf(user);
        oldYielder.withdraw(user, amountAvailable);
        Yielder newYielder = yielderRegistry[newYielderCode];
        yielderPreference[user] = newYielderCode;
        ASSET.approve(address(newYielder), amountAvailable);
        newYielder.deposit(user, amountAvailable);
    }

    modifier registryHasYielders() {
        require(yieldersRegistrySize >= 1, "No yielders in registry");
        _;
    }

}
