import React, { useEffect, useState } from 'react';
import { getNFTsByWallet, generateTicketQRCode } from '@/services/Web3Service';

const TicketNFTsPage: React.FC = () => {
    const [nfts, setNfts] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showQrModal, setShowQrModal] = useState(false);
    const [qrCodeData, setQrCodeData] = useState<string | null>(null);

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

    const handleGenerateQRCode = async (ticketId: number) => {
        try {
            const qrCodeDataUrl = await generateTicketQRCode(ticketId, 1);
            setQrCodeData(qrCodeDataUrl);
            setShowQrModal(true);
        } catch (err) {
            console.error("Error generating QR code:", err);
            setError("Failed to generate QR code.");
        }
    };

    return (
        <>
        {showQrModal && qrCodeData && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded-lg p-6 shadow-lg relative">
                    <button
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowQrModal(false)}
                    >
                        &times;
                    </button>
                    <h3 className="text-lg font-bold mb-4">Ticket QR Code</h3>
                    <img src={qrCodeData} alt="Ticket QR Code" className="mx-auto mb-4" />
                </div>
            </div>
        )}
        {nfts.length === 0 && (
            <p className="mt-4 text-lg text-gray-300">No ticket NFTs found in your wallet.</p>
        )}
        {nfts.length > 0 && (
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
                                onClick={e => {
                                    e.stopPropagation();
                                    handleGenerateQRCode(nft.id);
                                }}
                            >
                                Generate QR Code
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}
        </>
    );
};

export default TicketNFTsPage;