import React from 'react';
import { LogIn, LogOut, Phone, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

// Assuming you define the logo URL here or import it from config
const LOGO_URL = "http://devoltmould.com.ng/resources/devolt_logo2.png";

// --- Common Footer Component (VERIFIED) ---
export const Footer = ({ handleAdminToggle, isAdminLoggedIn }) => (
    <footer className="relative bg-black pt-20 pb-10 px-4 md:px-8 border-t border-[#1a1a1a] overflow-hidden">

        {/* ⭐ WOW FACTOR: Animated Cyber-Grid Background ⭐ */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
            {/* The magic happens here: the class 'animated-cyber-grid' must be defined in your CSS */}
            <div className="h-full w-full animated-cyber-grid" style={{
                /* Fading mask ensures the grid doesn't overpower content */
                maskImage: 'linear-gradient(to bottom, transparent, #CCFF00 50%)',
            }}></div>
        </div>

        <div className="max-w-[1800px] mx-auto relative z-10">
            {/* ... (rest of the footer content remains the same) ... */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">

                {/* 1. BRAND & NEWSLETTER */}
                <div className="md:col-span-5">
                    <div className="flex items-center mb-6">
                        <img
                            src={LOGO_URL}
                            alt="-DEVOLT- Logo"
                            className="h-10 w-auto"
                        />
                        <span className="text-2xl font-display tracking-tighter uppercase text-white font-mono ml-3"
                            style={{ fontFamily: "'Cinzel', serif", fontWeight: 700 }}>
                            - DEVOLT -
                        </span>
                    </div>

                    <h2 className="font-display text-3xl uppercase mb-6 text-white">Join the Mould</h2>
                    <div className="flex border-b border-[#333] py-2 max-w-md focus-within:border-[#CCFF00] transition-colors">
                        <input type="email" placeholder="ENTER EMAIL ADDRESS" className="bg-transparent w-full outline-none font-mono text-sm placeholder-[#444] text-white" />
                        <button className="text-[#CCFF00] font-mono text-sm uppercase hover:text-white">Submit</button>
                    </div>
                </div>

                {/* 2. SHOP LINKS (All linking to /collections) */}
                <div className="md:col-span-2 md:col-start-7">
                    <h4 className="font-mono text-[#CCFF00] text-xs mb-6 uppercase tracking-widest">Shop</h4>
                    <ul className="space-y-3 font-mono text-sm text-[#888]">
                        <li><Link to="/collections" className="hover:text-white transition-colors">All Products</Link></li>
                        <li><Link to="/collections" className="hover:text-white transition-colors">New Arrivals</Link></li>
                        <li><Link to="/collections" className="hover:text-white transition-colors">Collections</Link></li>
                    </ul>
                </div>

                {/* 3. SUPPORT/INFO LINKS & CONTACT */}
                <div className="md:col-span-2">
                    <h4 className="font-mono text-[#CCFF00] text-xs mb-6 uppercase tracking-widest">Info & Support</h4>
                    <ul className="space-y-3 font-mono text-sm text-[#888]">
                        <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                        <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link></li>
                        <li><Link to="/returns" className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
                        <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                    </ul>
                </div>

                {/* 4. SOCIAL & QUICK CONTACT (UPDATED) */}
                <div className="md:col-span-2">
                    <h4 className="font-mono text-[#CCFF00] text-xs mb-6 uppercase tracking-widest">Connect</h4>
                    <ul className="space-y-3 font-mono text-sm text-[#888]">

                        {/* Instagram Link (Updated URL) */}
                        <li>
                            <a href="https://www.instagram.com/devolt.mould/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                                <Instagram size={16} /> @devolt.mould
                            </a>
                        </li>

                        {/* Twitter Link (Updated URL) */}
                        <li>
                            <a href="https://twitter.com/devolt_mould" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                                <Twitter size={16} /> @devolt_mould
                            </a>
                        </li>

                        {/* Phone Number */}
                        <li className="pt-4 text-white flex items-center gap-2">
                            <Phone size={16} className="text-[#CCFF00]" />
                            <a href="tel:08146068754" className="hover:text-[#CCFF00] transition-colors">08146068754</a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* BOTTOM ROW (Copyright and Admin Link) */}
            <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-[#1a1a1a] font-mono text-xs text-[#444]">
                <div className="uppercase flex items-center gap-4">
                    <span>&copy; 2025 DEVOLT.MOULD LLC.</span>

                    {/* Admin Link Moved to Footer */}
                    <button
                        className="hover:text-[#888] uppercase flex items-center gap-1 text-[#444] hover:text-[#CCFF00] transition-colors"
                        onClick={handleAdminToggle}
                    >
                        {isAdminLoggedIn ? <LogOut size={14} /> : <LogIn size={14} />}
                        <span className="text-[10px] md:text-xs">
                            {isAdminLoggedIn ? 'Admin Log Out' : 'Admin Login'}
                        </span>
                    </button>
                </div>
                <div className="flex gap-6 mt-4 md:mt-0">
                    {/* Linking Privacy and Terms to generic placeholder pages or # for now */}
                    <Link to="#" className="hover:text-[#888]">PRIVACY</Link>
                    <Link to="#" className="hover:text-[#888]">TERMS</Link>
                </div>
            </div>
        </div>
    </footer>
);