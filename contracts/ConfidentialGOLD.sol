// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.27;


import {ERC7984} from "confidential-contracts-v91/contracts/token/ERC7984/ERC7984.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {FHE, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";

contract ConfidentialGOLD is ERC7984, ZamaEthereumConfig {
    constructor() ERC7984("cGOLD", "cGOLD", "") {}

    function mint(address to, externalEuint64 encryptedAmount, bytes calldata inputProof) public {
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        _mint(to, amount);
    }

    function burn(address from, externalEuint64 encryptedAmount, bytes calldata inputProof) public {
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        _burn(from, amount);
    }
}
