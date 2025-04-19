const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const DeployModule = buildModule("TokenModule", (m: any) => {
  const marketPlace = m.contract("MediCare");
  return marketPlace;
});

module.exports = DeployModule;
