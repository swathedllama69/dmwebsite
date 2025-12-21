import React, { useState } from 'react';
import {
    ShieldAlert, Lock, User, Eye, EyeOff,
    Loader2, Terminal, ScanFace
} from 'lucide-react';
import { API_BASE_URL } from '../utils/config.js';

export const AdminLogin = ({ setIsAdminLoggedIn, setNotification }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const loginUrl = `${API_BASE_URL}/auth.php?action=login`.replace(/([^:]\/)\/+/g, "$1");

            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success && data.user.role === 'admin') {
                setNotification({ message: `ACCESS GRANTED: WELCOME ${data.user.name.toUpperCase()}`, type: 'success' });
                setIsAdminLoggedIn(true);
            } else {
                setNotification({ message: data.error || "ACCESS DENIED", type: 'error' });
            }
        } catch (err) {
            setNotification({ message: "CONNECTION ERROR: CORE OFFLINE", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        // MAIN WRAPPER: Uses dynamic 'bg-background' and 'text-current' to match global theme
        <div className="min-h-screen bg-background text-current flex items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-500">

            {/* Dynamic Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                {/* Blobs use 'bg-primary' to match the active theme color */}
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[150px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[150px] rounded-full animate-pulse delay-1000"></div>

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(120,120,120,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(120,120,120,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            </div>

            <div className="w-full max-w-[420px] relative z-10 animate-in fade-in zoom-in-95 duration-700">

                {/* Header Section */}
                <div className="text-center mb-10">
                    {/* Icon Container */}
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-card border border-current/10 mb-6 shadow-2xl relative group overflow-hidden transition-colors duration-500">
                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        {/* Dynamic Icon Color */}
                        <Terminal size={40} className="text-primary relative z-10 opacity-90" strokeWidth={1.5} />

                        {/* Scanning Line Animation */}
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/50 animate-[scan_3s_ease-in-out_infinite]"></div>
                    </div>

                    {/* Heading */}
                    <h1 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tighter italic text-current mb-4 leading-none transition-colors duration-500">
                        System Architect Access
                    </h1>

                    {/* Warning Label */}
                    <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-red-500 uppercase tracking-[0.2em] font-bold animate-pulse">
                        <ShieldAlert size={14} />
                        <span>Restricted Area // Core Level Only</span>
                    </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-5">

                    {/* Email Input */}
                    <div className={`relative group transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-current/50 group-focus-within:text-primary transition-colors">
                            <User size={18} />
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            // INPUT STYLES: bg-card ensures it matches the theme's card color (white/black/gray)
                            className="w-full bg-card border border-current/10 group-hover:border-current/30 focus:border-primary p-4 pl-12 rounded-xl text-current outline-none transition-all font-mono text-sm shadow-lg placeholder:text-current/30"
                            placeholder="Access ID"
                            required
                        />
                        {/* Corner Accents */}
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current/10 rounded-tr-sm group-focus-within:border-primary transition-colors"></div>
                    </div>

                    {/* Password Input */}
                    <div className={`relative group transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-current/50 group-focus-within:text-primary transition-colors">
                            <Lock size={18} />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                            className="w-full bg-card border border-current/10 group-hover:border-current/30 focus:border-primary p-4 pl-12 pr-12 rounded-xl text-current outline-none transition-all font-mono text-sm shadow-lg placeholder:text-current/30"
                            placeholder="Access Key"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-current/50 hover:text-current transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        {/* Corner Accents */}
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-current/10 rounded-bl-sm group-focus-within:border-primary transition-colors"></div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        // BUTTON STYLES: Uses bg-primary. Text color depends on if you want it black (high contrast on neons) or inverted.
                        className="w-full bg-primary text-black h-14 rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-8 relative overflow-hidden group"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Terminal size={16} />}
                            {loading ? "Verifying..." : "Grant Access"}
                        </span>

                        {/* Hover Shine Effect */}
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12"></div>
                    </button>
                </form>

                {/* Footer Metadata */}
                <div className="mt-12 flex justify-between items-center text-[9px] font-mono text-current/50 uppercase tracking-widest border-t border-current/10 pt-6">
                    <span>Sys.Ver 3.0.1</span>
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div> Secure_Node</span>
                </div>

            </div>
        </div>
    );
};