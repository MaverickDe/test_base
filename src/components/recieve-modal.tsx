// 'use client';

// import { useState, useEffect } from 'react';
// import { X, Copy, Check, ArrowRight, Loader2, Info } from 'lucide-react';
// import { QRCodeCanvas } from 'qrcode.react';
// import { useWallet } from '@/context/base';

// interface ReceiveModalProps {
//     isOpen: boolean;
//     onClose: () => void;
// }

// type Step = 'setup' | 'display';

// export default function ReceiveModal({ isOpen, onClose }: ReceiveModalProps) {
//     const [step, setStep] = useState<Step>('setup');
//     const [amount, setAmount] = useState('');
//     const [selectedCoin, setSelectedCoin] = useState('BNB');
//     const [isCopied, setIsCopied] = useState(false);
//     const [isPending, setIsPending] = useState(false);
//     const [isLoading, setIsLoading] = useState(false);
//     const {address} =useWallet()
// const handleSubmit = async ()=>{
//      try{
// setIsLoading(true)
//             if (
//                 // withdrawalType === 'bank' && 
//                 (!selectedCoin)) return; // Basic validation
//                         let vvv =    await fetch(`/api/withdrawal`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ address:address, amount:Number(amount),
    
//             // reciepientWalletAddress:address,
//             type:"receive",asset:selectedCoin
//            })
//         });
    
//         let vjson = await vvv.json()
    
//         if(vjson?.record?.id){
//             setIsPending(true)
//             setTimeout(()=>{

//                 onClose()
//             },2000)
//             // setUser(vjson?.existingRecord)
//         }
//             // setShowGasModal(true);
//         }catch(e){
// console.log(e)
//         }finally{
//             setIsLoading(false)
// // setWithdrawLoading(false)
//         }

// }
//     // Replace this with your actual deposit address from context or API
//     const walletAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
// let availableCoins = {
//     'BNB': { walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" },
//     'ETH': { walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" },
//     'USDT': { walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" }
// }
//     useEffect(() => {
//         if (!isOpen) {
//             setStep('setup');
//             setAmount('');
//             setIsPending(false);
//         }
//     }, [isOpen]);

//     const handleCopy = () => {
//         navigator.clipboard.writeText(availableCoins[selectedCoin]?.walletAddress || walletAddress);
//         setIsCopied(true);
//         setTimeout(() => setIsCopied(false), 2000);
//     };

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
//             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

//             <div className="absolute bottom-0 left-0 right-0 w-full bg-[#0a0b0d] border-t border-[#0052FF]/30 rounded-t-[2rem] p-6 animate-slide-up text-white shadow-2xl pb-10 max-w-lg mx-auto md:relative md:rounded-[2rem] md:border md:bottom-auto">
                
//                 <div className="flex items-center justify-between mb-6">
//                     <h2 className="text-lg font-bold">{step === 'setup' ? 'Receive' : 'Scan QR Code'}</h2>
//                     <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-gray-800/50 rounded-full text-gray-400">
//                         <X className="w-5 h-5" />
//                     </button>
//                 </div>

//                 {step === 'setup' ? (
//                     <div className="space-y-5">
//                         <div>
//                             <label className="block text-xs font-medium text-gray-400 mb-2">Select Asset</label>
//                             <div className="grid grid-cols-3 gap-2">
//                                 {Object.keys(availableCoins).map((coin) => (
//                                     <button
//                                         key={coin}
//                                         onClick={() => setSelectedCoin(coin)}
//                                         className={`py-3 rounded-xl border transition-all text-xs font-bold ${
//                                             selectedCoin === coin 
//                                             ? 'border-[#0052FF] bg-[#0052FF]/10 text-white' 
//                                             : 'border-white/5 bg-[#1E2025] text-gray-400 hover:text-white'
//                                         }`}
//                                     >
//                                         {coin}
//                                     </button>
//                                 ))}
//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-xs font-medium text-gray-400 mb-2">Amount</label>
//                             <div className="relative">
//                                 <input
//                                     type="number"
//                                     value={amount}
//                                     onChange={(e) => setAmount(e.target.value)}
//                                     placeholder="0.00"
//                                     className="w-full px-4 py-4 bg-[#1E2025] border border-white/5 rounded-2xl focus:border-[#0052FF] focus:outline-none text-white"
//                                 />
//                                 <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">{selectedCoin}</span>
//                             </div>
//                         </div>

//                         <button
//                             onClick={() => setStep('display')}
//                             className="w-full bg-[#0052FF] hover:bg-[#004ada] py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all"
//                         >
//                             Next <ArrowRight className="w-4 h-4" />
//                         </button>
//                     </div>
//                 ) : (
//                     <div className="flex flex-col items-center space-y-6">
//                         {/* Real Scannable QR Code */}
//                         <div className="bg-white p-4 rounded-3xl shadow-2xl flex items-center justify-center">
//                             <QRCodeCanvas 
//                                 value={availableCoins[selectedCoin]?.walletAddress || '...'} 
//                                 size={180}
//                                 level={"H"} // High error correction
//                                 includeMargin={false}
//                                 imageSettings={{
//                                     src: selectedCoin === 'BNB' ? "https://cryptologos.cc/logos/binance-coin-bnb-logo.png" : "https://cryptologos.cc/logos/ethereum-eth-logo.png",
//                                     height: 30,
//                                     width: 30,
//                                     excavate: true,
//                                 }}
//                             />
//                         </div>

//                         {/* Address Display */}
//                         <div className="w-full space-y-2">
//                             <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 text-center">Your {selectedCoin} Address</label>
//                             <div 
//                                 onClick={()=>{if(availableCoins[selectedCoin]?.walletAddress){

//                                     handleCopy()
//                                 }
                                    
//                                 }}
//                                 className="group flex items-center justify-between w-full p-4 bg-[#1E2025] border border-white/5 rounded-2xl cursor-pointer hover:border-[#0052FF]/40 transition-all"
//                             >
//                                 <span className="text-xs font-mono text-gray-300 truncate mr-2">
//                                     {availableCoins[selectedCoin]?.walletAddress || '...'}
//                                 </span>
//                                 {isCopied ? (
//                                     <Check className="w-4 h-4 text-green-500" />
//                                 ) : (
//                                     <Copy className="w-4 h-4 text-gray-500 group-hover:text-[#0052FF]" />
//                                 )}
//                             </div>
//                         </div>

//                         {/* Action Section */}
//                         <div className="w-full space-y-3">
//                             {!isPending ? (
//                                 <button
//                                 disabled={isLoading}
//                                     onClick={() => handleSubmit()}
//                                     className="w-full bg-white text-black hover:bg-gray-200 py-4 rounded-full font-bold transition-all"
//                                 >
//                                     {isLoading?"proccessing":"I have made payment"}
//                                 </button>
//                             ) : (
//                                 <div className="w-full py-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex flex-col items-center justify-center gap-1">
//                                     <div className="flex items-center gap-2">
//                                         <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
//                                         <span className="text-yellow-500 font-bold text-sm">Verification Pending</span>
//                                     </div>
//                                     <p className="text-[10px] text-yellow-500/60">Checking network for incoming {selectedCoin}...</p>
//                                 </div>
//                             )}
//                         </div>

//                         <div className="flex items-start gap-3 p-3 bg-red-500/5 rounded-xl border border-red-500/10">
//                             <Info className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
//                             <p className="text-[10px] text-gray-400">
                           
//                                 Send only <span className="text-white font-bold">{selectedCoin}</span> via the <span className="text-white font-bold">BEP20 / ERC20</span> network. Other assets will be lost.
//                             </p>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Copy, Check, ArrowRight, Loader2, Info } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useWallet } from '@/context/base';

interface ReceiveModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Step = 'setup' | 'display';

export default function ReceiveModal({ isOpen, onClose }: ReceiveModalProps) {
    const [step, setStep] = useState<Step>('setup');
    const [amount, setAmount] = useState('');
    const [selectedNetwork, setSelectedNetwork] = useState<'BNB' | 'ETH'>('BNB');
    const [selectedCoin, setSelectedCoin] = useState('BNB');
    const [isCopied, setIsCopied] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { address: userAddress } = useWallet();

    const networks = {
        BNB: { 
            name: 'BNB Smart Chain', 
            icon: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png', 
            symbol: 'BEP20',
            walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" 
        },
        ETH: { 
            name: 'Ethereum', 
            icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', 
            symbol: 'ERC20',
            walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" 
        }
    };

    const availableCoins = {
        'BNB': { 
            walletAddress: null, 
            supportedNetworks: { 
                "BNB": {} // Will use coin walletAddress
            } 
        },
        'ETH': { 
            walletAddress: null, 
            supportedNetworks: { 
                "ETH": {} 
            } 
        },
        'USDT': { 
            walletAddress: null, 
            supportedNetworks: { 
                "BNB": {}, 
                "ETH": {} 
            } 
        },
        'USDC': { 
            walletAddress: null, 
            supportedNetworks: { 
                "BNB": {} // Will fallback to networks.BNB.walletAddress
            } 
        }
    };

    // Address Hierarchy Logic
    const activeDepositAddress = useMemo(() => {
        const coinData = availableCoins[selectedCoin as keyof typeof availableCoins];
        const networkData = networks[selectedNetwork as keyof typeof networks];
        
        if (!coinData) return networkData?.walletAddress || "";

        const networkConfig : any= coinData.supportedNetworks[selectedNetwork as keyof typeof coinData.supportedNetworks];

        // 1. Check for specific address object: { BNB: { address: "0x..." } }
        if (networkConfig && 'address' in networkConfig && networkConfig.address) {
            return networkConfig.address;
        }

        // 2. Fallback to coin global: walletAddress: "0x..."
        if (coinData.walletAddress) {
            return coinData.walletAddress;
        }

        // 3. Final fallback to network global
        return networkData?.walletAddress || "";
    }, [selectedCoin, selectedNetwork]);

    const filteredAssets = useMemo(() => {
        return Object.entries(availableCoins)
            .filter(([_, data]) => Object.keys(data.supportedNetworks).includes(selectedNetwork))
            .map(([symbol]) => symbol);
    }, [selectedNetwork]);

    useEffect(() => {
        if (!filteredAssets.includes(selectedCoin)) {
            setSelectedCoin(filteredAssets[0] || '');
        }
    }, [selectedNetwork, filteredAssets]);

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/withdrawal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address: userAddress,
                    amount: Number(amount),
                    type: "receive",
                    asset: selectedCoin,
                    network: selectedNetwork,
                    depositAddress: activeDepositAddress
                })
            });
            const vjson = await response.json();
            if (vjson?.record?.id) {
                setIsPending(true);
                setTimeout(() => onClose(), 2000);
            }
        } catch (e) {
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setStep('setup');
            setAmount('');
            setIsPending(false);
        }
    }, [isOpen]);

    const handleCopy = () => {
        if (activeDepositAddress) {
            navigator.clipboard.writeText(activeDepositAddress);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="absolute bottom-0 left-0 right-0 w-full bg-[#0a0b0d] border-t border-[#0052FF]/30 rounded-t-[2rem] p-6 animate-slide-up text-white shadow-2xl pb-10 max-w-lg mx-auto md:relative md:rounded-[2rem] md:border md:bottom-auto">
                
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold">{step === 'setup' ? 'Deposit' : 'Address Details'}</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-gray-800/50 rounded-full text-gray-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {step === 'setup' ? (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2">Choose Network Type</label>
                            <div className="grid grid-cols-2 gap-3">
                                {(Object.keys(networks) as Array<keyof typeof networks>).map((net) => (
                                    <button
                                        key={net}
                                        onClick={() => setSelectedNetwork(net)}
                                        className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                                            selectedNetwork === net 
                                            ? 'border-[#0052FF] bg-[#0052FF]/10 text-white' 
                                            : 'border-white/5 bg-[#1E2025] text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        <img src={networks[net].icon} alt={net} className="w-5 h-5" />
                                        <div className="text-left">
                                            <p className="text-xs font-bold">{net}</p>
                                            <p className="text-[10px] opacity-60">{networks[net].symbol}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2">Select Asset</label>
                            <div className="flex flex-wrap gap-2">
                                {filteredAssets.map((coin) => (
                                    <button
                                        key={coin}
                                        onClick={() => setSelectedCoin(coin)}
                                        className={`px-6 py-2.5 rounded-xl border transition-all text-xs font-bold ${
                                            selectedCoin === coin 
                                            ? 'border-[#0052FF] bg-[#0052FF]/10 text-white' 
                                            : 'border-white/5 bg-[#1E2025] text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        {coin}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2">Enter Amount</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-4 py-4 bg-[#1E2025] border border-white/5 rounded-2xl focus:border-[#0052FF] focus:outline-none text-white"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">{selectedCoin}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setStep('display')}
                            className="w-full bg-[#0052FF] hover:bg-[#004ada] py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]"
                        >
                            Generate Address <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-6">
                        <div className="bg-white p-4 rounded-3xl shadow-2xl">
                            <QRCodeCanvas 
                                value={activeDepositAddress} 
                                size={160}
                                level={"H"}
                                imageSettings={{
                                    src: networks[selectedNetwork].icon,
                                    height: 30,
                                    width: 30,
                                    excavate: true,
                                }}
                            />
                        </div>

                        <div className="w-full space-y-2">
                            <p className="text-[10px] uppercase font-bold text-gray-500 text-center tracking-widest">
                                Your {selectedCoin} ({networks[selectedNetwork].symbol}) Address
                            </p>
                            <div 
                                onClick={handleCopy}
                                className="group flex items-center justify-between w-full p-4 bg-[#1E2025] border border-white/5 rounded-2xl cursor-pointer hover:border-[#0052FF]/40 transition-all active:bg-white/5"
                            >
                                <span className="text-xs font-mono text-gray-300 truncate mr-2">
                                    {activeDepositAddress}
                                </span>
                                {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500 group-hover:text-[#0052FF]" />}
                            </div>
                        </div>

                        <div className="w-full space-y-3">
                            {!isPending ? (
                                <button
                                    disabled={isLoading}
                                    onClick={() => handleSubmit()}
                                    className="w-full bg-white text-black hover:bg-gray-200 py-4 rounded-full font-bold transition-all disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-black" /> : "I have made payment"}
                                </button>
                            ) : (
                                <div className="w-full py-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex flex-col items-center justify-center gap-1">
                                    <div className="flex items-center gap-2 text-yellow-500 font-bold text-sm animate-pulse">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Confirming...</span>
                                    </div>
                                    <p className="text-[10px] text-yellow-500/60">Awaiting block confirmation</p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                            <Info className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-[10px] text-gray-400">
                                This address only accepts <span className="text-white font-bold">{selectedCoin}</span> sent via the <span className="text-white font-bold">{networks[selectedNetwork].name} ({networks[selectedNetwork].symbol})</span>.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}