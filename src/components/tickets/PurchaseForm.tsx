// components/tickets/PurchaseForm.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';

interface PurchaseFormProps {
    ticketAmount: string;
    ticketPrice: string;
    loading: boolean;
    onAmountChange: (amount: string) => void;
    onPurchase: () => void;
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({
    ticketAmount,
    ticketPrice,
    loading,
    onAmountChange,
    onPurchase
}) => {
    const totalPrice = (parseFloat(ticketPrice) * parseFloat(ticketAmount)).toFixed(4);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Purchase Tickets</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Number of Tickets
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={ticketAmount}
                            onChange={(e) => onAmountChange(e.target.value)}
                            className="w-full p-2 border rounded-md"
                        />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                            <span>Price per ticket:</span>
                            <span>{ticketPrice} BTTC</span>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span>Total Price:</span>
                            <span>{totalPrice} BTTC</span>
                        </div>
                    </div>

                    <button
                        onClick={onPurchase}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700
                     disabled:bg-blue-300 disabled:cursor-not-allowed transition-all
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : 'Purchase Tickets'}
                    </button>
                </div>
            </CardContent>
        </Card>
    );
};
