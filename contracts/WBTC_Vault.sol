// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "./Vault.sol";

contract WBTC_Vault is Vault {

    constructor() Vault(
            ERC20(0x442Be68395613bDCD19778e761f03261ec46C06D),
            "Qmf3f35CVhqwfJgVMSJyiLvjLhEXpgCE7PBrn3FmrYdobM"
        )
    {}

}
