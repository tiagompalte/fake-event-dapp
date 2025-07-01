'use client';

import React, { useEffect, useState } from 'react';
import {login} from '@/services/Web3Service';
import ConnectWallet from '@components/ConnectWallet';
import DisconnectWallet from '@components/DisconnectWallet';
import MessageDisplay from '@components/MessageDisplay';
import TicketPurchaseForm from '@components/TicketPurchaseForm';
import TicketNFTsPage from '@components/TicketNFTsPage';

export default function BuyTicketsPage() {
  const [wallet, setWallet] = useState<string>("");
  const [message, setMessage] = useState('');
  const [selectedTab, setSelectedTab] = useState<'buy' | 'my'>('buy');

  useEffect(() => {
    const wallet = localStorage.getItem("wallet");
    if (wallet) {
      setWallet(wallet);
    }
  }, []);  

  const btnLoginClick = () => {
    setMessage("Logging In...");
    login()
        .then(wallet => {
            setWallet(wallet);
            localStorage.setItem("wallet", wallet);
            setMessage("Wallet connected successfully!");
        })
        .catch(err => setMessage(err.message));
    }

    const btnLogoutClick = () => {
      setMessage("Logging Out...");
      setWallet("");
      localStorage.removeItem("wallet");
      setMessage("");
    }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      { !wallet ? (
        <ConnectWallet btnLoginClick={btnLoginClick} />
    ) : (
      <>
        <div className="max-h-md mt-4">
          <div className="flex border-b border-gray-700 mb-4">
            <button
              className={`flex-1 py-2 px-4 text-center border-b-2 ${selectedTab === 'buy' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400'}`}
              onClick={() => setSelectedTab('buy')}
              disabled={selectedTab === 'buy'}
            >
              Buy Tickets
            </button>
            <button
              className={`flex-1 py-2 px-4 text-center border-b-2 ${selectedTab === 'my' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400'}`}
              onClick={() => setSelectedTab('my')}
              disabled={selectedTab === 'my'}
            >
              My Tickets
            </button>
          </div>
          <div>
            {selectedTab === 'buy' && (
              <TicketPurchaseForm setMessage={setMessage} />
            )}
            {selectedTab === 'my' && (
              <TicketNFTsPage />
            )}
          </div>
        </div>
        <DisconnectWallet btnLogoutClick={btnLogoutClick} />
      </>
    )}
    <MessageDisplay message={message} />
    </main>
  );
}