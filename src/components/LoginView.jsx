import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Eye, EyeOff, Loader2, Sparkles, ArrowLeft, KeyRound, Zap } from 'lucide-react';
import clsx from 'clsx';

const API_BASE_URL = '/api';

// --- Artistic Background Component ---
const ArtisticBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary slowly pulsing gradient blob */}
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-primary/20 blur-[150px] animate-pulse-[8s_ease-in-out_infinite]"></div>
        {/* Secondary contrast blob */}
        <div className="absolute bottom-[-30%] right-[-10%] w-[60%] h-[60%] rounded-full bg-current/5 blur-[120px]"></div>

        {/* Abstract geometric grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--text-color)/4%_1px,transparent_1px),linear-gradient(to_bottom,var(--text-color)/4%_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)] opacity-70"></div>

        {/* Subtle noise texture (optional, assumes you have a noise pattern, if not this div does nothing invisible) */}
        <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay bg-repeat [background-image:url('data:image/svg+xml,%3Csvg viewBox=%270 0 400 400%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noiseFilter%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.8%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noiseFilter)%27/%3E%3C/svg%3E')]"></div>
    </div>
);

// --- Artistic Input Component ---
const ArtisticInput = ({ icon: Icon, ...props }) => (
    <div className="relative group overflow-hidden rounded-2xl transition-all duration-500 ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-primary/70 focus-within:shadow-[0_0_30px_-10px_var(--accent-color)] bg-black/30 backdrop-blur-md">
        <Icon className="absolute left-5 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-100 group-focus-within:text-primary transition-all duration-500 z-10" size={20} />
        <input
            {...props}
            className="w-full bg-transparent p-5 pl-14 outline-none text-sm font-mono tracking-wide placeholder:opacity-40 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-[0.2em] transition-all relative z-20 autofill:bg-transparent"
        />
        {/* Animated bottom highlight bar */}
        <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-700 group-focus-within:w-full opacity-80 z-30"></div>
        {/* Subtle internal glow */}
        <div className="absolute inset-0 opacity-0 group-focus-within:opacity-20 bg-gradient-to-r from-primary/10 to-transparent transition-opacity duration-500 pointer-events-none"></div>
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
    // Views: 'login', 'register', 'forgot_password', 'reset_password'
    const [view, setView] = useState('login');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form Data
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    // Reset Flow Data
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let endpoint = '';
            let payload = {};

            // 1. Configure Request based on View
            if (view === 'login') {
                endpoint = 'login';
                payload = { email, password };
            } else if (view === 'register') {
                endpoint = 'register';
                payload = { email, password, first_name: firstName, last_name: lastName };
            } else if (view === 'forgot_password') {
                endpoint = 'request_reset';
                payload = { email };
            } else if (view === 'reset_password') {
                endpoint = 'confirm_reset';
                payload = { token: resetToken, new_password: newPassword };
            }

            // 2. Send Request
            const response = await fetch(`${API_BASE_URL}/auth.php?action=${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Operation failed");
            }

            // 3. Handle Success Scenarios
            if (view === 'forgot_password') {
                setNotification({ message: "Reset code sent (Check Console for Dev Token)", type: 'success' });
                // DEV HELP: Log token to console so you can copy it
                if (data.dev_token) console.log("DEV TOKEN:", data.dev_token);
                setView('reset_password'); // Move to next step
            } else if (view === 'reset_password') {
                setNotification({ message: "Password reset successful! Please login.", type: 'success' });
                setView('login');
            } else {
                // Login or Register Success
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
            console.error("Auth Error:", err);
            setNotification({ message: err.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Helper to render title based on view
    const getTitle = () => {
        if (view === 'login') return { main: "Welcome Back", sub: "Identify yourself." };
        if (view === 'register') return { main: "Initialize ID", sub: "Create your digital profile." };
        if (view === 'forgot_password') return { main: "Reset Access", sub: "Recover lost credentials." };
        return { main: "New Credentials", sub: "Secure your account." };
    };

    const titles = getTitle();

    return (
        <div className={clsx(
            "relative w-full overflow-hidden transition-all duration-500 isolated",
            isModal ? "bg-card/70 backdrop-blur-[50px] rounded-[3rem] border border-white/10 shadow-[0_0_60px_-30px_var(--accent-color)] p-8 md:p-12"
                : "max-w-md mx-auto pt-32 pb-16 px-6"
        )}>
            <ArtisticBackground />

            <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="text-center mb-10 relative">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-white/10 to-black/30 border border-white/20 mb-6 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                        {view.includes('reset') || view === 'forgot_password' ? (
                            <KeyRound size={36} className="text-primary relative z-10 drop-shadow-[0_0_10px_var(--accent-color)]" />
                        ) : (
                            <Zap size={36} className="text-primary relative z-10 drop-shadow-[0_0_10px_var(--accent-color)] fill-primary/20" />
                        )}
                    </div>
                    <h2 className="font-display text-4xl font-black uppercase tracking-tight text-current drop-shadow-sm">
                        {titles.main}
                    </h2>
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-60 mt-2">{titles.sub}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 grow flex flex-col justify-center">

                    {/* --- VIEW: REGISTER ONLY --- */}
                    {view === 'register' && (
                        <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <ArtisticInput icon={User} type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                            <ArtisticInput icon={User} type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
                        </div>
                    )}

                    {/* --- VIEW: LOGIN / REGISTER / FORGOT --- */}
                    {view !== 'reset_password' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                            <ArtisticInput
                                icon={Mail}
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    {/* --- VIEW: LOGIN / REGISTER ONLY --- */}
                    {(view === 'login' || view === 'register') && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 relative">
                            <div className="relative">
                                <ArtisticInput
                                    icon={Lock}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 hover:text-primary transition-colors z-30">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Forgot Password Link */}
                            {view === 'login' && (
                                <div className="text-right mt-3">
                                    <button
                                        type="button"
                                        onClick={() => setView('forgot_password')}
                                        className="text-[10px] uppercase font-bold opacity-50 hover:opacity-100 hover:text-primary transition-all tracking-widest relative group py-1"
                                    >
                                        Forgot Password?
                                        <span className="absolute -bottom-0 left-0 w-0 h-[1px] bg-primary transition-all group-hover:w-full"></span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- VIEW: RESET PASSWORD (STEP 2) --- */}
                    {view === 'reset_password' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <ArtisticInput icon={KeyRound} type="text" placeholder="Enter Reset Token" value={resetToken} onChange={(e) => setResetToken(e.target.value)} required fontMono={true} />
                            <ArtisticInput icon={Lock} type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-[0_0_40px_-10px_var(--accent-color)] hover:scale-[1.02] hover:shadow-[0_0_60px_-10px_var(--accent-color)] active:scale-98 transition-all mt-8 disabled:opacity-50 disabled:hover:scale-100 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 blur-md rounded-2xl"></div>
                        <div className="relative flex items-center gap-3 z-10">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={18} className="animate-pulse" />}
                            {view === 'login' && "Initiate Session"}
                            {view === 'register' && "Create Profile"}
                            {view === 'forgot_password' && "Transmit Reset Code"}
                            {view === 'reset_password' && "Update Credentials"}
                        </div>
                    </button>
                </form>

                {/* Footer Navigation */}
                <div className="mt-10 text-center space-y-4 relative z-20">
                    {view !== 'login' && (
                        <button
                            onClick={() => setView('login')}
                            className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-primary transition-all flex items-center justify-center gap-3 mx-auto group p-2"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Login
                        </button>
                    )}
                    {view === 'login' && (
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-4 bg-card/50 backdrop-blur-md text-[9px] font-mono uppercase tracking-widest opacity-50">OR</span>
                            </div>
                        </div>
                    )}
                    {view === 'login' && (
                        <button
                            onClick={() => setView('register')}
                            className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-primary transition-all flex items-center justify-center gap-3 mx-auto group p-2 w-full"
                        >
                            Register New Account <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};