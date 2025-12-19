import React, { useEffect } from 'react';
import { ShoppingBag, Loader2, AlertCircle, CheckCircle, Save } from 'lucide-react';

export const GlobalStyles = ({ settings }) => {
    // Use the accent color from database, or fallback to the CSS variable
    const primaryColor = settings?.accent_color || 'var(--accent-color)';
    const borderRadius = settings?.borderRadius || '12px';
    const heroOpacity = (settings?.heroOverlayOpacity || 50) / 100;

    return (
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=JetBrains+Mono:wght@300;400;700&display=swap');
        
        :root {
            /* Syncing the settings-driven primary to our main accent variable */
            --accent-color: ${primaryColor};
            --radius-main: ${borderRadius};
            --hero-opacity: ${heroOpacity};
        }

        .font-display { font-family: 'Archivo Black', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        
        /* Custom Scrollbar - Now Dynamic */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--bg-color); }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--accent-color); }    

        ::selection { background: var(--accent-color); color: #000; }

        /* The Animated Cyber Grid now uses the variable */
        .animated-cyber-grid {
            background-image: radial-gradient(circle, var(--accent-color) 1px, transparent 1px);
            background-size: 30px 30px;
        }
        `}</style>
    );
};

// --- NotificationToast Component ---
export const NotificationToast = ({ notification, setNotification }) => {
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [notification, setNotification]);

    if (!notification) return null;

    const { message, type } = notification;

    // We define specific styles based on the type to ensure high contrast
    let containerStyles = '';
    let icon, iconColorClass;

    switch (type) {
        case 'success':
            // Accent background, Black text (always legible)
            containerStyles = 'bg-[var(--accent-color)] border-transparent text-black';
            icon = CheckCircle;
            iconColorClass = 'text-black';
            break;

        case 'error':
            // Red background, White text
            containerStyles = 'bg-red-600 border-transparent text-white';
            icon = AlertCircle;
            iconColorClass = 'text-white';
            break;

        case 'cart':
            // Blue background, White text
            containerStyles = 'bg-blue-600 border-transparent text-white';
            icon = ShoppingBag;
            iconColorClass = 'text-white';
            break;

        default:
            // DEFAULT (The Fix): 
            // Uses CSS Variables so it's White in Light Mode, and Black in Dark Mode.
            // Adds a border so the Black card is visible against the Black background.
            containerStyles = 'bg-[var(--card-bg)] border-[var(--border-color)] text-[var(--text-color)]';
            icon = Save;
            iconColorClass = 'text-[var(--text-color)]'; // Icon matches text color
            break;
    }

    const IconComponent = icon;

    return (
        <div className="fixed top-20 right-4 z-[110] transition-transform duration-300 ease-out animate-in slide-in-from-right max-w-sm">
            <div className={`p-4 rounded-lg shadow-2xl border font-mono text-sm flex items-start gap-3 ${containerStyles}`}>
                <IconComponent size={20} className={`mt-0.5 ${iconColorClass}`} />
                <span className="font-bold whitespace-normal break-words">{message}</span>
            </div>
        </div>
    );
}