import React from 'react';
import { Factory, Zap } from 'lucide-react';

export const AboutUs = () => {
    return (
        <div className="max-w-4xl mx-auto pt-32 pb-16 px-4 font-mono text-white">
            <h1 className="font-display text-5xl uppercase text-[#CCFF00] mb-6 border-b border-[#333] pb-3">
                <Factory size={48} className="inline mr-3" /> About Devolt Mould
            </h1>

            <p className="text-lg text-gray-300 mb-8">
                We are pioneers in precision plastic injection moulding, dedicated to delivering highly accurate and durable components. Our commitment to cutting-edge technology and rigorous quality control sets the industry standard.
            </p>

            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold uppercase text-white mb-3 flex items-center">
                        <Zap size={20} className="mr-2 text-[#CCFF00]" /> Our Mission
                    </h2>
                    <p className="text-gray-400">
                        To empower our clients with superior polymer solutions, offering fast turnaround times and unparalleled dimensional accuracy. We translate complex designs into flawless physical products.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold uppercase text-white mb-3">
                        Technology & Precision
                    </h2>
                    <p className="text-gray-400">
                        Devolt Mould operates a state-of-the-art facility utilizing CNC machining and advanced robotic injection systems. Every mould and part undergoes multi-point inspection to ensure zero defects, guaranteeing performance in the most demanding environments.
                    </p>
                </div>
            </div>
        </div>
    );
};