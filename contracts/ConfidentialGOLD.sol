// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.27;

import {ConfidentialFungibleToken} from "new-confidential-contracts/token/ConfidentialFungibleToken.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {FHE, euint64} from "@fhevm/solidity/lib/FHE.sol";

contract ConfidentialGOLD is ConfidentialFungibleToken, SepoliaConfig {
    constructor() ConfidentialFungibleToken("cGOLD", "cGOLD", "") {}

    function mint(address to, uint64 amount) public {
        euint64 encryptedAmount = FHE.asEuint64(amount);
        _mint(to, encryptedAmount);
    }

    function burn(address from, uint64 amount) public {
        euint64 encryptedAmount = FHE.asEuint64(amount);
        _burn(from, encryptedAmount);
    }
}
