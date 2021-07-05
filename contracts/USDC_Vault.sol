// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "./Vault.sol";

contract USDC_Vault is Vault {

    constructor() Vault(
            ERC20(0x07865c6E87B9F70255377e024ace6630C1Eaa37F),
            "QmSzzkXXWr3xgmaeKzL19QnY445n1fQGLJfvUE9xf6mRD8"
        )
    {}

}
