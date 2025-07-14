import React, {useEffect, useState} from 'react';
import { buyTicket, getAvailableTicketNFTs, verifyPause } from '../services/Web3Service';

type TicketType = '0' | '1' | '2';
const TICKET_TYPES: Record<TicketType, string> = {
  '0': 'VIP',
  '1': 'Premium',
  '2': 'Regular',
};

type AvailableNFTData = {
    id: string;
    name: string;
    description: string;
    image: string;
    price: string;
    quantity: number;
};

interface TicketPurchaseFormProps {
  setMessage: (message: string) => void;
}

const TicketPurchaseForm: React.FC<TicketPurchaseFormProps> = ({
  setMessage,
}) => {
    const [isPaused, setIsPaused] = useState<boolean>(true);
    const [selected, setSelected] = useState<TicketType>('2');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [nfts, setNfts] = useState<Map<string, AvailableNFTData>>(new Map());

    useEffect(() => {
        loadPauseStatus();
        loadTicketNFTs();
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

    const loadTicketNFTs = async () => {
        setLoading(true);
        try {
            const fetchedNFTs = await getAvailableTicketNFTs();
            setNfts(fetchedNFTs);
        } catch (err) {
            console.error("Error loading ticket NFTs:", err);
            setMessage("Failed to load ticket NFTs.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleBuy = async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage("Buying ticket...");

      try {
        await buyTicket(parseInt(selected), quantity)
        setMessage(`Successfully bought ${quantity} ${TICKET_TYPES[selected]} ticket(s)!`);
      } catch (error) {
        console.error("Error buying ticket:", error);
        setMessage("Failed to buy ticket. Please try again.");
      }  
    };

  if (isPaused) {
    return (
      <div className="uk-alert-warning uk-text-center uk-margin-large-top uk-padding-small" data-uk-alert>
        <span data-uk-icon="icon: ban" className="uk-margin-small-right"></span>
        Ticket sales are currently paused.
      </div>
    )
  }

  return (
    <>
    {loading ? (
        <div className="uk-text-center uk-margin-large-top">
          <div data-uk-spinner="ratio: 2" className="uk-margin-small-bottom"></div>
          <span className="uk-text-lead uk-text-muted">Loading tickets...</span>
        </div>
    ) : (
      <div className="uk-margin-large-top">
        <div className="uk-grid-small uk-child-width-1-1 uk-child-width-1-3@m" data-uk-grid>
          {Array.from(nfts.values()).map(nft => (
            <div key={nft.id}>
              <div
                className={`uk-card uk-card-default uk-card-hover uk-card-body uk-border-rounded uk-box-shadow-medium uk-flex uk-flex-column uk-height-1-1 ${selected === nft.id ? 'uk-card-primary' : ''}`}
                style={{ cursor: nft.quantity > 0 ? 'pointer' : 'not-allowed', opacity: nft.quantity === 0 ? 0.5 : 1 }}
                onClick={() => nft.quantity > 0 && setSelected(nft.id as TicketType)}
                tabIndex={0}
                role="button"
                aria-pressed={selected === nft.id}
                aria-disabled={nft.quantity === 0}
              >
                <div className="uk-flex uk-flex-center uk-margin-small-bottom">
                  <img
                    src={nft.image}
                    alt={`${TICKET_TYPES[nft.id as TicketType]} NFT`}
                    className="uk-border-circle"
                    style={{ width: 80, height: 80, objectFit: 'contain', filter: nft.quantity === 0 ? 'grayscale(1)' : undefined }}
                  />
                </div>
                <h3 className="uk-card-title uk-text-center uk-margin-remove-bottom">{TICKET_TYPES[nft.id as TicketType]}</h3>
                <p className="uk-text-center uk-text-lead uk-margin-remove">{nft.price} ETH</p>
                <p className="uk-text-center uk-text-meta uk-margin-small">{nft.quantity > 0 ? `${nft.quantity} available` : 'Sold out'}</p>
                {nft.quantity > 0 && (
                  <button
                    className={`uk-button uk-button-small uk-button-${selected === nft.id ? 'primary' : 'default'} uk-width-1-1 uk-margin-small-top`}
                    type="button"
                    aria-pressed={selected === nft.id}
                    onClick={e => {
                      e.stopPropagation();
                      setSelected(nft.id as TicketType);
                    }}
                  >
                    {selected === nft.id ? 'Selected ✓' : 'Select'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <form
          onSubmit={handleBuy}
          className="uk-form-stacked uk-card uk-card-default uk-card-body uk-border-rounded uk-box-shadow-medium uk-width-1-1 uk-width-1-2@m uk-margin-auto uk-margin-large-top"
        >
          <div className="uk-margin">
            <label className="uk-form-label">Quantity</label>
            <div className="uk-form-controls">
              <input
                type="number"
                min={1}
                max={10}
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="uk-input"
                style={{ fontWeight: 600 }}
              />
            </div>
          </div>
          <div className="uk-margin uk-card uk-card-small uk-card-body uk-background-muted uk-border-rounded">
            <div className="uk-flex uk-flex-between uk-margin-small-bottom">
              <span>Ticket Type:</span>
              <span className="uk-text-bold">{TICKET_TYPES[selected]}</span>
            </div>
            <div className="uk-flex uk-flex-between uk-margin-small-bottom">
              <span>Price per ticket:</span>
              <span className="uk-text-bold">{nfts.get(selected)?.price} ETH</span>
            </div>
            <div className="uk-flex uk-flex-between uk-margin-small-bottom">
              <span>Quantity:</span>
              <span className="uk-text-bold">{quantity}</span>
            </div>
            <hr className="uk-divider-icon" />
            <div className="uk-flex uk-flex-between uk-text-lead">
              <span>Total:</span>
              <span className="uk-text-primary">{((Number(nfts.get(selected)?.price) * 100) * quantity) / 100} ETH</span>
            </div>
          </div>
          <button
            type="submit"
            className="uk-button uk-button-primary uk-width-1-1 uk-margin-top"
          >
            <span data-uk-icon="icon: credit-card" className="uk-margin-small-right"></span>
            Buy
          </button>
        </form>
      </div>
    )}
    </>
  );
};

export default TicketPurchaseForm;