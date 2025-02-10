require("@nomicfoundation/hardhat-toolbox");

const fs = require('fs');
const privateKey = fs.readFileSync("secret.txt").toString().trim();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: 'localhost',
  networks:{
    hardhat: {
      chainId: 4282
    },
    BitTorrent: {
      url: "https://pre-rpc.bt.io/",
      accounts: [privateKey],
      gasPrice: 10000000,
    }
  },
  solidity: "0.8.28",
};
