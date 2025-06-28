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

export async function waitForTransaction(txHash: string, retries = 20, interval = 3000): Promise<boolean> {
    for (let i = 0; i < retries; i++) {
        const confirmed = await verifyTransaction(txHash);
        if (confirmed) return true;
        await new Promise(res => setTimeout(res, interval));
    }
    return false;
}

export async function verifyTransaction(txHash: string): Promise<boolean> {
    if (!window.ethereum) throw new Error(`Wallet not found!`);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const receipt = await provider.getTransactionReceipt(txHash);
    return !!receipt && receipt.status === 1;
}

export type AvailableNFTData = {
    id: string;
    name: string;
    description: string;
    image: string;
    price: string;
};

function formatIPFSUrl(url: string): string {
    if (url.startsWith("ipfs://")) {
        return `https://ipfs.io/ipfs/${url.slice(7)}`;
    }
    return url;
}

export async function getAvailableTicketNFTs(): Promise<AvailableNFTData[]> {
    if (!window.ethereum) throw new Error(`Wallet not found!`);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const nfts: AvailableNFTData[] = [];

    for (const tokenId of TICKET_TYPES) {
        const tokenURI: string = await contract.uri(tokenId);
        const price: bigint = await contract.tokenPrices(tokenId);
        const tokenData: AvailableNFTData = await fetch(formatIPFSUrl(tokenURI)).then(res => res.json());
        nfts.push({
            id: tokenId.toString(),
            name: tokenData.name,
            description: tokenData.description,
            image: formatIPFSUrl(tokenData.image),
            price: ethers.formatEther(price),
        });
    }

    return nfts;
}

export type WalletNFTData = {
    id: string;
    name: string;
    description: string;
    image: string;
    quantity: string;
};

export async function getNFTsByWallet(): Promise<WalletNFTData[]> {
    if (!window.ethereum) throw new Error(`Wallet not found!`);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const signer = await provider.getSigner();
    const walletAddress: string = await signer.getAddress();
    const nfts: WalletNFTData[] = [];

    for (const tokenId of TICKET_TYPES) {
        const balance: bigint = await contract.balanceOf(walletAddress, tokenId);
        console.log(`Balance for token ID ${tokenId}: ${balance}`);
        if (balance > 0) {
            const tokenURI: string = await contract.uri(tokenId);
            const tokenData: WalletNFTData = await fetch(formatIPFSUrl(tokenURI)).then(res => res.json());
            nfts.push({
                id: tokenId.toString(),
                name: tokenData.name,
                description: tokenData.description,
                image: formatIPFSUrl(tokenData.image),
                quantity: balance.toString(),
            });
        }
    }

    return nfts;
}