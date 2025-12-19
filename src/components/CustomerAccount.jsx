import React, { useState } from 'react';
import {
    User, Lock, LogOut, ShoppingBag, AlertCircle,
    Loader2, ChevronRight, Package, ShieldCheck, Mail,
    Fingerprint, Shield, Sparkles
} from 'lucide-react';
import { CustomerOrders } from './CustomerOrders.jsx';
import { API_BASE_URL } from '../utils/config.js';

// --- 1. UTILITY: ID MASKER & FORMATTER ---
const formatDisplayId = (id, type = 'user') => {
    if (!id) return '---';

    // CONFIGURATION: Change these offsets to whatever number you prefer
    const USER_OFFSET = 4200;   // Real ID 1 becomes 4201
    const ORDER_OFFSET = 8800;  // Real ID 1 becomes 8801

    const maskedNumber = parseInt(id) + (type === 'order' ? ORDER_OFFSET : USER_OFFSET);
    const prefix = type === 'order' ? 'ORD-' : 'USR-';

    return `${prefix}${maskedNumber}`;
};

// --- 2. SETTINGS VIEW ---
const SettingsView = ({ customer, setNotification }) => {
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (passwords.new.length < 8) {
            setError("Password must be at least 8 characters.");
            setLoading(false);
            return;
        }
        if (passwords.new !== passwords.confirm) {
            setError("New passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth.php?action=update_password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: customer.id,
                    current_password: passwords.current,
                    new_password: passwords.new,
                }),
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.error || "Update failed.");

            setNotification({ message: 'Password Updated Successfully', type: 'success' });
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Visual Profile Card */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="bg-card border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Fingerprint size={120} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest opacity-50 mb-6">Identity Node</h3>

                        <div className="space-y-6 relative z-10">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-primary tracking-widest">Full Name</label>
                                <div className="text-xl font-display italic font-bold">{customer.name}</div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-primary tracking-widest">Email Address</label>
                                <div className="text-sm font-mono opacity-80">{customer.email}</div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-primary tracking-widest">Masked ID</label>
                                <div className="font-mono text-xs bg-white/5 py-2 px-3 rounded-lg inline-block border border-white/5 text-primary">
                                    {formatDisplayId(customer.id, 'user')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/10 p-6 rounded-[2rem] text-center">
                        <Shield className="text-primary mx-auto mb-3" size={32} />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Secure Enclave</h4>
                        <p className="text-[10px] opacity-60 font-medium leading-relaxed">
                            Your account data is encrypted. Display IDs are masked for your privacy.
                        </p>
                    </div>
                </div>

                {/* Password Form */}
                <div className="xl:col-span-2 bg-card border border-white/5 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative group">
                    <h3 className="text-2xl font-display italic font-bold uppercase mb-2">Security Settings</h3>
                    <p className="text-xs uppercase tracking-widest opacity-50 mb-8">Update your access credentials</p>

                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl font-mono text-xs flex items-center gap-3">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black opacity-40 ml-2 tracking-widest">Current Password</label>
                            <input
                                type="password"
                                name="current"
                                value={passwords.current}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 text-current p-5 rounded-2xl focus:border-primary outline-none transition-all placeholder:opacity-20 text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black opacity-40 ml-2 tracking-widest">New Password</label>
                                <input
                                    type="password"
                                    name="new"
                                    value={passwords.new}
                                    onChange={handleChange}
                                    className="w-full bg-black/20 border border-white/10 text-current p-5 rounded-2xl focus:border-primary outline-none transition-all placeholder:opacity-20 text-sm"
                                    placeholder="8+ chars"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black opacity-40 ml-2 tracking-widest">Confirm New</label>
                                <input
                                    type="password"
                                    name="confirm"
                                    value={passwords.confirm}
                                    onChange={handleChange}
                                    className="w-full bg-black/20 border border-white/10 text-current p-5 rounded-2xl focus:border-primary outline-none transition-all placeholder:opacity-20 text-sm"
                                    placeholder="Confirm"
                                />
                            </div>
                        </div>
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-black font-black uppercase text-xs tracking-[0.2em] py-5 rounded-2xl flex items-center justify-center gap-3 shadow-[0_15px_30px_-10px_var(--accent-color)] hover:scale-[1.01] transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                Update Credentials
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// --- 3. MAIN COMPONENT ---
export const CustomerAccount = ({ customer, handleCustomerLogOut, currentCurrency, setNotification }) => {
    const [activeTab, setActiveTab] = useState('orders');

    const menuItems = [
        { id: 'orders', label: 'Order History', icon: ShoppingBag, description: 'View recent drops' },
        { id: 'settings', label: 'Profile & Security', icon: User, description: 'Manage identity' },
    ];

    // Safe Name Handling
    const firstName = customer.first_name || customer.name?.split(' ')[0] || 'User';

    // MASKED ID GENERATION
    const displayUserId = formatDisplayId(customer.id, 'user');

    return (
        <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto text-current">

            {/* HEADER CARD */}
            <div className="mb-12 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent blur-3xl -z-10" />

                <div className="flex flex-col lg:flex-row items-end justify-between gap-8">
                    <div className="flex items-center gap-8">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="absolute -inset-2 bg-primary/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="h-24 w-24 md:h-32 md:w-32 rounded-[2rem] bg-card border border-white/10 flex items-center justify-center relative z-10 shadow-2xl">
                                <span className="font-display text-4xl md:text-5xl italic font-bold text-primary">
                                    {firstName.charAt(0)}
                                </span>
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-primary text-black text-[10px] font-black px-2 py-1 rounded-lg border border-white/20 shadow-lg z-20">
                                PRO
                            </div>
                        </div>

                        {/* Welcome Text */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 opacity-60">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dashboard</span>
                                <div className="h-px w-8 bg-current" />
                            </div>
                            <h1 className="font-display text-4xl md:text-6xl uppercase italic tracking-tighter leading-none">
                                Hello, <span className="text-primary">{firstName}</span>
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                                    <Fingerprint size={12} className="text-primary" />
                                    ID: <span className="font-mono">{displayUserId}</span>
                                </span>
                                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                                    <Mail size={12} className="text-primary" />
                                    {customer.email}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Pill */}
                    <div className="flex gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-[9px] uppercase font-black tracking-widest opacity-40 mb-1">Account Status</p>
                            <div className="flex items-center justify-end gap-2 text-xs font-bold uppercase text-green-500">
                                <Sparkles size={14} /> Active
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* SIDEBAR */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="space-y-2">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center justify-between p-4 px-6 rounded-2xl border transition-all duration-300 group relative overflow-hidden ${activeTab === item.id
                                    ? 'bg-card border-primary/50 text-primary shadow-lg'
                                    : 'bg-transparent border-transparent opacity-50 hover:opacity-100 hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <item.icon size={18} />
                                    <div className="text-left">
                                        <span className="block font-black text-[10px] uppercase tracking-widest">{item.label}</span>
                                    </div>
                                </div>
                                {activeTab === item.id && <ChevronRight size={14} className="animate-pulse" />}
                            </button>
                        ))}
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <button
                            onClick={handleCustomerLogOut}
                            className="w-full flex items-center gap-4 p-4 px-6 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all group border border-transparent hover:border-red-500/20"
                        >
                            <LogOut size={18} />
                            <span className="font-black text-[10px] uppercase tracking-widest">Disconnect</span>
                        </button>
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="lg:col-span-9 min-h-[500px]">
                    {activeTab === 'orders' && (
                        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                            {/* Note: CustomerOrders likely fetches its own data. 
                                Ensure CustomerOrders also uses formatDisplayId or handles the display ID internally. */}
                            <CustomerOrders
                                userId={customer.id}
                                currentCurrency={currentCurrency}
                                setNotification={setNotification}
                            />
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <SettingsView customer={customer} setNotification={setNotification} />
                    )}
                </div>
            </div>
        </div>
    );
};