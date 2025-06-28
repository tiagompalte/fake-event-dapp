import React, { useEffect, useState } from 'react';
import { getNFTsByWallet } from '@/services/Web3Service';

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
            const fetchedNFTs = await getNFTsByWallet();
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
                        {nft.image && (
                            <img src={nft.image} alt={nft.name} className="w-full h-40 object-cover mb-2 rounded" />
                        )}
                        <h2 className="font-bold text-lg mb-1">{nft.name}</h2>
                        <p className="mb-1">Description: {nft.description}</p>
                        <p className="mb-1">Quantity: {nft.quantity ?? 1}</p>
                        <button
                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            onClick={() => {/* TODO: Implement QR code generation */}}
                        >
                            Generate QR Code
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TicketNFTsPage;