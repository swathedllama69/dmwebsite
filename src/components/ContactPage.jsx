import React from 'react';
import { Mail, Phone, Send, Clock, Globe, MapPin } from 'lucide-react';

export const ContactPage = () => {
    const phoneNumber = '+2348146068754';
    const supportEmail = 'info@devoltmould.com.ng';

    const info = [
        { icon: <Phone size={18} />, label: "Direct Line", val: phoneNumber, link: `tel:${phoneNumber}` },
        { icon: <Mail size={18} />, label: "Support Node", val: supportEmail, link: `mailto:${supportEmail}` },
        { icon: <Clock size={18} />, label: "Uptime", val: "Mon-Fri: 9AM - 5PM (WAT)", link: null },
    ];

    return (
        <div className="max-w-6xl mx-auto pt-32 pb-24 px-4 font-mono text-current">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                {/* Visual Side */}
                <div className="flex flex-col justify-center">
                    <h1 className="font-display text-6xl md:text-8xl uppercase italic tracking-tighter mb-6 leading-none">
                        GET IN<br /><span className="text-primary">TOUCH</span>
                    </h1>
                    <p className="text-lg opacity-60 mb-10 max-w-md">
                        Have a technical inquiry or a custom mould project? Our engineering team is ready to assist.
                    </p>

                    <div className="space-y-6">
                        {info.map((item, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="p-3 bg-card border border-white/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-black transition-all">
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase opacity-40 font-black tracking-widest">{item.label}</p>
                                    {item.link ? (
                                        <a href={item.link} className="text-lg hover:text-primary transition-colors">{item.val}</a>
                                    ) : (
                                        <p className="text-lg">{item.val}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Side */}
                <div className="bg-card border border-white/5 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative">
                    <div className="absolute top-6 right-8 text-[10px] font-black opacity-20 uppercase tracking-widest">Secure Form v2.0</div>

                    <form action={`mailto:${supportEmail}`} method="POST" encType="text/plain" className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black opacity-40 ml-2">Identity</label>
                            <input type="text" name="Name" placeholder="Full Name" required
                                className="w-full p-4 bg-black/20 dark:bg-white/5 border border-white/10 rounded-2xl focus:border-primary outline-none transition-all" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black opacity-40 ml-2">Digital Address</label>
                            <input type="email" name="Email" placeholder="email@address.com" required
                                className="w-full p-4 bg-black/20 dark:bg-white/5 border border-white/10 rounded-2xl focus:border-primary outline-none transition-all" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black opacity-40 ml-2">Inquiry Details</label>
                            <textarea rows="4" name="Message" placeholder="Describe your project requirements..." required
                                className="w-full p-4 bg-black/20 dark:bg-white/5 border border-white/10 rounded-2xl focus:border-primary outline-none transition-all resize-none" />
                        </div>

                        <button type="submit" className="w-full bg-primary text-black py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_40px_-10px_var(--accent-color)] flex items-center justify-center gap-3">
                            Transmit Message <Send size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};