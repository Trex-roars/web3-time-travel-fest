import { ethers } from 'ethers';

export const CONTRACT_ADDRESS = "0x4088e079d50a9e9cF6237cB6c7E7a94fAff3a142";

export const CONTRACT_ABI = [
    "function buyTicket(uint256 amount) public payable",
    "function getTicketBalance(address user) public view returns (uint256)",
    "function ticketPrice() public view returns (uint256)"
];

export const getContract = async () => {
    if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

export const formatEther = (wei: bigint): string => {
    return ethers.formatEther(wei);
};

export const parseEther = (ether: string): bigint => {
    return ethers.parseEther(ether);
};
