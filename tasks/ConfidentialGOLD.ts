import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("cgold:address", "Prints the ConfidentialGOLD address").setAction(async function (_taskArguments, hre) {
  const { deployments } = hre;
  const deployment = await deployments.get("ConfidentialGOLD");
  console.log(`ConfidentialGOLD address: ${deployment.address}`);
});

task("cgold:mint", "Mints cGOLD for a recipient")
  .addParam("to", "Recipient address")
  .addParam("amount", "Amount of cGOLD to mint (uint64 grams)")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;
    const { to, amount } = taskArguments;
    const parsedAmount = BigInt(amount);
    if (parsedAmount < 0n || parsedAmount > 2n ** 64n - 1n) {
      throw new Error("Amount must fit into uint64");
    }

    const deployment = await deployments.get("ConfidentialGOLD");
    const signer = (await ethers.getSigners())[0];
    const contract = await ethers.getContractAt("ConfidentialGOLD", deployment.address);

    const tx = await contract.connect(signer).mint(to, Number(parsedAmount));
    console.log(`Mint tx: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Mint confirmed with status ${receipt?.status}`);
  });

task("cgold:burn", "Burns cGOLD from a holder")
  .addParam("from", "Holder address")
  .addParam("amount", "Amount of cGOLD to burn (uint64 grams)")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;
    const { from, amount } = taskArguments;
    const parsedAmount = BigInt(amount);
    if (parsedAmount < 0n || parsedAmount > 2n ** 64n - 1n) {
      throw new Error("Amount must fit into uint64");
    }

    const deployment = await deployments.get("ConfidentialGOLD");
    const signer = (await ethers.getSigners())[0];
    const contract = await ethers.getContractAt("ConfidentialGOLD", deployment.address);

    const tx = await contract.connect(signer).burn(from, Number(parsedAmount));
    console.log(`Burn tx: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Burn confirmed with status ${receipt?.status}`);
  });

task("cgold:decrypt-balance", "Decrypts the encrypted balance of an account")
  .addParam("account", "Account address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;
    const { account } = taskArguments;

    await fhevm.initializeCLIApi();

    const deployment = await deployments.get("ConfidentialGOLD");
    const contract = await ethers.getContractAt("ConfidentialGOLD", deployment.address);
    const encryptedBalance = await contract.confidentialBalanceOf(account);

    if (encryptedBalance === ethers.ZeroHash) {
      console.log("Encrypted balance: 0x0");
      console.log("Clear balance   : 0");
      return;
    }

    const signer = (await ethers.getSigners())[0];
    const clearBalance = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedBalance,
      deployment.address,
      signer
    );

    console.log(`Encrypted balance: ${encryptedBalance}`);
    console.log(`Clear balance   : ${clearBalance}`);
  });

task("cgold:decrypt-supply", "Decrypts the total supply of cGOLD").setAction(async function (_taskArguments, hre) {
  const { ethers, deployments, fhevm } = hre;

  await fhevm.initializeCLIApi();

  const deployment = await deployments.get("ConfidentialGOLD");
  const contract = await ethers.getContractAt("ConfidentialGOLD", deployment.address);
  const encryptedSupply = await contract.confidentialTotalSupply();

  if (encryptedSupply === ethers.ZeroHash) {
    console.log("Encrypted supply: 0x0");
    console.log("Clear supply    : 0");
    return;
  }

  const signer = (await ethers.getSigners())[0];
  const clearSupply = await fhevm.userDecryptEuint(
    FhevmType.euint64,
    encryptedSupply,
    deployment.address,
    signer
  );

  console.log(`Encrypted supply: ${encryptedSupply}`);
  console.log(`Clear supply    : ${clearSupply}`);
});
