import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Eye, EyeOff, Loader2, Sparkles, ArrowLeft, KeyRound } from 'lucide-react';
import clsx from 'clsx';

const API_BASE_URL = '/api';

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
        if (view === 'login') return "Welcome Back";
        if (view === 'register') return "Create Account";
        if (view === 'forgot_password') return "Reset Password";
        return "New Credentials";
    };

    return (
        <div className={clsx(
            "relative w-full overflow-hidden transition-all duration-500",
            isModal ? "bg-card/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl p-8 md:p-12"
                : "max-w-md mx-auto pt-32 pb-16 px-6"
        )}>
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 blur-[100px] rounded-full" />

            <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black border border-white/10 mb-6 shadow-xl">
                        {view.includes('reset') || view === 'forgot_password' ? (
                            <KeyRound size={32} className="text-primary" />
                        ) : (
                            <ShieldCheck size={32} className="text-primary" />
                        )}
                    </div>
                    <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-current">
                        {getTitle()}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* --- VIEW: REGISTER ONLY --- */}
                    {view === 'register' && (
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder="First Name" className="bg-black/20 border border-white/5 p-4 rounded-2xl w-full text-sm outline-none focus:border-primary"
                                value={firstName} onChange={e => setFirstName(e.target.value)} required />
                            <input type="text" placeholder="Last Name" className="bg-black/20 border border-white/5 p-4 rounded-2xl w-full text-sm outline-none focus:border-primary"
                                value={lastName} onChange={e => setLastName(e.target.value)} required />
                        </div>
                    )}

                    {/* --- VIEW: LOGIN / REGISTER / FORGOT --- */}
                    {view !== 'reset_password' && (
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full bg-black/20 border border-white/5 p-4 pl-12 rounded-2xl outline-none focus:border-primary transition-all text-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    {/* --- VIEW: LOGIN / REGISTER ONLY --- */}
                    {(view === 'login' || view === 'register') && (
                        <>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className="w-full bg-black/20 border border-white/5 p-4 pl-12 pr-12 rounded-2xl outline-none focus:border-primary transition-all text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {/* Forgot Password Link */}
                            {view === 'login' && (
                                <div className="text-right">
                                    <button
                                        type="button"
                                        onClick={() => setView('forgot_password')}
                                        className="text-[10px] uppercase font-bold opacity-40 hover:opacity-100 hover:text-primary transition-all"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {/* --- VIEW: RESET PASSWORD (STEP 2) --- */}
                    {view === 'reset_password' && (
                        <>
                            <div className="relative group">
                                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Enter Reset Token"
                                    className="w-full bg-black/20 border border-white/5 p-4 pl-12 rounded-2xl outline-none focus:border-primary transition-all text-sm font-mono"
                                    value={resetToken}
                                    onChange={(e) => setResetToken(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    className="w-full bg-black/20 border border-white/5 p-4 pl-12 rounded-2xl outline-none focus:border-primary transition-all text-sm"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-black py-5 rounded-2xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-3 shadow-[0_15px_30px_-10px_var(--accent-color)] hover:scale-[1.02] active:scale-95 transition-all mt-6 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={18} />}
                        {view === 'login' && "Sign In"}
                        {view === 'register' && "Create Account"}
                        {view === 'forgot_password' && "Send Reset Code"}
                        {view === 'reset_password' && "Set New Password"}
                    </button>
                </form>

                {/* Footer Navigation */}
                <div className="mt-8 text-center space-y-3">
                    {view !== 'login' && (
                        <button
                            onClick={() => setView('login')}
                            className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-primary transition-all flex items-center justify-center gap-2 mx-auto"
                        >
                            <ArrowLeft size={12} /> Back to Login
                        </button>
                    )}
                    {view === 'login' && (
                        <button
                            onClick={() => setView('register')}
                            className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-primary transition-all flex items-center justify-center gap-2 mx-auto"
                        >
                            Don't have an account? Sign Up <ArrowRight size={12} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};