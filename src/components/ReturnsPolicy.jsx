import React from 'react';
import { RefreshCw, Zap } from 'lucide-react';

export const ReturnsPolicy = () => {
    return (
        <div className="max-w-4xl mx-auto pt-32 pb-16 px-4 font-mono text-white">
            <h1 className="font-display text-5xl uppercase text-[#CCFF00] mb-6 border-b border-[#333] pb-3">
                <RefreshCw size={48} className="inline mr-3" /> Returns Policy
            </h1>

            <p className="text-lg text-gray-300 mb-8">
                Your satisfaction is our priority. We offer a clear and fair policy for returns and exchanges.
            </p>

            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold uppercase text-white mb-3 flex items-center">
                        <Zap size={20} className="mr-2 text-[#CCFF00]" /> Standard Returns
                    </h2>
                    <p className="text-gray-400">
                        You may return standard, unused components in their original packaging within **30 days** of delivery for a full refund or exchange. The customer is responsible for return shipping costs.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold uppercase text-white mb-3">
                        Damaged or Defective Items
                    </h2>
                    <p className="text-gray-400">
                        If your order arrives damaged or if a component is defective, please contact us immediately (within 7 days). We will cover all costs for return shipping and promptly send a replacement or issue a full refund, including original shipping fees.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold uppercase text-white mb-3">
                        Custom Orders
                    </h2>
                    <p className="text-gray-400">
                        Due to the unique and specialized nature of custom moulds and custom-spec components, these items are **non-refundable** unless there is a confirmed manufacturing defect verified by our quality assurance team.
                    </p>
                </div>
            </div>
        </div>
    );
};