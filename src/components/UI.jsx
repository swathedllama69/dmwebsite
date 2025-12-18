import React, { useEffect } from 'react';
import { ShoppingBag, Loader2, AlertCircle, CheckCircle, Save } from 'lucide-react';

export const GlobalStyles = ({ settings }) => {
    // We extract the custom styles from admin settings, or use defaults
    const primaryColor = settings?.primaryColor || '#CCFF00';
    const borderRadius = settings?.borderRadius || '12px';
    const heroOpacity = (settings?.heroOverlayOpacity || 50) / 100;

    return (
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=JetBrains+Mono:wght@300;400;700&display=swap');
        
        :root {
            --primary: ${primaryColor};
            --radius-main: ${borderRadius};
            --hero-opacity: ${heroOpacity};
        }

        .font-display { font-family: 'Archivo Black', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        
        /* Update your components to use the variables */
        .bg-primary { background-color: var(--primary); }
        .text-primary { color: var(--primary); }
        .border-primary { border-color: var(--primary); }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #080808; }
        ::-webkit-scrollbar-thumb { background: #333; }
        ::-webkit-scrollbar-thumb:hover { background: #CCFF00; }    

        ::selection { background: var(--primary); color: #000; }

        /* The Animated Cyber Grid now uses the variable */
        .animated-cyber-grid {
            background-image: radial-gradient(circle, var(--primary) 1px, transparent 1px);
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

    let bgColor, icon, iconColor;

    switch (type) {
        case 'success':
            bgColor = 'bg-[#CCFF00]';
            icon = CheckCircle;
            iconColor = 'text-black';
            break;
        case 'error':
            bgColor = 'bg-red-600';
            icon = AlertCircle;
            iconColor = 'text-white';
            break;
        case 'cart':
            bgColor = 'bg-blue-600';
            icon = ShoppingBag;
            iconColor = 'text-white';
            break;
        default:
            bgColor = 'bg-[#111]';
            icon = Save;
            iconColor = 'text-[#CCFF00]';
            break;
    }

    const IconComponent = icon;

    return (
        <div className="fixed top-20 right-4 z-[110] transition-transform duration-300 ease-out animate-in slide-in-from-right max-w-sm">
            <div className={`p-4 rounded-lg shadow-2xl border ${bgColor} font-mono text-sm flex items-start gap-3 ${type === 'success' ? 'text-black' : 'text-white'}`}>
                <IconComponent size={20} className={`mt-0.5 ${iconColor}`} />
                <span className="font-bold whitespace-normal break-words">{message}</span>
            </div>
        </div>
    );
}