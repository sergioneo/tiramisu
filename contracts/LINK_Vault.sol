// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "./Vault.sol";

contract LINK_Vault is Vault {

    constructor() Vault(
            ERC20(0x20fE562d797A42Dcb3399062AE9546cd06f63280),
            "QmSzzkXXWr3xgmaeKzL19QnY445n1fQGLJfvUE9xf6mRD8"
        )
    {}

}
