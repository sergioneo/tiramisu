// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "./Vault.sol";

contract USDC_Vault is Vault {

    constructor() Vault(
            ERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48),
            "ABC"
        )
    {}

}
