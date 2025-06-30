import React from 'react';

type ConnectWalletProps = {
    btnLoginClick: () => void;
};

const ConnectWallet: React.FC<ConnectWalletProps> = ({ btnLoginClick }) => {
    return (
        <>
            <p className="mt-4 text-lg text-gray-300">
                Connect your wallet to buy your tickets.
            </p>
            <div className="text-center mt-6">
                <button
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
                    type="button"
                    onClick={btnLoginClick}>
                    <img src="/wallet.png" width="64" className="pr-3" /> Connect your wallet
                </button>
            </div>
        </>
    );
};

export default ConnectWallet;