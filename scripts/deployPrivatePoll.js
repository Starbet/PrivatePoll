const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying PrivatePoll contract...");

  const PrivatePoll = await hre.ethers.getContractFactory("PrivatePoll");
  const privatePoll = await PrivatePoll.deploy();

  await privatePoll.waitForDeployment();

  const address = await privatePoll.getAddress();
  console.log("✅ PrivatePoll deployed to:", address);

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    contractName: "PrivatePoll",
    address: address,
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
    deployer: (await hre.ethers.getSigners())[0].address
  };

  fs.writeFileSync(
    'deployment-privatepoll.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("📝 Deployment info saved to deployment-privatepoll.json");
  console.log("\n🔧 Update your .env file with:");
  console.log(`VITE_PRIVATEPOLL_CONTRACT_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
