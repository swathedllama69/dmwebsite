import React from 'react';
import { Truck, Clock, Package } from 'lucide-react';

export const ShippingPolicy = () => {
    return (
        <div className="max-w-4xl mx-auto pt-32 pb-16 px-4 font-mono text-white">
            <h1 className="font-display text-5xl uppercase text-[#CCFF00] mb-6 border-b border-[#333] pb-3">
                <Truck size={48} className="inline mr-3" /> Shipping Policy
            </h1>

            <p className="text-lg text-gray-300 mb-8">
                We are committed to delivering your precision components efficiently and securely worldwide.
            </p>

            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold uppercase text-white mb-3 flex items-center">
                        <Clock size={20} className="mr-2 text-[#CCFF00]" /> Processing Time
                    </h2>
                    <p className="text-gray-400">
                        Standard orders are processed and shipped within 1-2 business days. Custom or large-volume mould fabrication orders may require 5-10 business days for production before shipment.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold uppercase text-white mb-3">
                        Delivery Options & Rates
                    </h2>
                    <ul className="list-disc list-inside text-gray-400 pl-4 space-y-2">
                        <li>**Standard (3-7 Business Days):** Calculated at checkout based on weight and destination.</li>
                        <li>**Express (1-2 Business Days):** Flat rate for rapid turnaround, available only for in-stock components.</li>
                        <li>**International:** Rates and delivery times vary (typically 7-21 days), subject to customs clearance.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-bold uppercase text-white mb-3 flex items-center">
                        <Package size={20} className="mr-2 text-[#CCFF00]" /> Tracking
                    </h2>
                    <p className="text-gray-400">
                        All shipments include tracking information, which will be emailed to you upon dispatch. Please allow up to 24 hours for the tracking link to become active.
                    </p>
                </div>
            </div>
        </div>
    );
};