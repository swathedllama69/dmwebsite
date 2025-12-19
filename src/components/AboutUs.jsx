import React from 'react';
import { Zap, Target, Award, Layers } from 'lucide-react';

export const AboutUs = () => {
    return (
        <div className="max-w-6xl mx-auto pt-32 pb-24 px-4 font-mono text-current">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="relative">
                    {/* Background Decorative Element */}
                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/20 blur-[80px] rounded-full" />

                    <h1 className="relative z-10 font-display text-5xl md:text-6xl uppercase italic tracking-tighter mb-8 leading-none">
                        WE ARE<br />
                        <span
                            className="text-primary"
                            style={{ fontFamily: "'Cinzel', serif", fontWeight: 900 }}
                        >
                            - DEVOLT -
                        </span>
                    </h1>
                    <p className="text-xl opacity-80 leading-relaxed mb-8 max-w-lg">
                        Devolt is a modern creative house dedicated to providing high-quality essentials for a new generation. We focus on the intersection of design, durability, and lifestyle.
                    </p>
                    <div className="flex gap-4">
                        <div className="bg-card border border-white/5 p-6 rounded-2xl flex-1 text-center shadow-xl">
                            <h4 className="text-primary font-black text-3xl italic">V2</h4>
                            <p className="text-[10px] uppercase opacity-50 font-black tracking-widest mt-1">Status</p>
                        </div>
                        <div className="bg-card border border-white/5 p-6 rounded-2xl flex-1 text-center shadow-xl">
                            <h4 className="text-primary font-black text-3xl italic">01</h4>
                            <p className="text-[10px] uppercase opacity-50 font-black tracking-widest mt-1">Origin</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-card border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative group overflow-hidden transition-all hover:border-primary/20">
                        <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-[0.02] transition-opacity" />
                        <Layers size={24} className="text-primary mb-4" />
                        <h2 className="text-2xl font-black uppercase italic mb-3">Our Philosophy</h2>
                        <p className="opacity-60 text-sm leading-relaxed">
                            We don't follow the traditional roadmap. Every release is an exploration of form and function, tailored for those who value originality and high-caliber execution.
                        </p>
                    </div>

                    <div className="bg-card border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative group overflow-hidden transition-all hover:border-primary/20">
                        <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-[0.02] transition-opacity" />
                        <Zap size={24} className="text-primary mb-4" />
                        <h2 className="text-2xl font-black uppercase italic mb-3">Innovation</h2>
                        <p className="opacity-60 text-sm leading-relaxed">
                            From the initial concept to the final product, we prioritize a seamless blend of modern aesthetics and lasting quality. Devolt is here to redefine the standard.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};