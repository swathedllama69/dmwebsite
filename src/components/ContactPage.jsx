import React from 'react';
import { Mail, Phone, Send, Clock, Globe } from 'lucide-react'; // Added Clock and Globe for standard info

export const ContactPage = () => {
    // Defined contact info
    const phoneNumber = '+2348146068754';
    const supportEmail = 'info@devoltmould.com.ng';

    return (
        <div className="max-w-4xl mx-auto pt-32 pb-16 px-4 font-mono text-white">
            <h1 className="font-display text-5xl uppercase text-[#CCFF00] mb-6 border-b border-[#333] pb-3">
                <Mail size={48} className="inline mr-3" /> Get in Touch
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Contact Details */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold uppercase text-white mb-4">Contact Information</h2>

                    {/* Updated Phone Number */}
                    <div className="flex items-center space-x-3 text-gray-400">
                        <Phone size={20} className="text-[#CCFF00] flex-shrink-0" />
                        <a href={`tel:${phoneNumber}`} className="hover:text-white transition-colors">
                            {phoneNumber}
                        </a>
                    </div>

                    {/* Updated Email Address */}
                    <div className="flex items-center space-x-3 text-gray-400">
                        <Mail size={20} className="text-[#CCFF00] flex-shrink-0" />
                        <a href={`mailto:${supportEmail}`} className="hover:text-white transition-colors">
                            {supportEmail}
                        </a>
                    </div>

                    {/* Additional standard info (replaces address) */}
                    <div className="flex items-start space-x-3 text-gray-400">
                        <Clock size={20} className="text-[#CCFF00] flex-shrink-0 mt-1" />
                        <p>Mon - Fri: 9:00 AM - 5:00 PM (WAT)</p>
                    </div>
                    <div className="flex items-start space-x-3 text-gray-400">
                        <Globe size={20} className="text-[#CCFF00] flex-shrink-0 mt-1" />
                        <p>Serving Customers Worldwide</p>
                    </div>

                    <p className='pt-4 text-sm text-[#888]'>For technical support or large-volume inquiries, please use the contact form.</p>
                </div>

                {/* Contact Form (Set to mailto: action) */}
                <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#333]">
                    <h2 className="text-2xl font-bold uppercase text-white mb-4">Send Us a Message</h2>
                    {/* NOTE: Using mailto: for basic functionality. Full submission requires a backend API. */}
                    <form
                        action={`mailto:${supportEmail}`}
                        method="POST"
                        encType="text/plain"
                        className="space-y-4"
                    >
                        <input
                            type="text"
                            name="Name"
                            placeholder="Your Name"
                            className="w-full p-3 bg-black border border-[#333] text-white rounded focus:ring-1 focus:ring-[#CCFF00]"
                            required
                        />
                        <input
                            type="email"
                            name="Email"
                            placeholder="Your Email"
                            className="w-full p-3 bg-black border border-[#333] text-white rounded focus:ring-1 focus:ring-[#CCFF00]"
                            required
                        />
                        <textarea
                            rows="4"
                            name="Message"
                            placeholder="Your Message"
                            className="w-full p-3 bg-black border border-[#333] text-white rounded focus:ring-1 focus:ring-[#CCFF00]"
                            required
                        ></textarea>
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center w-full gap-2 bg-[#CCFF00] text-black px-6 py-3 rounded font-bold uppercase hover:bg-white transition-colors"
                        >
                            Send Message <Send size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};