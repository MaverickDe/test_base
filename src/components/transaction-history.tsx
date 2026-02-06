'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft, Clock, Loader2 } from 'lucide-react';

interface Transaction {
    id: string;
    type: 'send' | 'receive' | 'swap' | 'fee';
    asset: string;
    amount: string;
    date: string;
    status: 'completed' | 'pending' | 'failed';
}

interface TransactionHistoryProps {
    transactions?: Transaction[];
}

export default function TransactionHistory({ transactions = [] }: TransactionHistoryProps) {
    if (transactions.length === 0) {
        return (
            <div className="w-full text-center py-8 bg-white/5 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-gray-400 text-sm">No recent activity</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-white font-medium text-sm">Recent Activity</h3>
                <button className="text-xs text-[#0052FF] font-medium hover:text-[#004ada] transition-colors">
                    View All
                </button>
            </div>

            <div className="space-y-3">
                {transactions.map((tx,index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-white
                                ${tx.type === 'receive' ? 'bg-green-500/20 text-green-500' :
                                    tx.type === 'send' ? 'bg-red-500/20 text-red-500' :
                                        tx.type === 'fee' ? 'bg-orange-500/20 text-orange-500' :
                                            'bg-blue-500/20 text-blue-500'}
                            `}>
                                {tx.type === 'receive' && <ArrowDownLeft className="w-4 h-4" />}
                                {tx.type === 'send' && <ArrowUpRight className="w-4 h-4" />}
                                {tx.type === 'swap' && <ArrowRightLeft className="w-4 h-4" />}
                                {tx.type === 'fee' && <ArrowUpRight className="w-4 h-4" />}
                            </div>
                            <div className="text-left">
                                <p className="text-white font-medium text-sm">
                                    {tx.type === 'receive' ? 'Received' :
                                        tx.type === 'send' ? 'Sent' :
                                            tx.type === 'fee' ? 'Network Fee' : 'Swapped'} {tx.asset}
                                </p>
                                <p className="text-gray-500 text-xs">{tx.date}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`text-sm font-medium 
                            ${(tx as any).wType ? 'text-green-400' :'text-white' 
                                // tx.amount.startsWith('-') ? 'text-white' : 'text-gray-300'
                                }`}>
                                {tx.amount} {tx.type !== 'swap' && tx?.asset}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">{tx.status}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
