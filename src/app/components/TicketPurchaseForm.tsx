import React, {useEffect, useState} from 'react';
import { buyTicket, getPriceTickets, getAvailableTicketNFTs, AvailableNFTData, waitForTransaction } from '@/services/Web3Service';

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
    const [selected, setSelected] = useState<TicketType>('2');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [ticketPrices, setTicketPrices] = useState<Record<TicketType, number>>({} as Record<TicketType, number>);
    const [nfts, setNfts] = useState<AvailableNFTData[]>([]);

    useEffect(() => {
        loadTicketPrices();
        loadTicketNFTs();
    }, []);

    const loadTicketPrices = () => {
        setLoading(true);
        getPriceTickets().then(prices => {
          setTicketPrices({
            '0': parseFloat(prices[0]),
            '1': parseFloat(prices[1]),
            '2': parseFloat(prices[2]),
          });
        }).catch(error => {
          console.error("Error loading ticket prices:", error);
          setMessage("Failed to load ticket prices.");
        }).finally(() => {
          setLoading(false);
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
      setLoading(true);
      setMessage("Buying ticket...");

      try {
        const txHash = await buyTicket(parseInt(selected), quantity)
        if (txHash === null) {
          setMessage("Failed to buy ticket. Please try again.");
          return;
        }

        const transactionIsDone = await waitForTransaction(txHash)
        if (!transactionIsDone) {
          setMessage("Transaction failed or timed out. Please try again.");
          return;
        }

        setMessage(`Successfully bought ${quantity} ${TICKET_TYPES[selected]} ticket(s)!`);
      } catch (error) {
        console.error("Error buying ticket:", error);
        setMessage("Failed to buy ticket. Please try again.");
      } finally {
        setLoading(false);
      }     
    };

  return (
    <>
    {loading ? (
        <p className="mt-4 text-lg text-gray-300">Loading...</p>
    ) : (
      <div className="flex flex-col gap-8 items-start justify-center my-8">
        <div className="flex flex-row gap-6">
          {nfts.map(nft => (
            <div
              key={nft.id}
              className={`relative border-2 rounded-lg shadow-lg p-6 w-80 cursor-pointer transition-all ${
                selected === nft.id
                  ? 'border-blue-600 ring-2 ring-blue-400'
                  : 'border-gray-200 hover:border-blue-400'
              } bg-white`}
              onClick={() => setSelected(nft.id as TicketType)}
            >
              {/* NFT Image Placeholder */}
              <div className="flex justify-center mb-4">
                <img
                  src={nft.image}
                  alt={`${TICKET_TYPES[nft.id as TicketType]} NFT`}
                  className="h-32 w-32 object-contain rounded"
                />
              </div>
              <div className="text-center">
                <h3 className="text-xl text-gray-700 font-bold mb-2">{TICKET_TYPES[nft.id as TicketType]}</h3>
                <p className="text-gray-700 mb-2">{nft.price} ETH</p>
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
                >
                  {selected === nft.id ? 'Selected' : 'Select'}
                </button>
              </div>
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
                Total: {((ticketPrices[selected] * 100) * quantity) / 100} ETH
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