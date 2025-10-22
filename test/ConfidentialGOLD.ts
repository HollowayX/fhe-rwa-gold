import { expect } from "chai";
import hre, { deployments, ethers } from "hardhat";
import { FhevmType } from "@fhevm/hardhat-plugin";

describe("ConfidentialGOLD", function () {
  beforeEach(async function () {
    await deployments.fixture(["ConfidentialGOLD"]);
    await hre.fhevm.initializeCLIApi();
  });

  async function getDecryptedBalance(holder: string) {
    const deployment = await deployments.get("ConfidentialGOLD");
    const contract = await ethers.getContractAt("ConfidentialGOLD", deployment.address);
    const encryptedBalance = await contract.confidentialBalanceOf(holder);
    const signers = await ethers.getSigners();
    const signer = signers.find((s) => s.address === holder) ?? signers[0];

    if (encryptedBalance === ethers.ZeroHash) {
      return 0n;
    }

    return await hre.fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedBalance,
      deployment.address,
      signer,
    );
  }

  it("mints cGOLD to a user", async function () {
    const [deployer, user] = await ethers.getSigners();
    const deployment = await deployments.get("ConfidentialGOLD");
    const contract = await ethers.getContractAt("ConfidentialGOLD", deployment.address);

    const amount = 25n;
    const encrypted = await hre.fhevm.encryptUint(
      FhevmType.euint64,
      amount,
      deployment.address,
      deployer.address,
    );

    await contract
      .connect(deployer)
      .mint(user.address, encrypted.externalEuint, encrypted.inputProof);
    const decrypted = await getDecryptedBalance(user.address);
    expect(decrypted).to.equal(amount);
  });

  it("burns cGOLD from a user", async function () {
    const [deployer, user] = await ethers.getSigners();
    const deployment = await deployments.get("ConfidentialGOLD");
    const contract = await ethers.getContractAt("ConfidentialGOLD", deployment.address);

    const minted = 40n;
    const burnAmount = 15n;

    const encryptedMint = await hre.fhevm.encryptUint(
      FhevmType.euint64,
      minted,
      deployment.address,
      deployer.address,
    );

    const mintTx = await contract
      .connect(deployer)
      .mint(user.address, encryptedMint.externalEuint, encryptedMint.inputProof);
    await mintTx.wait();

    const encryptedBurn = await hre.fhevm.encryptUint(
      FhevmType.euint64,
      burnAmount,
      deployment.address,
      user.address,
    );

    const burnTx = await contract
      .connect(user)
      .burn(user.address, encryptedBurn.externalEuint, encryptedBurn.inputProof);
    const burnReceipt = await burnTx.wait();
    expect(burnReceipt?.status).to.equal(1n);

    const parsedLogs = burnReceipt?.logs
      ?.map((log) => {
        try {
          return contract.interface.parseLog(log);
        } catch (error) {
          return null;
        }
      })
      .filter(Boolean);

    const burnEvent = parsedLogs?.find(
      (event) =>
        event?.name === "ConfidentialTransfer" &&
        event?.args?.from === user.address &&
        event?.args?.to === ethers.ZeroAddress,
    );

    expect(burnEvent).to.not.equal(undefined);
  });
});
