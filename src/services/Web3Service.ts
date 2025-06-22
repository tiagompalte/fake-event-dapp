import { ethers, Contract, Transaction } from "ethers";
import ABI from "./ABI.json";

const VIP_TICKET = 0;
const PREMIUM_TICKET = 1;
const REGULAR_TICKET = 2;

const TICKET_TYPES = [VIP_TICKET, PREMIUM_TICKET, REGULAR_TICKET];

const CONTRACT_ADDRESS: string = `${process.env.CONTRACT_ADDRESS}`;
const CHAIN_ID: number = parseInt(`${process.env.CHAIN_ID}`);

export async function login(): Promise<string> {
    if (!window.ethereum) throw new Error(`Wallet not found!`);

    const provider = new ethers.BrowserProvider(window.ethereum);
 
    const accounts: string[] = await provider.send("eth_requestAccounts", []);

    if (!accounts || !accounts.length) throw new Error(`Wallet not permitted!`);

    await provider.send("wallet_switchEthereumChain", [{
        chainId: ethers.toBeHex(CHAIN_ID)
    }]);

    return accounts[0];
}

export async function getPriceTickets(): Promise<Record<number, string>> {
    if (!window.ethereum) throw new Error(`Wallet not found!`);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    const prices: [bigint, bigint, bigint] = await contract.getTokenPrices();

    return {
        [VIP_TICKET]: ethers.formatEther(prices[VIP_TICKET]),
        [PREMIUM_TICKET]: ethers.formatEther(prices[PREMIUM_TICKET]),
        [REGULAR_TICKET]: ethers.formatEther(prices[REGULAR_TICKET]),
    };
}

export async function verifyPause(): Promise<boolean> {
    if (!window.ethereum) throw new Error(`Wallet not found!`);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const isPaused: boolean = await contract.paused();
    return isPaused;
}

export async function buyTicket(ticketID: number, quantity: number) : Promise<string | null> {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    
    const signer = await provider.getSigner();
    const instance = contract.connect(signer) as Contract;
    const ticketPrices = await getPriceTickets();

    const value = ethers.parseEther(ticketPrices[ticketID]) * ethers.toBigInt(quantity);

    const tx = await instance.mint(ticketID, quantity, { value }) as Transaction;

    return tx.hash;
}

type NFTData = {
    tokenId: string;
    name: string;
    description: string;
    image: string;
    ticketType: string;
    owner: string;
    quantity: bigint;
};

async function fetchNFTData(contract: Contract, ownerAddress: string, tokenId: number, tokenBalance: bigint): Promise<NFTData[]> {
    const nfts: NFTData[] = [];
    for (let i = 0; i < tokenBalance; i++) {
        const tokenURI: string = await contract.uri(tokenId);
        const tokenData: any = await fetch(tokenURI).then(res => res.json());
        nfts.push({
            tokenId: tokenId.toString(),
            name: tokenData.name,
            description: tokenData.description,
            image: tokenData.image,
            ticketType: tokenData.ticketType,
            owner: ownerAddress,
            quantity: tokenBalance,
        });
    }

    return nfts;
}

export async function getTicketNFTs(): Promise<NFTData[]> {
    if (!window.ethereum) throw new Error(`Wallet not found!`);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    const accounts: string[] = await provider.send("eth_requestAccounts", []);
    const ownerAddress = accounts[0];

    const nfts: NFTData[] = [];

    for (const tokenId of TICKET_TYPES) {
        const tokenBalance: bigint = await contract.balanceOf(ownerAddress, tokenId);

        if (tokenBalance > 0) {
            const nftData = await fetchNFTData(contract, ownerAddress, tokenId, tokenBalance);
            nfts.push(...nftData);
        }
    }

    return nfts;
}