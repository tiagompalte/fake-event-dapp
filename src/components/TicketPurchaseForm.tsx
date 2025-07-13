import React, {useEffect, useState} from 'react';
import { buyTicket, getAvailableTicketNFTs, AvailableNFTData, verifyPause } from '@/services/Web3Service';
import { ethers } from 'ethers';

type TicketType = '0' | '1' | '2';
const TICKET_TYPES: Record<TicketType, string> = {
  '0': 'VIP',
  '1': 'Premium',
  '2': 'Regular',
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
      <>
        <p className="mt-4 text-lg text-gray-300">
          Ticket sales are currently paused.
        </p>
      </>
    )
  }

  return (
    <>
    {loading ? (
        <p className="mt-4 text-lg text-gray-300">Loading...</p>
    ) : (
      <div className="flex flex-col gap-8 items-start justify-center my-8">
        <div className="flex flex-row flex-wrap gap-6 w-full md:flex-nowrap md:justify-start justify-center">
          {Array.from(nfts.values()).map(nft => (
        <div
          key={nft.id}
          className={`relative border-2 rounded-lg shadow-lg p-6 w-80 cursor-pointer transition-all ${
          selected === nft.id
            ? 'border-blue-600 ring-2 ring-blue-400'
            : 'border-gray-200 hover:border-blue-400'
          } bg-white`}
          onClick={() => nft.quantity > 0 && setSelected(nft.id as TicketType)}
          tabIndex={0}
          role="button"
          aria-pressed={selected === nft.id}
          onKeyUp={e => {
          if ((e.key === 'Enter' || e.key === ' ') && nft.quantity > 0) setSelected(nft.id as TicketType);
          }}
          aria-disabled={nft.quantity === 0}
        >
          <div className="flex justify-center mb-4">
          <img
            src={nft.image}
            alt={`${TICKET_TYPES[nft.id as TicketType]} NFT`}
            className="h-32 w-32 object-contain rounded"
            loading="lazy"
            style={nft.quantity === 0 ? { filter: 'grayscale(1)', opacity: 0.5 } : {}}
          />
          </div>
          <div className="text-center">
          <h3 className="text-xl text-gray-700 font-bold mb-2">{TICKET_TYPES[nft.id as TicketType]}</h3>
          <p className="text-gray-700 mb-2">{nft.price} ETH</p>
          {nft.quantity === 0 ? (
            <span className="inline-block mt-2 px-4 py-2 rounded font-semibold bg-gray-300 text-gray-600 cursor-not-allowed">
            Sold out
            </span>
          ) : (
            <button
            className={`mt-2 px-4 py-2 rounded font-semibold ${
          selected === nft.id
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-blue-100'
            }`}
            onClick={e => {
          e.stopPropagation();
          setSelected(nft.id as TicketType);
            }}
            type="button"
            aria-pressed={selected === nft.id}
            >
            {selected === nft.id ? 'Selected' : 'Select'}
            </button>
          )}
          </div>
          {nft.quantity === 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Sold out
          </div>
          )}
        </div>
          ))}
        </div>
        <div className="flex justify-center items-center w-full">
          <form
        onSubmit={handleBuy}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-sm"
          >
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Quantity</label>
          <input
            type="number"
            min={1}
            max={10}
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            className="block text-gray-700 w-full border rounded py-2 px-3"
          />
        </div>
        <div className="mb-4">
          <p className="text-gray-700 font-bold mb-2">
            Total: {((Number(nfts.get(selected)?.price) * 100) * quantity) / 100} ETH
          </p>
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
        >
          Buy
        </button>
          </form>
        </div>
      </div>
    )}
    </>
  );
};

export default TicketPurchaseForm;