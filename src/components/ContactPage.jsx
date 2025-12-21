import React, { useState } from 'react';
import {
    Mail,
    Phone,
    Send,
    Clock,
    Loader2,
    HelpCircle,
    Info,
    CheckCircle,
    ArrowRight
} from 'lucide-react';
import { API_BASE_URL } from '../utils/config.js';

export const ContactPage = () => {
    const phoneNumber = '+2348146068754';

    // UI States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);

    // Notification State (LOCAL)
    const [notification, setNotification] = useState(null);
    // { message: string, type: 'success' | 'error' }

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    // Topic State
    const [topic, setTopic] = useState('inquiry'); // inquiry | support

    const info = [
        { icon: <Phone size={18} />, label: "Direct Line", val: phoneNumber, link: `tel:${phoneNumber}` },
        {
            icon: <Mail size={18} />,
            label: "Support Node",
            val: topic === 'support'
                ? "support@devoltmould.com.ng"
                : "info@devoltmould.com.ng",
            link: null
        },
        { icon: <Clock size={18} />, label: "Uptime", val: "Mon-Fri: 9AM - 5PM (WAT)", link: null },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setNotification(null);

        const targetEmail =
            topic === 'support'
                ? 'support@devoltmould.com.ng'
                : 'info@devoltmould.com.ng';

        const subjectLine =
            topic === 'support'
                ? 'Support Request'
                : 'General Inquiry';

        try {
            const response = await fetch(`${API_BASE_URL}/send_email.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trigger: 'contact_form_submission',
                    email: targetEmail,
                    name: 'Admin',
                    data: {
                        sender_name: formData.name,
                        sender_email: formData.email,
                        message_body: formData.message,
                        topic: subjectLine
                    }
                })
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                setNotification({
                    message: 'Message sent successfully',
                    type: 'success'
                });
                setIsSent(true);
                setFormData({ name: '', email: '', message: '' });
            } else {
                throw new Error(result.message || 'Transmission Failed');
            }

        } catch (error) {
            console.error('Contact Error:', error);
            setNotification({
                message: 'Failed to send message. Please try WhatsApp.',
                type: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pt-32 pb-24 px-4 font-mono text-current">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                {/* LEFT / INFO */}
                <div className="flex flex-col justify-center">
                    <h1 className="font-display text-6xl md:text-8xl uppercase italic tracking-tighter mb-6 leading-none">
                        GET IN<br /><span className="text-primary">TOUCH</span>
                    </h1>
                    <p className="text-lg opacity-60 mb-10 max-w-md">
                        Have an inquiry? Our designers are ready to assist.
                    </p>

                    <div className="space-y-6">
                        {info.map((item, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="p-3 bg-card border border-white/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-black transition-all">
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase opacity-40 font-black tracking-widest">
                                        {item.label}
                                    </p>
                                    {item.link ? (
                                        <a
                                            href={item.link}
                                            className="text-lg hover:text-primary transition-colors"
                                        >
                                            {item.val}
                                        </a>
                                    ) : (
                                        <p className="text-lg">{item.val}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT / FORM */}
                <div className="bg-card border border-white/5 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative min-h-[500px] flex items-center">
                    <div className="absolute top-6 right-8 text-[10px] font-black opacity-20 uppercase tracking-widest">
                        Secure Form v2.0
                    </div>

                    {/* NOTIFICATION */}
                    {notification && (
                        <div
                            className={`absolute top-6 left-1/2 -translate-x-1/2 px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl
                            ${notification.type === 'success'
                                    ? 'bg-primary text-black'
                                    : 'bg-red-600 text-white'
                                }`}
                        >
                            {notification.message}
                        </div>
                    )}

                    {!isSent ? (
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6 w-full animate-in fade-in slide-in-from-right-4 duration-500"
                        >
                            {/* TOPIC */}
                            <div className="grid grid-cols-2 gap-4 p-1 bg-black/20 dark:bg-white/5 rounded-2xl border border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setTopic('inquiry')}
                                    className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2
                                    ${topic === 'inquiry'
                                            ? 'bg-primary text-black shadow-lg'
                                            : 'opacity-50 hover:opacity-100'
                                        }`}
                                >
                                    <Info size={14} /> General Inquiry
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setTopic('support')}
                                    className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2
                                    ${topic === 'support'
                                            ? 'bg-primary text-black shadow-lg'
                                            : 'opacity-50 hover:opacity-100'
                                        }`}
                                >
                                    <HelpCircle size={14} /> Support / Issues
                                </button>
                            </div>

                            {/* NAME */}
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black opacity-40 ml-2">
                                    Identity
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={e =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="w-full p-4 bg-black/20 dark:bg-white/5 border border-white/10 rounded-2xl focus:border-primary outline-none transition-all"
                                />
                            </div>

                            {/* EMAIL */}
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black opacity-40 ml-2">
                                    Digital Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="email@address.com"
                                    value={formData.email}
                                    onChange={e =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    className="w-full p-4 bg-black/20 dark:bg-white/5 border border-white/10 rounded-2xl focus:border-primary outline-none transition-all"
                                />
                            </div>

                            {/* MESSAGE */}
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black opacity-40 ml-2">
                                    Inquiry Details
                                </label>
                                <textarea
                                    rows="4"
                                    required
                                    placeholder="Your Inquiry Details..."
                                    value={formData.message}
                                    onChange={e =>
                                        setFormData({ ...formData, message: e.target.value })
                                    }
                                    className="w-full p-4 bg-black/20 dark:bg-white/5 border border-white/10 rounded-2xl focus:border-primary outline-none transition-all resize-none"
                                />
                            </div>

                            {/* SUBMIT */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-primary text-black py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_40px_-10px_var(--accent-color)] flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isSubmitting
                                    ? <Loader2 className="animate-spin" size={20} />
                                    : <>
                                        <Send size={20} /> Transmit Message
                                    </>
                                }
                            </button>
                        </form>
                    ) : (
                        /* SUCCESS VIEW */
                        <div className="w-full text-center flex flex-col items-center justify-center space-y-6 animate-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-black shadow-[0_0_40px_rgba(var(--primary-rgb),0.4)] mb-4">
                                <CheckCircle size={48} />
                            </div>

                            <div>
                                <h2 className="text-4xl font-display uppercase italic tracking-tighter mb-2">
                                    Transmission<br />Complete
                                </h2>
                                <p className="text-sm font-mono opacity-60 max-w-xs mx-auto leading-relaxed">
                                    Thank you. Your message has been successfully logged.
                                    Our team will respond shortly.
                                </p>
                            </div>

                            <button
                                onClick={() => setIsSent(false)}
                                className="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:underline underline-offset-4 transition-all"
                            >
                                Send Another Message <ArrowRight size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
