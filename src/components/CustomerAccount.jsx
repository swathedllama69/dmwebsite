import React, { useState } from 'react';
import {
    User, Lock, LogOut, ShoppingBag, Send, AlertCircle,
    Loader2, ChevronRight, Package, ShieldCheck
} from 'lucide-react';
import { CustomerOrders } from './CustomerOrders.jsx';
import { API_BASE_URL } from '../utils/config.js';
import { formatCustomerId } from '../utils/config.js';

// --- Sub-Component: Profile Security Panel ---
const SecuritySettings = ({ customer, setNotification }) => {
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (passwords.new.length < 8) {
            setError("New password must be 8+ characters.");
            setLoading(false);
            return;
        }
        if (passwords.new !== passwords.confirm) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth.php?action=update_password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: customer.user_id,
                    current_password: passwords.current,
                    new_password: passwords.new,
                }),
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.error || "Update failed.");

            setNotification({ message: 'Password updated successfully.', type: 'success' });
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-8">
                <h2 className="font-display text-2xl text-white mb-2 flex items-center gap-2">
                    <ShieldCheck className="text-[#CCFF00]" /> Security Settings
                </h2>
                <p className="text-gray-400 font-mono text-sm">Manage your password and account security.</p>
            </div>

            <div className="bg-[#0A0A0A] border border-[#333] p-6 rounded-xl relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00]/5 blur-[60px] rounded-full pointer-events-none"></div>

                {error && (
                    <div className="mb-6 bg-red-900/20 border border-red-900/50 text-red-200 p-3 rounded font-mono text-sm flex items-center gap-2">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
                    <div>
                        <label className="block text-[#888] text-xs uppercase font-bold mb-2">Current Password</label>
                        <input
                            type="password"
                            name="current"
                            value={passwords.current}
                            onChange={handleChange}
                            className="w-full bg-[#111] border border-[#333] text-white p-3 rounded focus:border-[#CCFF00] focus:outline-none transition-colors"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[#888] text-xs uppercase font-bold mb-2">New Password</label>
                            <input
                                type="password"
                                name="new"
                                value={passwords.new}
                                onChange={handleChange}
                                className="w-full bg-[#111] border border-[#333] text-white p-3 rounded focus:border-[#CCFF00] focus:outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[#888] text-xs uppercase font-bold mb-2">Confirm</label>
                            <input
                                type="password"
                                name="confirm"
                                value={passwords.confirm}
                                onChange={handleChange}
                                className="w-full bg-[#111] border border-[#333] text-white p-3 rounded focus:border-[#CCFF00] focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#CCFF00] hover:bg-white text-black font-bold uppercase text-sm px-6 py-3 rounded flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                        Update Credentials
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- Main Layout Component ---
export const CustomerAccount = ({ customer, handleCustomerLogOut, currentCurrency, setNotification }) => {
    // REDESIGN: 'orders' is now the default state
    const [activeTab, setActiveTab] = useState('orders');

    const menuItems = [
        { id: 'orders', label: 'My Orders', icon: ShoppingBag, description: 'Track and view history' },
        { id: 'profile', label: 'Profile & Security', icon: User, description: 'Personal details' },
    ];

    return (
        <div className="min-h-screen pt-28 pb-20 px-4 md:px-8 max-w-7xl mx-auto font-mono text-white">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-[#333] pb-8">
                <div>
                    <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tight mb-2">
                        My <span className="text-[#CCFF00]">Dashboard</span>
                    </h1>
                    <p className="text-gray-400">Welcome back, {customer.name}</p>
                </div>

                <div className="flex items-center gap-4 bg-[#111] p-2 pr-6 rounded-full border border-[#333]">
                    <div className="h-10 w-10 rounded-full bg-[#CCFF00] text-black flex items-center justify-center font-bold text-xl">
                        {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm">
                        <p className="text-white leading-none">{customer.email}</p>
                        <p className="text-[#666] text-xs mt-1">ID:{formatCustomerId(customer.user_id)} #</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Left Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    <p className="text-xs font-bold text-[#666] uppercase tracking-wider mb-4 px-2">Menu</p>
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all duration-200 group ${activeTab === item.id
                                ? 'bg-[#1a1a1a] border-[#CCFF00] text-white shadow-[0_0_15px_rgba(204,255,0,0.1)]'
                                : 'bg-transparent border-transparent text-gray-400 hover:bg-[#111] hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={20} className={activeTab === item.id ? 'text-[#CCFF00]' : ''} />
                                <div className="text-left">
                                    <span className="block font-bold text-sm uppercase">{item.label}</span>
                                    <span className="block text-[10px] opacity-60 font-normal">{item.description}</span>
                                </div>
                            </div>
                            {activeTab === item.id && <ChevronRight size={16} className="text-[#CCFF00]" />}
                        </button>
                    ))}

                    <div className="pt-6 mt-6 border-t border-[#333]">
                        <button
                            onClick={handleCustomerLogOut}
                            className="w-full flex items-center gap-3 p-4 rounded-lg text-red-400 hover:bg-red-900/10 hover:text-red-300 transition-colors"
                        >
                            <LogOut size={20} />
                            <span className="font-bold text-sm uppercase">Sign Out</span>
                        </button>
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="lg:col-span-3 min-h-[500px]">
                    {activeTab === 'orders' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-6 flex items-center gap-2">
                                <Package className="text-[#CCFF00]" />
                                <h2 className="font-display text-2xl text-white">Order History</h2>
                            </div>
                            <CustomerOrders
                                userId={formatCustomerId(customer.user_id)}
                                currentCurrency={currentCurrency}
                                setNotification={setNotification}
                            />
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <SecuritySettings
                            customer={customer}
                            setNotification={setNotification}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};