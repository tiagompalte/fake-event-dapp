'use client';

import React, { useEffect, useState } from 'react';
import {login, verifyPause} from '@/services/Web3Service';
import ConnectWallet from './components/ConnectWallet';
import DisconnectWallet from './components/DisconnectWallet';
import MessageDisplay from './components/MessageDisplay';
import TicketPurchaseForm from './components/TicketPurchaseForm';

export default function BuyTicketsPage() {
  const [wallet, setWallet] = useState<string>("");
  const [message, setMessage] = useState('');
  const [isPaused, setIsPaused] = useState<boolean>(true);
  

  useEffect(() => {
    const wallet = localStorage.getItem("wallet");
    if (wallet) {
      setWallet(wallet);
      loadPauseStatus();
    }
  }, []);

  const loadPauseStatus = () => {
    verifyPause().then(paused => {
      setIsPaused(paused);
      if (paused) {
        setMessage("Ticket sales are currently paused.");
      } else {
        setMessage("");
      }
    }).catch(error => {
      console.error("Error checking pause status:", error);
      setMessage("Failed to check ticket sales status.");
    });
  };

  const btnLoginClick = () => {
    setMessage("Logging In...");
    login()
        .then(wallet => {
            setWallet(wallet);
            localStorage.setItem("wallet", wallet);
            loadPauseStatus();
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
      { isPaused ? (
        <>
          <p className="mt-4 text-lg text-gray-300">
            Ticket sales are currently paused.
          </p>
        </>
      ) : (
        <TicketPurchaseForm setMessage={setMessage} />
      )}
      <DisconnectWallet btnLogoutClick={btnLogoutClick} />
      </>
    )}
    <MessageDisplay message={message} />
    </main>
  );
}