'use client';

import { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { createCoinbaseWalletSDK } from '@coinbase/wallet-sdk';

// 1. Define what data is available globally
interface WalletContextType {
  address: string;
  setAddress: (addr: string) => void;
  cbProvider: any;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState('');

  // 2. Initialize SDK only once
  const sdk = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return createCoinbaseWalletSDK({
      appName: 'Base App',
      appLogoUrl: 'https://example.com/logo.png',
      preference: { options: 'all' },
    });
  }, []);

  // 3. Get the Provider
  const cbProvider = useMemo(() => sdk?.getProvider() || null, [sdk]);

  return (
    <WalletContext.Provider value={{ address, setAddress, cbProvider }}>
      {children}
    </WalletContext.Provider>
  );
}

// 4. Custom hook for easy access
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used within WalletProvider");
  return context;
};