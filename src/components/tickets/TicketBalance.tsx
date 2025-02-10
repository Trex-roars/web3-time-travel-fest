import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';

interface TicketBalanceProps {
    balance: string;
    address: string;
}

export const TicketBalance: React.FC<TicketBalanceProps> = ({ balance, address }) => (
    <Card>
        <CardHeader>
            <CardTitle>Your Ticket Balance</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col space-y-2">
                <div className="text-3xl font-bold text-blue-600">{balance} Tickets</div>
                <div className="text-sm text-gray-500 truncate">
                    Wallet: {address}
                </div>
            </div>
        </CardContent>
    </Card>
);
