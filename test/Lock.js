const { expect } = require( "chai");
const { ethers } = require("hardhat");

describe("TimeTickets", function () {
  let TimeTickets;
  let timeTickets;
  let owner;
  let buyer;
  const ticketPrice = ethers.utils.parseEther("0.0001");
  const maxTickets = 100;

  beforeEach(async function () {
    [owner, buyer] = await ethers.getSigners();
    TimeTickets = await ethers.getContractFactory("TimeTickets");
    timeTickets = await TimeTickets.deploy(ticketPrice, maxTickets);
    await timeTickets.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await timeTickets.owner()).to.equal(owner.address);
    });

    it("Should set the correct ticket price", async function () {
      expect(await timeTickets.ticketPrice()).to.equal(ticketPrice);
    });
  });

  describe("Transactions", function () {
    it("Should allow buying tickets", async function () {
      const buyAmount = 2;
      const totalPrice = ticketPrice.mul(buyAmount);

      await timeTickets.connect(buyer).buyTicket(buyAmount, { value: totalPrice });
      expect(await timeTickets.getTicketBalance(buyer.address)).to.equal(buyAmount);
    });

    it("Should fail if payment is insufficient", async function () {
      const buyAmount = 2;
      const insufficientPrice = ticketPrice.mul(buyAmount).sub(1);

      await expect(
        timeTickets.connect(buyer).buyTicket(buyAmount, { value: insufficientPrice })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should allow owner to withdraw funds", async function () {
      const buyAmount = 2;
      const totalPrice = ticketPrice.mul(buyAmount);

      await timeTickets.connect(buyer).buyTicket(buyAmount, { value: totalPrice });

      const initialBalance = await ethers.provider.getBalance(owner.address);
      await timeTickets.connect(owner).withdrawFunds();
      const finalBalance = await ethers.provider.getBalance(owner.address);

      expect(finalBalance.gt(initialBalance)).to.be.true;
    });
  });
});
