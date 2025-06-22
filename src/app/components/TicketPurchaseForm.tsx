import React, {useEffect, useState} from 'react';
import { buyTicket, getPriceTickets } from '@/services/Web3Service';

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
    const [loadingTicketPrices, setLoadingTicketPrices] = useState<boolean>(true);
    const [ticketPrices, setTicketPrices] = useState<Record<TicketType, number>>({} as Record<TicketType, number>);

    useEffect(() => {
        loadTicketPrices();
    }, []);

    const loadTicketPrices = () => {
        setLoadingTicketPrices(true);
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
          setLoadingTicketPrices(false);
        });
      };
    
    const handleBuy = (e: React.FormEvent) => {
        e.preventDefault();
        buyTicket(parseInt(selected), quantity)
          .then(() => {
            setMessage(`Successfully bought ${quantity} ${TICKET_TYPES[selected]} ticket(s)!`);
            setQuantity(1); // Reset quantity after purchase
          })
          .catch(error => {
            console.error("Error buying ticket:", error);
            setMessage("Failed to buy ticket. Please try again.");
          });
      };

  return (
    <>
    {loadingTicketPrices ? (
          <>
            <p className="mt-4 text-lg text-gray-300">Loading ticket prices...</p>
          </>
    ) : (
        <form onSubmit={handleBuy} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-sm">
        <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Ticket Type</label>
            <select
            value={selected}
            onChange={e => setSelected(e.target.value as TicketType)}
            className="block text-gray-700 w-full border rounded py-2 px-3"
            >
            <option value="0">VIP (${ticketPrices[0]})</option>
            <option value="1">Premium (${ticketPrices[1]})</option>
            <option value="2">Regular (${ticketPrices[2]})</option>
            </select>
        </div>
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
            Total: ${((ticketPrices[selected] * 100) * quantity) / 100}
            </p>
        </div>
        <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
        >
            Buy
        </button>
        </form>
    )}
    </>
  );
};

export default TicketPurchaseForm;