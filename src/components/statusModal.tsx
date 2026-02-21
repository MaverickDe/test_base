'use client';

import { X, CheckCircle2, AlertCircle, LucideIcon } from 'lucide-react';

interface StatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    success: boolean;
    actionLabel?: string;
    onAction?: () => void;
    customLogo?: React.ReactNode;
}

export default function StatusModal({
    isOpen,
    onClose,
    title,
    message,
    success,
    actionLabel,
    onAction,
    customLogo
}: StatusModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-sm bg-[#0a0b0d] border border-white/10 rounded-[2.5rem] p-8 animate-slide-up text-white shadow-2xl">
                
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 w-8 h-8 flex items-center justify-center bg-gray-800/50 hover:bg-gray-700/50 rounded-full transition-colors text-gray-400"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center space-y-6">
                    {/* Icon Section */}
                    <div className="mt-4">
                        {customLogo ? (
                            <div className="w-20 h-20 flex items-center justify-center">
                                {customLogo}
                            </div>
                        ) : success ? (
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                        ) : (
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                                <AlertCircle className="w-10 h-10 text-red-500" />
                            </div>
                        )}
                    </div>

                    {/* Text Content */}
                    <div className="space-y-2">
                        {title && (
                            <h2 className="text-xl font-bold tracking-tight">
                                {title}
                            </h2>
                        )}
                        <p className="text-gray-400 text-sm leading-relaxed px-2">
                            {message}
                        </p>
                    </div>

                    {/* Action Button */}
                    <div className="w-full pt-4">
                        <button
                            onClick={onAction || onClose}
                            className={`w-full py-4 rounded-full font-bold transition-all active:scale-95 shadow-lg ${
                                success 
                                ? 'bg-[#0052FF] hover:bg-[#004ada] shadow-[#0052FF]/20' 
                                : 'bg-white/10 hover:bg-white/20'
                            }`}
                        >
                            {actionLabel || (success ? 'Done' : 'Try Again')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}