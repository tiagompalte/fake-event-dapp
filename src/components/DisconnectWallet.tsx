import React from 'react';

interface DisconnectWalletProps {
    btnLogoutClick: () => void;
}

const DisconnectWallet: React.FC<DisconnectWalletProps> = ({ btnLogoutClick }) => {
    return (
        <div className="mt-4">
            <button
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={btnLogoutClick}
            >
            Disconnect Wallet
            </button>
      </div>
    );
};

export default DisconnectWallet;