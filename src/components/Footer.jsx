import React from 'react';
import { LogIn, LogOut, Phone, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const LOGO_URL = "http://devoltmould.com.ng/resources/devolt_logo2.png";

export const Footer = ({ handleAdminToggle, isAdminLoggedIn, themeMode }) => {

    const currentYear = new Date().getFullYear();

    // Determine Background Color based on themeMode
    // If Light Theme: Dark Gray (#121212)
    // If Dark Theme: Pure Black (#000000)
    const bgColorClass = themeMode === 'light' ? 'bg-[#121212]' : 'bg-black';

    return (
        <footer className={`relative ${bgColorClass} pt-24 pb-12 px-6 md:px-12 border-t border-white/10 overflow-hidden font-mono text-white/80 transition-colors duration-500`}>

            {/* Accent Color Mask */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                <div className="h-full w-full animated-cyber-grid" style={{
                    maskImage: 'linear-gradient(to bottom, transparent, var(--accent-color) 20%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent, var(--accent-color) 20%)'
                }}></div>
            </div>

            <div className="max-w-[1800px] mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">

                    {/* BRAND */}
                    <div className="md:col-span-5 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center mb-8">
                                <img src={LOGO_URL} alt="Devolt" className="h-8 w-auto opacity-90" />
                                <span className="text-2xl tracking-tighter uppercase text-white ml-4 opacity-90 font-bold" style={{ fontFamily: "'Cinzel', serif" }}>
                                    - DEVOLT -
                                </span>
                            </div>

                            <h2 className="text-2xl uppercase mb-6 text-white font-black tracking-tighter">Join the Mould</h2>
                            <div className="group flex items-center border-b border-white/20 py-3 max-w-md focus-within:border-primary transition-colors duration-500">
                                <input
                                    type="email"
                                    placeholder="ENTER EMAIL ADDRESS"
                                    className="bg-transparent w-full outline-none text-sm placeholder-white/30 text-primary uppercase tracking-wider"
                                />
                                <button className="text-white/50 text-xs uppercase group-hover:text-primary transition-colors tracking-widest font-bold">
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* LINKS */}
                    <div className="md:col-span-2 md:col-start-7">
                        <h4 className="text-primary text-[10px] mb-8 uppercase tracking-[0.2em] font-bold">Shop</h4>
                        <ul className="space-y-4 text-xs tracking-wider text-white/50">
                            <li><Link to="/collections" className="hover:text-white hover:pl-2 transition-all duration-300 block">All Products</Link></li>
                            <li><Link to="/collections" className="hover:text-white hover:pl-2 transition-all duration-300 block">New Arrivals</Link></li>
                            <li><Link to="/collections" className="hover:text-white hover:pl-2 transition-all duration-300 block">Collections</Link></li>
                        </ul>
                    </div>

                    <div className="md:col-span-2">
                        <h4 className="text-primary text-[10px] mb-8 uppercase tracking-[0.2em] font-bold">Info</h4>
                        <ul className="space-y-4 text-xs tracking-wider text-white/50">
                            <li><Link to="/about" className="hover:text-white hover:pl-2 transition-all duration-300 block">About Us</Link></li>
                            <li><Link to="/shipping" className="hover:text-white hover:pl-2 transition-all duration-300 block">Shipping Policy</Link></li>
                            <li><Link to="/returns" className="hover:text-white hover:pl-2 transition-all duration-300 block">Returns</Link></li>
                            <li><Link to="/contact" className="hover:text-white hover:pl-2 transition-all duration-300 block">Contact</Link></li>
                        </ul>
                    </div>

                    <div className="md:col-span-2">
                        <h4 className="text-primary text-[10px] mb-8 uppercase tracking-[0.2em] font-bold">Connect</h4>
                        <ul className="space-y-4 text-xs tracking-wider text-white/50">
                            <li><a href="https://www.instagram.com/devolt.mould/" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-3"><Instagram size={14} /> @devolt.mould</a></li>
                            <li><a href="https://twitter.com/devolt_mould" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-3"><Twitter size={14} /> @devolt_mould</a></li>
                            <li className="pt-4 flex items-center gap-3">
                                <Phone size={14} className="text-primary" />
                                <a href="tel:08146068754" className="hover:text-white transition-colors">08146068754</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-[10px] text-white/30 uppercase tracking-[0.15em]">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center text-center md:text-left">
                        <span>&copy; {currentYear} DEVOLT.MOULD LLC.</span>
                        <span className="hidden md:inline text-white/10">|</span>
                        <span>ABUJA, FCT, NIGERIA</span>
                    </div>
                    <div className="flex items-center gap-8 mt-6 md:mt-0">
                        <Link to="#" className="hover:text-white transition-colors">Privacy</Link>
                        <Link to="#" className="hover:text-white transition-colors">Terms</Link>
                        <button className="flex items-center gap-2 hover:text-primary transition-colors" onClick={handleAdminToggle}>
                            {isAdminLoggedIn ? <><span>Log Out</span><LogOut size={12} /></> : <><span>Admin</span><LogIn size={12} /></>}
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};