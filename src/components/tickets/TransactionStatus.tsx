// components/tickets/TransactionStatus.tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import React from 'react';

interface TransactionStatusProps {
    error?: string;
    success?: string;
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({ error, success }) => {
    if (!error && !success) return null;

    return error ? (
        <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    ) : (
        <Alert className="bg-green-50 border-green-200">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
        </Alert>
    );
};
