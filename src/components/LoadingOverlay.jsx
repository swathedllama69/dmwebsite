import React from 'react';
import { AnimatedLogo } from './AnimatedLogo';
import { Loader2 } from 'lucide-react';

/**
 * Global Loading Overlay component.
 */
export const LoadingOverlay = () => {
    return (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center transition-opacity duration-500">
            <style jsx="true">{`
                .logo-loading-pulse {
                    animation: pulse-logo 1.5s ease-in-out infinite;
                }
            `}</style>
            <AnimatedLogo size="w-24 h-24" className="logo-loading-pulse mb-4" />
            <div className="flex items-center space-x-2 text-[#CCFF00] font-mono text-sm uppercase tracking-wider">
                <Loader2 className="animate-spin w-4 h-4" />
                <span>Moulding the data...</span>
            </div>
        </div>
    );
};