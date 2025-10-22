import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const confidentialGold = await deploy("ConfidentialGOLD", {
    from: deployer,
    log: true,
  });

  console.log(`ConfidentialGOLD contract: `, confidentialGold.address);
};
export default func;
func.id = "deploy_confidentialGold"; // id required to prevent reexecution
func.tags = ["ConfidentialGOLD"];
