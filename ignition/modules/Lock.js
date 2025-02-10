const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TimeTickets", (m) => {
  // Define constructor arguments
  const ticketPrice = ethers.parseEther("0.0001"); // 0.0001 BTT
  const maxTickets = 100;

  // Deploy TimeTickets with constructor arguments
  const timeTickets = m.contract("TimeTickets", [ticketPrice, maxTickets]);

  return { timeTickets };
});
