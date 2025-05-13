// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BlackjackSimpleModule = buildModule("BlackjackSimpleModule", (m) => {
  // Deploy the BlackjackSimple contract
  const blackjackSimple = m.contract("BlackjackSimple");

  return { blackjackSimple };
});

export default BlackjackSimpleModule;