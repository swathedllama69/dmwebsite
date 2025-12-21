import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Eye, EyeOff, Loader2, Sparkles, ArrowLeft, KeyRound, Zap, Phone, Hexagon } from 'lucide-react';
import clsx from 'clsx';

const API_BASE_URL = '/api';

// --- VISUALS: The Digital Forge Background ---
const TechBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Infinite Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.05] animate-pan-grid"></div>

        {/* Radial Fade (Vignette) to focus center */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0)_40%,var(--bg-color)_100%)] opacity-80"></div>

        {/* Floating Abstract Elements */}
        <div className="absolute top-[10%] left-[10%] text-primary opacity-10 animate-spin-slow duration-[20s]">
            <Hexagon size={200} strokeWidth={0.5} />
        </div>
        <div className="absolute bottom-[10%] right-[5%] text-current opacity-5 animate-pulse duration-[5s]">
            <div className="w-32 h-32 border border-current rounded-full"></div>
        </div>
    </div>
);

// --- COMPONENT: Structural Input ---
const TechInput = ({ icon: Icon, ...props }) => (
    <div className="relative group">
        <div className="relative flex items-center bg-background border border-current/20 rounded-lg overflow-hidden transition-all duration-300 group-focus-within:border-primary group-focus-within:ring-1 group-focus-within:ring-primary/50 group-focus-within:translate-x-1">
            <div className="flex items-center justify-center w-12 h-14 bg-current/5 border-r border-current/10 group-focus-within:bg-primary/10 group-focus-within:text-primary transition-colors">
                <Icon size={18} className="opacity-70 group-focus-within:opacity-100" />
            </div>
            <input
                {...props}
                className="w-full h-14 bg-transparent px-4 outline-none text-sm font-bold tracking-wide text-current placeholder:text-current/40 placeholder:font-normal placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest"
            />
            {/* Corner Tech Accent */}
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current/30 group-focus-within:border-primary transition-colors"></div>
        </div>
    </div>
);

export const LoginView = ({
    isModal,
    onClose,
    setIsCustomerLoggedIn,
    setCustomerData,
    setNotification,
    navigateToAccount
}) => {
    const [view, setView] = useState('login');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form Data
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');

    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let endpoint = '';
            let payload = {};

            if (view === 'login') {
                endpoint = 'login';
                payload = { email, password };
            } else if (view === 'register') {
                endpoint = 'register';
                payload = { email, password, first_name: firstName, last_name: lastName, phone };
            } else if (view === 'forgot_password') {
                endpoint = 'request_reset';
                payload = { email };
            } else if (view === 'reset_password') {
                endpoint = 'confirm_reset';
                payload = { token: resetToken, new_password: newPassword };
            }

            const response = await fetch(`${API_BASE_URL}/auth.php?action=${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!data.success) throw new Error(data.error || "Operation failed");

            if (view === 'forgot_password') {
                setNotification({ message: "Reset code sent", type: 'success' });
                if (data.dev_token) console.log("DEV TOKEN:", data.dev_token);
                setView('reset_password');
            } else if (view === 'reset_password') {
                setNotification({ message: "Password reset successful! Please login.", type: 'success' });
                setView('login');
            } else {
                setNotification({
                    message: view === 'login' ? "Login Successful" : "Account Created",
                    type: 'success'
                });
                setIsCustomerLoggedIn(true);
                setCustomerData(data.user);
                if (isModal) onClose();
                navigateToAccount();
            }

        } catch (err) {
            setNotification({ message: err.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const getTitle = () => {
        if (view === 'login') return { main: "System Login", sub: "Enter your credentials" };
        if (view === 'register') return { main: "New Protocol", sub: "Initialize profile data" };
        if (view === 'forgot_password') return { main: "Recovery", sub: "Reset security token" };
        return { main: "Update Key", sub: "Establish new password" };
    };

    const titles = getTitle();

    return (
        <div className={clsx(
            "relative text-current flex items-center justify-center transition-all duration-500",
            // Center Logic: min-h-screen ensures it takes full height, flex/items-center/justify-center puts it in the middle
            isModal
                ? "bg-background border-2 border-current/10 shadow-2xl p-8 md:p-12 max-w-2xl w-full mx-auto rounded-3xl"
                : "min-h-screen w-full bg-background"
        )}>
            {/* The Background Grid */}
            <TechBackground />

            {/* CARD CONTAINER (Content Layer) */}
            <div className={clsx(
                "relative z-10 flex flex-col w-full",
                // Added transform translate to ensure perfect optical centering if needed, but flex usually handles it
                !isModal && "max-w-md bg-background/80 backdrop-blur-md p-10 border border-current/10 rounded-2xl shadow-[0_0_50px_-20px_rgba(0,0,0,0.3)]"
            )}>

                {/* --- HEADER SECTION --- */}
                <div className="mb-10 border-b border-current/10 pb-8 text-center">

                    {/* 1. CENTERED ICON BOX */}
                    <div className="mx-auto h-20 w-20 flex items-center justify-center border border-current/10 bg-current/5 rounded-2xl text-primary shadow-[0_0_30px_-10px_var(--accent-color)] mb-6">
                        {view.includes('reset') || view === 'forgot_password' ? (
                            <KeyRound size={32} />
                        ) : (
                            <ShieldCheck size={32} />
                        )}
                    </div>

                    {/* 2. STATUS & TITLES */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                            <span className="font-mono text-[9px] uppercase tracking-[0.3em] opacity-60">Secure Connection</span>
                        </div>
                        <h2 className="font-display text-4xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-current to-current/40">
                            {titles.main}
                        </h2>
                        <p className="font-mono text-xs mt-2 opacity-60 uppercase tracking-widest text-primary">
                            // {titles.sub}
                        </p>
                    </div>
                </div>

                {/* --- FORM SECTION --- */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Register Fields */}
                    {view === 'register' && (
                        <div className="space-y-5 animate-in slide-in-from-bottom-4 fade-in duration-500">
                            <div className="grid grid-cols-2 gap-4">
                                <TechInput icon={User} type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                                <TechInput icon={User} type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
                            </div>
                            <TechInput icon={Phone} type="tel" placeholder="Mobile Number" value={phone} onChange={e => setPhone(e.target.value)} required />
                        </div>
                    )}

                    {/* Login/Common Fields */}
                    {view !== 'reset_password' && (
                        <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 delay-100">
                            <TechInput
                                icon={Mail}
                                type="text"
                                placeholder={view === 'login' ? "Email or Phone Number" : "Email Address"}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    {/* Password Field */}
                    {(view === 'login' || view === 'register') && (
                        <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200 relative">
                            <div className="relative">
                                <TechInput
                                    icon={Lock}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 hover:text-primary transition-colors z-20 text-current">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {view === 'login' && (
                                <div className="text-right mt-3">
                                    <button
                                        type="button"
                                        onClick={() => setView('forgot_password')}
                                        className="text-[10px] font-mono uppercase opacity-50 hover:opacity-100 hover:text-primary transition-all underline decoration-dotted decoration-current/30 underline-offset-4"
                                    >
                                        Recover Password
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reset Password Fields */}
                    {view === 'reset_password' && (
                        <div className="space-y-5 animate-in slide-in-from-bottom-4 fade-in duration-500">
                            <TechInput icon={KeyRound} type="text" placeholder="Enter Reset Token" value={resetToken} onChange={(e) => setResetToken(e.target.value)} required />
                            <TechInput icon={Lock} type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full group relative bg-primary text-black h-16 mt-8 overflow-hidden rounded-lg font-black uppercase tracking-widest text-xs flex items-center justify-between px-8 hover:brightness-110 transition-all shadow-[0_10px_40px_-10px_var(--accent-color)]"
                    >
                        <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] group-hover:animate-shine opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <span className="relative z-10 flex items-center gap-3">
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} className="fill-black" />}
                            {view === 'login' && "Authenticate"}
                            {view === 'register' && "Initialize Account"}
                            {view === 'forgot_password' && "Send Reset Link"}
                            {view === 'reset_password' && "Update Credentials"}
                        </span>

                        <ArrowRight size={20} className="relative z-10 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                    </button>
                </form>

                {/* Footer / Toggle View */}
                <div className="mt-10 pt-6 border-t border-current/10 flex justify-center">
                    {view !== 'login' ? (
                        <button onClick={() => setView('login')} className="group flex items-center gap-3 text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-all">
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Login
                        </button>
                    ) : (
                        <button onClick={() => setView('register')} className="group flex items-center gap-3 text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-all">
                            New User? Register
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};