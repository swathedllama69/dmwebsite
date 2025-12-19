import React from 'react';
import { Truck, Clock, Package, CreditCard, ShieldCheck } from 'lucide-react';

export const ShippingPolicy = () => {
    return (
        <div className="max-w-4xl mx-auto pt-32 pb-24 px-4 font-mono text-current">
            <header className="mb-12 border-l-4 border-primary pl-6">
                <h1 className="font-display text-5xl md:text-7xl uppercase italic tracking-tighter mb-4 leading-none">
                    Shipping<span className="text-primary">.</span>Info
                </h1>
                <p className="text-lg opacity-60 italic">Movement and delivery protocols for your orders.</p>
            </header>

            <div className="grid grid-cols-1 gap-6 mb-12">
                {/* Logistics Info Box */}
                <div className="bg-primary/10 border border-primary/20 p-8 rounded-[2rem] flex flex-col md:flex-row gap-6 items-center shadow-[0_0_30px_var(--accent-color)]/10">
                    <CreditCard size={40} className="text-primary shrink-0" />
                    <div>
                        <h2 className="text-xl font-black uppercase mb-2">Logistics is a separate settlement</h2>
                        <p className="text-sm opacity-80 leading-relaxed">
                            To ensure the most accurate rates, shipping costs are not included in your checkout total. Once your order is processed, our team will coordinate with you to determine the best delivery route. <strong>Shipping fees are settled independently prior to dispatch.</strong>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card border border-white/5 p-8 rounded-3xl shadow-xl group">
                        <Clock size={24} className="text-primary mb-4 group-hover:animate-pulse" />
                        <h3 className="font-black uppercase mb-2">Handling</h3>
                        <p className="text-sm opacity-60">Standard releases are prepared within 1-3 business days. Specialty or made-to-order items may require additional time for preparation before leaving the lab.</p>
                    </div>
                    <div className="bg-card border border-white/5 p-8 rounded-3xl shadow-xl group">
                        <ShieldCheck size={24} className="text-primary mb-4" />
                        <h3 className="font-black uppercase mb-2">Transit</h3>
                        <p className="text-sm opacity-60">We utilize a network of global couriers to ensure secure delivery. Full tracking documentation is provided as soon as your order is handed over to the logistics partner.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};