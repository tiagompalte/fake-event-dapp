import React, { useEffect, useState } from 'react';
import { getTicketNFTs } from '@/services/Web3Service';

const TicketNFTsPage: React.FC = () => {
    const [nfts, setNfts] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadTicketNFTs();
    }, []);

    const loadTicketNFTs = async () => {
        setLoading(true);
        try {
            const fetchedNFTs = await getTicketNFTs();
            setNfts(fetchedNFTs);
        } catch (err) {
            console.error("Error loading ticket NFTs:", err);
            setError("Failed to load ticket NFTs.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p className="mt-4 text-lg text-gray-300">Loading ticket NFTs...</p>;
    }

    if (error) {
        return <p className="mt-4 text-lg text-red-500">{error}</p>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Your Ticket NFTs</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nfts.map((nft, index) => (
                    <div key={index} className="border rounded p-4">
                        <h2 className="font-bold">{nft.name}</h2>
                        <p>Ticket Type: {nft.ticketType}</p>
                        <p>Owner: {nft.owner}</p>
                        <p>Token ID: {nft.tokenId}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TicketNFTsPage;