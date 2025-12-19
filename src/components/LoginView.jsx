import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, LogIn, Send, Loader2, AlertCircle, RefreshCcw, ShieldCheck, X } from 'lucide-react';
import { API_BASE_URL } from '../utils/config';

// Added isModal and onClose props
export const LoginView = ({ setIsCustomerLoggedIn, setCustomerData, setNotification, navigateToAccount, isModal = false, onClose }) => {
    const navigate = useNavigate();
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

    const inputStyle = "w-full bg-black/40 border border-[#333] hover:border-[#444] text-white py-4 pl-12 pr-4 rounded-2xl outline-none focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00]/50 transition-all duration-300 placeholder:text-gray-600 font-mono text-sm";

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLocalError('');

        const action = isForgotPasswordMode ? 'reset' : (isRegisterMode ? 'register' : 'login');
        const endpoint = isForgotPasswordMode ? `${API_BASE_URL}/reset_password_request.php` : `${API_BASE_URL}/users.php?action=${action}`;
        const payload = isForgotPasswordMode ? { email: forgotPasswordEmail } : { action, email, password, ...(isRegisterMode && { name }) };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.error || "Authentication failed.");

            if (isForgotPasswordMode) {
                setNotification({ message: data.message || "Reset link sent.", type: 'success' });
                setMode('login');
            } else {
                const userData = data.user || { name: data.name, email: data.email, user_id: data.user_id };
                setIsCustomerLoggedIn(true);
                setCustomerData(userData);
                localStorage.setItem('customer_user', JSON.stringify(userData));

                setNotification({ message: `Welcome back, ${userData.name}`, type: 'success' });

                if (isModal) {
                    onClose(); // Close modal if logged in successfully
                } else {
                    navigateToAccount();
                }
            }
        } catch (err) { setLocalError(err.message); } finally { setLoading(false); }
    };

    return (
        <div className={isModal ? "w-full max-w-[420px] bg-[#080808] p-8 rounded-[2.5rem] border border-white/10 relative shadow-2xl" : "min-h-screen bg-[#080808] pt-44 pb-20 px-6 flex flex-col items-center"}>
            {isModal && (
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
                    <X size={24} />
                </button>
            )}

            <div className="text-center mb-8">
                <div className="inline-flex p-3 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/20 mb-4">
                    <ShieldCheck className="text-[#CCFF00]" size={28} />
                </div>
                <h1 className="text-3xl font-black uppercase text-white tracking-tighter italic">
                    {isForgotPasswordMode ? 'Recover' : isRegisterMode ? 'Enlist' : 'Access'}
                </h1>
            </div>

            {localError && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-[10px] font-mono mb-6">
                    <AlertCircle size={16} /> <span>{localError}</span>
                </div>
            )}

            <form onSubmit={handleAuthAction} className="space-y-4">
                {isRegisterMode && (
                    <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} /><input type="text" placeholder="NAME" value={name} onChange={e => setName(e.target.value)} className={inputStyle} required /></div>
                )}
                <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} /><input type="email" placeholder="EMAIL" value={isForgotPasswordMode ? forgotPasswordEmail : email} onChange={e => isForgotPasswordMode ? setForgotPasswordEmail(e.target.value) : setEmail(e.target.value)} className={inputStyle} required /></div>
                {!isForgotPasswordMode && (
                    <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} /><input type="password" placeholder="PASSWORD" value={password} onChange={e => setPassword(e.target.value)} className={inputStyle} required /></div>
                )}

                <button type="submit" disabled={loading} className="w-full bg-[#CCFF00] hover:bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all mt-4 flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : "Authorize"}
                </button>
            </form>

            <button onClick={() => setMode(isRegisterMode ? 'login' : 'register')} className="w-full text-center mt-6 text-[10px] font-mono text-gray-500 uppercase hover:text-[#CCFF00] transition-colors">
                {isRegisterMode ? 'Already **Enlisted? Login' : 'New Identity? Register Here'}
            </button>
        </div>
    );
};