import React, { useEffect, useState } from 'react';
import { getNFTsByWallet, generateTicketQRCode } from '../services/Web3Service';

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
        {/* UIkit Modal for QR Code */}
        {showQrModal && qrCodeData && (
            <div className="uk-modal uk-open" style={{display: 'block', background: 'rgba(0,0,0,0.5)'}}>
                <div className="uk-modal-dialog uk-modal-body uk-border-rounded uk-box-shadow-large" style={{maxWidth: 350}}>
                    <button
                        className="uk-modal-close-default uk-icon uk-close"
                        type="button"
                        aria-label="Close"
                        onClick={() => setShowQrModal(false)}
                        style={{position: 'absolute', top: 10, right: 10}}
                    >
                        &times;
                    </button>
                    <h3 className="uk-modal-title uk-text-center uk-margin">Ticket QR Code</h3>
                    <img src={qrCodeData} alt="Ticket QR Code" className="uk-align-center uk-margin" style={{maxWidth: 200}} />
                </div>
            </div>
        )}
        {nfts.length === 0 && (
            <p className="uk-text-center uk-text-muted uk-margin-large-top uk-text-lead">No ticket NFTs found in your wallet.</p>
        )}
        {nfts.length > 0 && (
            <div className="uk-container uk-margin-top">
                <h1 className="uk-heading-line uk-text-center"><span>Your Ticket NFTs</span></h1>
                <div
                    className="uk-grid uk-child-width-1-1 uk-child-width-1-2@s uk-child-width-1-3@l uk-grid-small uk-grid-match"
                    data-uk-grid
                >
                    {nfts.map((nft, index) => (
                        <div key={index}>
                            <div className="uk-card uk-card-default uk-card-hover uk-card-body uk-border-rounded uk-box-shadow-medium uk-flex uk-flex-column" style={{height: '100%'}}>
                                {nft.image && (
                                    <img src={nft.image} alt={nft.name} className="uk-border-rounded uk-margin-small-bottom" style={{width: '100%', height: 180, objectFit: 'cover'}} />
                                )}
                                <h2 className="uk-card-title uk-margin-small-bottom">{nft.name}</h2>
                                <p className="uk-text-small uk-margin-remove">{nft.description}</p>
                                <p className="uk-text-meta uk-margin-remove-top">Quantity: <span className="uk-text-bold">{nft.quantity ?? 1}</span></p>
                                <button
                                    className="uk-button uk-button-primary uk-width-1-1 uk-margin-small-top"
                                    onClick={e => {
                                        e.stopPropagation();
                                        handleGenerateQRCode(nft.id);
                                    }}
                                >
                                    <span data-uk-icon="icon: qrcode" className="uk-margin-small-right"></span>
                                    Generate QR Code
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
        </>
    );
};

export default TicketNFTsPage;