import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, LogIn, Send, Loader2, AlertCircle, RefreshCcw, ArrowLeft, ShieldCheck } from 'lucide-react';
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

    // UI Helpers
    const inputContainerStyle = "relative group transition-all duration-300";
    const iconStyle = "absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#CCFF00] transition-colors duration-300";
    const inputStyle = "w-full bg-black/40 border border-[#333] hover:border-[#444] text-white py-4 pl-12 pr-4 rounded-2xl outline-none focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00]/50 transition-all duration-300 placeholder:text-gray-600 font-mono text-sm";

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLocalError('');

        let endpoint = `${API_BASE_URL}/login.php`;
        let payload = { email, password };

        if (isRegisterMode) {
            if (password !== confirmPassword) {
                setLocalError("Passwords do not match.");
                setLoading(false);
                return;
            }
            endpoint = `${API_BASE_URL}/auth.php?action=register`;
            payload = { name, email, password };
        } else if (isForgotPasswordMode) {
            endpoint = `${API_BASE_URL}/reset_password_request.php`;
            payload = { email: forgotPasswordEmail };
        }

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
                setNotification({ message: data.message, type: 'success' });
                setMode('login');
            } else {
                setIsCustomerLoggedIn(true);
                setCustomerData({
                    name: data.name,
                    email: data.email,
                    user_id: data.user_id,
                });
                setNotification({ message: `Access Granted. Welcome, ${data.name}`, type: 'success' });
                navigateToAccount();
            }
        } catch (err) {
            setLocalError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#080808] pt-40 pb-20 px-6 flex flex-col items-center animate-in fade-in duration-700">
            {/* Header Branding */}
            <div className="text-center mb-10">
                <div className="inline-flex p-3 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/20 mb-4">
                    <ShieldCheck className="text-[#CCFF00]" size={32} />
                </div>
                <h1 className="text-5xl font-display uppercase text-white tracking-tighter italic">
                    {isForgotPasswordMode ? 'Recover' : isRegisterMode ? 'Enlist' : 'Access'}
                </h1>
                <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.3em] mt-2">
                    Devolt Mould Terminal v2.0
                </p>
            </div>

            <div className="w-full max-w-[420px]">
                {/* Error Banner */}
                {localError && (
                    <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-mono mb-6 animate-in slide-in-from-top-2">
                        <AlertCircle size={18} className="shrink-0" />
                        <span>{localError}</span>
                    </div>
                )}

                <form onSubmit={handleAuthAction} className="space-y-4">
                    {/* Input Groups */}
                    {isRegisterMode && (
                        <div className={inputContainerStyle}>
                            <User className={iconStyle} size={18} />
                            <input
                                type="text"
                                placeholder="IDENTIFICATION (FULL NAME)"
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
                                    placeholder="SECURE PASSWORD"
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
                                placeholder="REGISTERED EMAIL"
                                value={forgotPasswordEmail}
                                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                className={inputStyle}
                                required
                            />
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#CCFF00] hover:bg-white text-black py-5 rounded-2xl font-black uppercase text-sm tracking-widest transition-all duration-500 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 mt-8"
                    >
                        {loading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <>
                                {isForgotPasswordMode ? <RefreshCcw size={18} /> : isRegisterMode ? <Send size={18} /> : <LogIn size={18} />}
                                {isForgotPasswordMode ? 'Request Link' : isRegisterMode ? 'Initialize' : 'Authenticate'}
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Controls */}
                <div className="mt-10 flex flex-col items-center gap-6">
                    {!isForgotPasswordMode && !isRegisterMode && (
                        <button
                            onClick={() => setMode('forgot_password')}
                            className="text-[10px] text-gray-500 hover:text-[#CCFF00] font-mono uppercase tracking-[0.2em] transition-colors"
                        >
                            Reset Credentials?
                        </button>
                    )}

                    <div className="h-[1px] w-full bg-[#333]"></div>

                    <button
                        onClick={() => {
                            setMode(isRegisterMode || isForgotPasswordMode ? 'login' : 'register');
                            setLocalError('');
                        }}
                        className="group flex items-center gap-3 text-sm font-mono uppercase tracking-tight"
                    >
                        <span className="text-gray-500 group-hover:text-gray-300">
                            {isRegisterMode || isForgotPasswordMode ? 'Return to' : 'New Terminal User?'}
                        </span>
                        <span className="text-[#CCFF00] font-black group-hover:underline underline-offset-4">
                            {isRegisterMode || isForgotPasswordMode ? 'Authentication' : 'Register'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};