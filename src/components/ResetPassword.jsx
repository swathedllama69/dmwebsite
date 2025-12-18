import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, Send, Loader2, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../utils/config';

export const ResetPassword = ({ setNotification }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [token, setToken] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState('');

    // 1. Extract token from URL on load
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const urlToken = queryParams.get('token');

        if (!urlToken) {
            setLocalError("Error: Password reset token is missing from the URL.");
        } else {
            setToken(urlToken);
        }
    }, [location.search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLocalError('');
        setNotification(null);

        if (!token) {
            setLocalError("Invalid or missing token. Please restart the password reset process.");
            setLoading(false);
            return;
        }

        if (newPassword.length < 8) {
            setLocalError("New password must be at least 8 characters long.");
            setLoading(false);
            return;
        }
        if (newPassword !== confirmPassword) {
            setLocalError("Passwords do not match.");
            setLoading(false);
            return;
        }

        const apiEndpoint = `${API_BASE_URL}/reset_password_confirm.php`;

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: token,
                    new_password: newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                // If the token is invalid/expired, the API should return a 401/404/400 error
                throw new Error(data.error || "Password reset failed.");
            }

            // Success: Notify and navigate to login
            setNotification({ message: data.message, type: 'success' });
            navigate('/login');

        } catch (err) {
            setLocalError(err.message);
            setNotification({ message: `Reset Failed: ${err.message}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full p-3 pl-10 bg-black border border-[#333] text-white rounded focus:ring-1 focus:ring-[#CCFF00] placeholder-[#888]";

    return (
        <div className="max-w-md mx-auto pt-32 pb-16 px-4 font-mono text-white">
            <h1 className="font-display text-4xl uppercase text-[#CCFF00] mb-6 text-center">
                Set New Password
            </h1>

            <form onSubmit={handleSubmit} className="bg-[#1a1a1a] p-8 rounded-lg border border-[#333] space-y-5 shadow-xl">

                {/* Status/Error Message Display */}
                {localError && (
                    <div className="flex items-center gap-2 p-3 bg-red-900/40 text-red-300 rounded text-sm">
                        <AlertCircle size={18} /> {localError}
                    </div>
                )}

                {token && !localError && (
                    <div className="p-3 bg-green-900/40 text-green-300 rounded text-sm text-center">
                        Token detected. Enter your new password below.
                    </div>
                )}

                {/* New Password Input */}
                <div className="relative">
                    <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#CCFF00]" />
                    <input
                        type="password"
                        placeholder="New Password (min 8 chars)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={inputStyle}
                        required
                        minLength={8}
                        disabled={loading || !token}
                    />
                </div>

                {/* Confirm Password Input */}
                <div className="relative">
                    <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#CCFF00]" />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={inputStyle}
                        required
                        disabled={loading || !token}
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="inline-flex items-center justify-center w-full gap-2 bg-[#CCFF00] text-black px-6 py-3 rounded font-bold uppercase hover:bg-white transition-colors disabled:opacity-50 mt-6"
                    disabled={loading || !token || localError}
                >
                    {loading ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                        <><Send size={20} /> Reset Password</>
                    )}
                </button>
            </form>

            <button
                onClick={() => navigate('/login')}
                className="mt-6 text-center text-[#888] hover:text-white block w-full text-sm font-mono"
            >
                Back to Login
            </button>
        </div>
    );
};