// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TimeTickets {
    address public owner;
    uint256 public ticketPrice;
    uint256 public maxTickets;
    mapping(address => uint256) public tickets;

    event TicketPurchased(address buyer, uint256 amount);
    event PriceChanged(uint256 newPrice);

    constructor(uint256 _ticketPrice, uint256 _maxTickets) {
        owner = msg.sender;
        ticketPrice = _ticketPrice;
        maxTickets = _maxTickets;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    function buyTicket(uint256 amount) public payable {
        require(msg.value >= ticketPrice * amount, "Insufficient payment");
        require(tickets[msg.sender] + amount <= maxTickets, "Exceeds max tickets");

        tickets[msg.sender] += amount;
        emit TicketPurchased(msg.sender, amount);
    }

    function setTicketPrice(uint256 _newPrice) public onlyOwner {
        ticketPrice = _newPrice;
        emit PriceChanged(_newPrice);
    }

    function withdrawFunds() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function getTicketBalance(address user) public view returns (uint256) {
        return tickets[user];
    }
}
