import { useState, useEffect } from 'react'
import { login } from './services/Web3Service';
import ConnectWallet from './components/ConnectWallet';
import DisconnectWallet from './components/DisconnectWallet';
import TicketPurchaseForm from './components/TicketPurchaseForm';
import TicketNFTsPage from './components/TicketNFTsPage';
import MessageDisplay from './components/MessageDisplay';
import './App.css'

function App() {
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
    <main className="uk-section uk-section-muted min-h-screen flex flex-col justify-center items-center p-2">
      <div className="uk-container uk-container-small uk-card uk-card-default uk-card-body uk-box-shadow-large uk-border-rounded uk-background-default w-full max-w-2xl">
        <h1 className="uk-heading-medium uk-text-center uk-margin-medium-bottom text-3xl font-bold text-primary-700">🎟️ Event Tickets DApp</h1>
        <div className="uk-flex uk-flex-center uk-margin-bottom">
          <button
            className={`uk-button uk-button-primary uk-width-1-2@m uk-margin-small-right ${selectedTab === 'buy' ? '' : 'uk-button-default'}`}
            onClick={() => setSelectedTab('buy')}
            disabled={selectedTab === 'buy'}
            style={{ borderRadius: '8px 0 0 8px' }}
          >
            Buy Tickets
          </button>
          <button
            className={`uk-button uk-button-primary uk-width-1-2@m ${selectedTab === 'my' ? '' : 'uk-button-default'}`}
            onClick={() => setSelectedTab('my')}
            disabled={selectedTab === 'my'}
            style={{ borderRadius: '0 8px 8px 0' }}
          >
            My Tickets
          </button>
        </div>
        <div className="uk-margin">
          {!wallet ? (
            <ConnectWallet btnLoginClick={btnLoginClick} />
          ) : (
            <>
              {selectedTab === 'buy' && <TicketPurchaseForm setMessage={setMessage} />}
              {selectedTab === 'my' && <TicketNFTsPage />}
              <div className="uk-margin-top uk-text-center">
                <DisconnectWallet btnLogoutClick={btnLogoutClick} />
              </div>
            </>
          )}
        </div>
        <MessageDisplay message={message} />
      </div>
    </main>
  );
}

export default App
