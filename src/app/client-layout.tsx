// app/client-layout.tsx (Client Component)
'use client';

import { PrivyProvider } from "@privy-io/react-auth";
import { defineChain } from 'viem';

const BitTorrent = defineChain({
    id: 1029,
    name: "BitTorrent Chain Testnet",
    network: "BitTorrent Chain Testnet",
    nativeCurrency: {
        decimals: 18,
        name: 'BitTorrent Chain Testnet',
        symbol: 'BTTC',
    },
    rpcUrls: {
        default: {
            http: ['https://pre-rpc.bt.io/']
        }
    },
    blockExplorers: {
        default: {
            name: 'Explorer',
            url: 'https://testscan.bt.io/'
        }
    }
});

export default function ClientLayout({ children }: {
    children: React.ReactNode;
}) {
    return (
        <PrivyProvider
            appId="cm6qrmvfp00z8uyepxhokh2mc"
            config={{
                appearance: {
                    theme: 'light',
                    accentColor: '#676FFF',
                    logo: 'https://your-logo-url',
                },
                // Create embedded wallets for users who don't have a wallet
                embeddedWallets: {
                    createOnLogin: 'users-without-wallets',
                },
                defaultChain: BitTorrent,
                supportedChains: [BitTorrent],
            }}
        >
            {children}
        </PrivyProvider>
    );
}
