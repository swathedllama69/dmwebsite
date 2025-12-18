import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, LogIn, Send, Loader2, AlertCircle, RefreshCcw, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '../utils/config';

export const LoginView = ({ setIsCustomerLoggedIn, setCustomerData, setNotification, navigateToAccount }) => {
    const navigate = useNavigate();

    // Mode state: 'login', 'register', or 'forgot_password'
    const [mode, setMode] = useState('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState('');

    const isRegisterMode = mode === 'register';
    const isForgotPasswordMode = mode === 'forgot_password';

    // UI Styles
    const inputContainerStyle = "relative group transition-all duration-300";
    const iconStyle = "absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#CCFF00] transition-colors duration-300";
    const inputStyle = "w-full bg-black/40 border border-[#333] hover:border-[#444] text-white py-4 pl-12 pr-4 rounded-2xl outline-none focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00]/50 transition-all duration-300 placeholder:text-gray-600 font-mono text-sm";

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLocalError('');
        if (setNotification) setNotification(null);

        // Validation Logic
        if (isRegisterMode) {
            if (!name) { setLocalError("Name is required."); setLoading(false); return; }
            if (password.length < 8) { setLocalError("Security requires 8+ characters."); setLoading(false); return; }
            if (password !== confirmPassword) { setLocalError("Passwords mismatch."); setLoading(false); return; }
        }

        const action = isForgotPasswordMode ? 'reset' : (isRegisterMode ? 'register' : 'login');
        let endpoint = isForgotPasswordMode
            ? `${API_BASE_URL}/reset_password_request.php`
            : `${API_BASE_URL}/users.php?action=${action}`;

        const payload = isForgotPasswordMode
            ? { email: forgotPasswordEmail }
            : { action, email, password, ...(isRegisterMode && { name }) };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Authentication failed.");
            }

            if (isForgotPasswordMode) {
                setNotification({ message: data.message || "Reset link sent to your email.", type: 'success' });
                setMode('login');
            } else {
                const userData = data.user || { name: data.name, email: data.email, user_id: data.user_id };
                setIsCustomerLoggedIn(true);
                setCustomerData(userData);
                localStorage.setItem('customer_user', JSON.stringify(userData));

                setNotification({
                    message: isRegisterMode ? "Account created successfully. Welcome." : `Welcome back, ${userData.name}`,
                    type: 'success'
                });
                navigateToAccount();
            }
        } catch (err) {
            setLocalError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#080808] pt-44 pb-20 px-6 flex flex-col items-center">
            {/* Brand Header */}
            <div className="text-center mb-12 animate-in fade-in zoom-in duration-700">
                <div className="inline-flex p-4 rounded-3xl bg-[#CCFF00]/10 border border-[#CCFF00]/20 mb-6 shadow-[0_0_30px_rgba(204,255,0,0.1)]">
                    <ShieldCheck className="text-[#CCFF00]" size={36} />
                </div>
                <h1 className="text-5xl font-black uppercase text-white tracking-tighter italic font-display">
                    {isForgotPasswordMode ? 'Recover' : isRegisterMode ? 'Enlist' : 'Access'}
                </h1>
                <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.4em] mt-3">
                    {isForgotPasswordMode ? 'Reset your password' : isRegisterMode ? 'Register a new account' : 'Safely Login to your account'}
                </p>
            </div>

            <div className="w-full max-w-[420px] animate-in slide-in-from-bottom-8 duration-700">
                {localError && (
                    <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-mono mb-6">
                        <AlertCircle size={18} className="shrink-0" />
                        <span>{localError}</span>
                    </div>
                )}

                <form onSubmit={handleAuthAction} className="space-y-4">
                    {isRegisterMode && (
                        <div className={inputContainerStyle}>
                            <User className={iconStyle} size={18} />
                            <input
                                type="text"
                                placeholder="FULL NAME"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={inputStyle}
                                required
                            />
                        </div>
                    )}

                    {!isForgotPasswordMode ? (
                        <>
                            <div className={inputContainerStyle}>
                                <Mail className={iconStyle} size={18} />
                                <input
                                    type="email"
                                    placeholder="EMAIL ADDRESS"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={inputStyle}
                                    required
                                />
                            </div>
                            <div className={inputContainerStyle}>
                                <Lock className={iconStyle} size={18} />
                                <input
                                    type="password"
                                    placeholder="PASSWORD"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={inputStyle}
                                    required
                                />
                            </div>
                            {isRegisterMode && (
                                <div className={inputContainerStyle}>
                                    <Lock className={iconStyle} size={18} />
                                    <input
                                        type="password"
                                        placeholder="CONFIRM PASSWORD"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={inputStyle}
                                        required
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className={inputContainerStyle}>
                            <Mail className={iconStyle} size={18} />
                            <input
                                type="email"
                                placeholder="ENTER YOUR REGISTERED EMAIL"
                                value={forgotPasswordEmail}
                                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                className={inputStyle}
                                required
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#CCFF00] hover:bg-white text-black py-5 rounded-2xl font-black uppercase text-sm tracking-widest transition-all duration-500 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 mt-8 shadow-xl shadow-[#CCFF00]/10"
                    >
                        {loading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <>
                                {isForgotPasswordMode ? <RefreshCcw size={18} /> : isRegisterMode ? <Send size={18} /> : <LogIn size={18} />}
                                {isForgotPasswordMode ? 'Send Reset Link' : isRegisterMode ? 'Register Account' : 'Secure Login'}
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 flex flex-col items-center gap-6">
                    {!isForgotPasswordMode && !isRegisterMode && (
                        <button
                            onClick={() => setMode('forgot_password')}
                            className="text-[10px] text-gray-500 hover:text-[#CCFF00] font-mono uppercase tracking-[0.2em] transition-colors"
                        >
                            Forgot Password? Click here
                        </button>
                    )}

                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#333] to-transparent"></div>

                    <button
                        onClick={() => {
                            setMode(isRegisterMode || isForgotPasswordMode ? 'login' : 'register');
                            setLocalError('');
                        }}
                        className="group flex items-center gap-3 text-sm font-mono uppercase tracking-tight"
                    >
                        <span className="text-gray-500 group-hover:text-gray-300 transition-colors">
                            {isRegisterMode || isForgotPasswordMode ? 'Go back to' : 'New User?'}
                        </span>
                        <span className="text-[#CCFF00] font-black group-hover:underline underline-offset-4 transition-all">
                            {isRegisterMode || isForgotPasswordMode ? 'Login Screen' : 'Register Here'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};