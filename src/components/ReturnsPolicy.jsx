import React from 'react';
import { RefreshCw, Zap, ShieldCheck, AlertTriangle } from 'lucide-react';

export const ReturnsPolicy = () => {
    return (
        <div className="max-w-4xl mx-auto pt-32 pb-24 px-4 font-mono text-current">
            <h1 className="font-display text-5xl md:text-7xl uppercase italic tracking-tighter mb-12 text-center">
                QA<span className="text-primary">&</span>RETURNS
            </h1>

            <div className="space-y-6">
                <section className="bg-card border border-white/5 p-8 rounded-3xl relative overflow-hidden group">
                    <ShieldCheck size={120} className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:rotate-12 transition-transform" />
                    <h2 className="text-2xl font-black uppercase italic mb-4 flex items-center gap-3">
                        <Zap size={24} className="text-primary" /> 30-Day Guarantee
                    </h2>
                    <p className="opacity-60 leading-relaxed">
                        Unused standard components may be returned in original engineering packaging within <span className="text-primary font-bold">30 days</span>. We maintain a zero-friction exchange process for our partners.
                    </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card border border-white/5 p-8 rounded-3xl">
                        <h3 className="font-black uppercase mb-4 text-red-500 flex items-center gap-2">
                            <AlertTriangle size={18} /> Defect Protocol
                        </h3>
                        <p className="text-sm opacity-60">
                            If a component fails QA upon arrival, contact us within 7 days. We cover 100% of return logistics and expedite a verified replacement.
                        </p>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 p-8 rounded-3xl">
                        <h3 className="font-black uppercase mb-4 italic">Custom Moulds</h3>
                        <p className="text-sm opacity-60">
                            Due to specialized engineering, custom-spec moulds are non-refundable once the production cycle begins.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};