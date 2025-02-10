// components/tickets/TicketContainer.tsx
'use client';

import { formatEther, getContract, parseEther } from '@/utils';
import { usePrivy } from '@privy-io/react-auth';
import React, { useEffect, useState } from 'react';
import { PurchaseForm } from './PurchaseForm';
import { TicketBalance } from './TicketBalance';
import { TransactionStatus } from './TransactionStatus';

export const TicketContainer: React.FC = () => {
    const [ticketAmount, setTicketAmount] = useState<string>('1');
    const [ticketPrice, setTicketPrice] = useState<string>('0');
    const [userTickets, setUserTickets] = useState<string>('0');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const { user, login } = usePrivy();

    const fetchUserTickets = async () => {
        try {
            if (!user?.wallet?.address) return;

            const contract = await getContract();
            const balance = await contract.getTicketBalance(user.wallet.address);
            setUserTickets(balance.toString());
        } catch (err) {
            console.error('Error fetching ticket balance:', err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const contract = await getContract();
                const price = await contract.ticketPrice();
                setTicketPrice(formatEther(price));
                await fetchUserTickets();
            } catch (err) {
                console.error('Error fetching contract data:', err);
            }
        };

        if (user?.wallet) {
            fetchData();
        }
    }, [user]);

    const handlePurchase = async () => {
        if (!user) {
            login();
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const contract = await getContract();
            const amount = parseInt(ticketAmount);
            const totalPrice = parseEther(ticketPrice) * BigInt(amount);

            const tx = await contract.buyTicket(amount, {
                value: totalPrice
            });

            await tx.wait();
            setSuccess(`Successfully purchased ${amount} tickets!`);
            await fetchUserTickets();
        } catch (err: any) {
            setError(err.message || 'Error purchasing tickets');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="max-w-md mx-auto p-6">
                <button
                    onClick={() => login()}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700
                   transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Connect Wallet
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <TransactionStatus error={error} success={success} />

            <TicketBalance
                balance={userTickets}
                address={user.wallet?.address || ''}
            />

            <PurchaseForm
                ticketAmount={ticketAmount}
                ticketPrice={ticketPrice}
                loading={loading}
                onAmountChange={setTicketAmount}
                onPurchase={handlePurchase}
            />
        </div>
    );
};

export default TicketContainer;
