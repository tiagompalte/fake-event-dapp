import { ethers, Contract, TransactionResponse } from "ethers";
import ABI from "./ABI.json";
import QRCode from "qrcode";

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

export async function verifyPause(): Promise<boolean> {
    if (!window.ethereum) throw new Error(`Wallet not found!`);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const isPaused: boolean = await contract.paused();
    return isPaused;
}

export async function buyTicket(ticketID: number, quantity: number) : Promise<void> {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    
    const signer = await provider.getSigner();
    const instance = contract.connect(signer) as Contract;

    const price: bigint = await contract.tokenPrices(ticketID);

    const value = price * ethers.toBigInt(quantity);

    const tx = await instance.mint(ticketID, quantity, { value }) as TransactionResponse;

    await tx.wait();
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
    quantity: number;
};

function formatIPFSUrl(url: string): string {
    if (url.startsWith("ipfs://")) {
        return `https://ipfs.io/ipfs/${url.slice(7)}`;
    }
    return url;
}

async function getIPFSInfo(contract: ethers.Contract, tokenId: number): Promise<AvailableNFTData> {
    const tokenURI = await contract.uri(tokenId)
    const response = await fetch(formatIPFSUrl(tokenURI));
    if (!response.ok) {
        throw new Error(`Failed to fetch token data from IPFS: ${response.statusText}`);
    }
    return response.json();
}

export async function getAvailableTicketNFTs(): Promise<Map<string, AvailableNFTData>> {
    if (!window.ethereum) throw new Error(`Wallet not found!`);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const nfts = new Map<string, AvailableNFTData>();

    for (const tokenId of TICKET_TYPES) {
        const [tokenData, price, quantity] = await Promise.all([
            getIPFSInfo(contract, tokenId),
            contract.tokenPrices(tokenId),
            contract.availableSupply(tokenId)
        ])

        nfts.set(tokenId.toString(), {
            id: tokenId.toString(),
            name: tokenData.name,
            description: tokenData.description,
            image: formatIPFSUrl(tokenData.image),
            price: ethers.formatEther(price),
            quantity: ethers.toNumber(quantity)
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

export async function generateTicketQRCode(ticketId: number, quantity: number): Promise<string> {
    if (!window.ethereum) throw new Error(`Wallet not found!`);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const date = Date.now();

    const message : any = {
        ticketId,
        quantity,
        address,
        date,
    }

    message.signature = await signer.signMessage(JSON.stringify(message));

    const qrData = JSON.stringify(message);

    return QRCode.toDataURL(qrData);
}
