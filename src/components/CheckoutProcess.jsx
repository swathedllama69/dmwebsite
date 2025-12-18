import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingCart as CartIcon, X, Plus, Minus, Banknote,
    ArrowRight, CheckCircle, Loader2, Upload, ArrowLeft,
    CreditCard, Info, ShieldCheck, MessageSquare, Phone, Mail, Send, Copy, AlertTriangle
} from 'lucide-react';
import { formatCurrency, getPrimaryImage, API_BASE_URL } from '../utils/config.js';

export const CheckoutProcess = ({ cart, currentCurrency, updateCartQuantity, removeFromCart, clearCart, setNotification, userId, customerEmail, customerName, navigateToShop }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState('cart');

    const [formData, setFormData] = useState({
        name: customerName || '',
        email: customerEmail || '',
        phone: '',
        address: '',
        city: '',
        zip: '',
        orderNotes: ''
    });

    const [finalOrderId, setFinalOrderId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
    const [bankDetails, setBankDetails] = useState({ accountName: '', accountNumber: '', bankName: '' });

    const subtotal = cart.reduce((sum, i) => sum + (i.quantity * (i.product.on_sale ? i.product.sale_price : i.product.price)), 0);
    const totalCents = subtotal;

    useEffect(() => {
        fetch(`${API_BASE_URL}/settings.php?keys=accountName,accountNumber,bankName`)
            .then(res => res.json())
            .then(data => setBankDetails(data))
            .catch(err => console.error("Bank fetch error:", err));
    }, []);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setNotification({ message: "Order ID Copied!", type: 'success' });
    };

    const handlePlaceOrder = async () => {
        setIsSubmitting(true);
        setNotification({ message: "Finalizing Order...", type: 'default' });

        try {
            const payload = {
                customer_info: { ...formData },
                order_notes: formData.orderNotes,
                cart_items: cart.map(i => ({
                    product_id: i.product.id,
                    product_name: i.product.name,
                    quantity: i.quantity,
                    price_at_purchase: i.product.on_sale ? i.product.sale_price : i.product.price
                })),
                total_cents: totalCents,
                user_id: userId,
                payment_method: paymentMethod
            };

            const res = await fetch(`${API_BASE_URL}/orders.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Order Failed");

            setFinalOrderId(result.order_id);
            setStep('payment_upload');
            window.scrollTo(0, 0);
        } catch (err) {
            setNotification({ message: err.message, type: 'error' });
        } finally { setIsSubmitting(false); }
    };

    const handleReceiptUpload = async (file) => {
        if (!file) return;
        setIsSubmitting(true);
        setNotification({ message: "Syncing Receipt...", type: 'default' });

        const data = new FormData();
        data.append('order_id', finalOrderId);
        data.append('receipt_file', file);

        try {
            const res = await fetch(`${API_BASE_URL}/receipts.php`, { method: 'POST', body: data });
            const result = await res.json();
            if (!res.ok || result.error) throw new Error(result.error || "Upload Failed");

            clearCart();
            setStep('success');
        } catch (err) {
            setNotification({ message: "Upload Error. Please use Support Channels.", type: 'error' });
        } finally { setIsSubmitting(false); }
    };

    if (step === 'success') {
        return (
            <div className="text-center py-24 bg-black min-h-screen px-4 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
                <div className="w-20 h-20 bg-[#CCFF00] rounded-full flex items-center justify-center mb-8">
                    <CheckCircle size={40} className="text-black" />
                </div>
                <h1 className="text-6xl font-display text-white uppercase mb-2 tracking-tighter italic">Logged</h1>
                <div className="flex items-center gap-3 bg-[#111] px-6 py-3 rounded-2xl border border-gray-800 mb-8 cursor-pointer active:scale-95" onClick={() => copyToClipboard(finalOrderId)}>
                    <p className="text-[#CCFF00] font-mono text-xl font-black">{finalOrderId}</p>
                    <Copy size={16} className="text-gray-500" />
                </div>

                <div className="max-w-md bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-2xl mb-12 flex gap-4 items-start text-left">
                    <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                    <p className="text-yellow-500 text-[11px] font-black uppercase leading-tight font-mono">
                        IMPORTANT: PLEASE KEEP THIS ORDER NUMBER SAFELY. You will need it to verify your payment or track your shipment.
                    </p>
                </div>

                <div className="max-w-2xl grid md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-[#111] p-8 rounded-3xl border border-gray-800 text-left">
                        <h3 className="text-white font-black uppercase text-xs mb-4 border-b border-gray-800 pb-2 italic">Next Step</h3>
                        <p className="text-gray-500 text-[10px] uppercase font-mono font-bold leading-relaxed">
                            Awaiting transfer verification. You will receive an email once confirmed.
                        </p>
                    </div>
                    <div className="bg-[#111] p-8 rounded-3xl border border-gray-800 text-left">
                        <h3 className="text-white font-black uppercase text-xs mb-4 border-b border-gray-800 pb-2 italic">Help Line</h3>
                        <div className="space-y-4">
                            <a href="https://wa.me/2348146068754" target="_blank" className="flex items-center gap-3 text-[10px] font-black uppercase text-gray-300 hover:text-[#CCFF00] transition-colors font-mono">
                                <Send size={14} /> WhatsApp
                            </a>
                            <a href="mailto:sales@devoltmould.com.ng" className="flex items-center gap-3 text-[10px] font-black uppercase text-gray-300 hover:text-[#CCFF00] transition-colors font-mono">
                                <Mail size={14} /> Email Support
                            </a>
                        </div>
                    </div>
                </div>

                <button onClick={() => navigate('/')} className="bg-[#CCFF00] text-black px-12 py-5 rounded-2xl font-black uppercase text-lg hover:scale-105 transition-all">
                    Finish
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080808] text-white pt-32 pb-20 px-4">
            <div className="max-w-6xl mx-auto">

                {step === 'payment_upload' ? (
                    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
                        <div className="text-center">
                            <h2 className="text-5xl font-display uppercase text-white mb-2 tracking-tighter">Settlement</h2>
                            <p className="text-gray-500 font-mono text-[10px] font-black uppercase tracking-widest italic opacity-50">Log Reference: {finalOrderId}</p>
                        </div>

                        <div className="bg-[#CCFF00] text-black p-10 rounded-[2.5rem] text-center shadow-[0_20px_60px_rgba(204,255,0,0.1)] relative">
                            <p className="text-[10px] uppercase font-black mb-1 tracking-[0.2em] opacity-40">Grand Total:</p>
                            <h3 className="text-6xl font-display font-black tracking-tighter">
                                {formatCurrency(totalCents, currentCurrency)}
                            </h3>
                            <div className="mt-8 pt-6 border-t border-black/10 font-mono">
                                <p className="font-black text-2xl tracking-tighter">{bankDetails.accountNumber}</p>
                                <p className="uppercase font-black text-[9px] tracking-[0.2em] mt-1">{bankDetails.bankName} • {bankDetails.accountName}</p>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <div className="relative group bg-white text-black py-10 rounded-3xl flex flex-col items-center justify-center transition-all hover:bg-[#CCFF00] cursor-pointer border-4 border-transparent hover:border-black/5">
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleReceiptUpload(e.target.files[0])} />
                                <Upload size={32} className="mb-2" />
                                <span className="font-black uppercase text-lg italic tracking-tight">Upload Proof</span>
                                <p className="text-[10px] font-black opacity-40">INSTANT VERIFICATION</p>
                            </div>

                            <div className="bg-[#111] border border-gray-800 rounded-3xl p-8 space-y-6">
                                <div className="space-y-2">
                                    <p className="text-white font-black uppercase text-[10px] tracking-widest italic">Pay Later or Support</p>
                                    <p className="text-gray-500 text-[10px] font-mono leading-relaxed uppercase">
                                        You can complete the order now and send the receipt later via WhatsApp or Email.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <a href={`https://wa.me/2348146068754?text=Order%20Receipt%20for%20${finalOrderId}`} target="_blank" className="flex items-center justify-center gap-2 bg-[#1a1a1a] border border-gray-800 text-white py-4 rounded-2xl text-[10px] font-black uppercase transition-all hover:bg-green-600 hover:border-green-600"><Send size={14} /> WhatsApp</a>
                                    <a href={`mailto:sales@devoltmould.com.ng?subject=Payment%20Receipt%20${finalOrderId}`} className="flex items-center justify-center gap-2 bg-[#1a1a1a] border border-gray-800 text-white py-4 rounded-2xl text-[10px] font-black uppercase transition-all hover:bg-blue-600 hover:border-blue-600"><Mail size={14} /> Email</a>
                                </div>
                                <button onClick={() => { clearCart(); setStep('success'); }} className="w-full bg-[#CCFF00]/5 text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-[#CCFF00]/20">
                                    I will Pay / Upload Later →
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* --- NORMAL CHECKOUT FLOW --- */
                    <div className="grid lg:grid-cols-12 gap-12 animate-in fade-in duration-500">
                        <div className="lg:col-span-7">
                            <h1 className="text-6xl font-display uppercase mb-12 text-white tracking-tighter italic">
                                {step === 'cart' ? 'Cart' : step === 'form' ? 'Delivery' : 'Audit'}
                            </h1>

                            {step === 'cart' && (
                                <div className="space-y-4">
                                    {cart.map(item => (
                                        <div key={item.product.id} className="flex gap-6 items-center bg-[#111] p-6 rounded-3xl border border-gray-800 hover:border-[#CCFF00] transition-all group">
                                            <img src={getPrimaryImage(item.product.images)} className="w-24 h-24 object-cover rounded-2xl bg-black border border-gray-800" />
                                            <div className="flex-grow">
                                                <h4 className="font-black text-white text-xl uppercase tracking-tighter group-hover:text-[#CCFF00] transition-all">{item.product.name}</h4>
                                                <p className="text-[#CCFF00] font-mono text-lg font-black">{formatCurrency(item.product.on_sale ? item.product.sale_price : item.product.price, currentCurrency)}</p>
                                            </div>
                                            <div className="flex items-center bg-black rounded-xl border border-gray-800 p-1 font-mono">
                                                <button onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)} className="p-2 text-white"><Minus size={16} /></button>
                                                <span className="w-8 text-center font-black text-white">{item.quantity}</span>
                                                <button onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)} className="p-2 text-white"><Plus size={16} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {step === 'form' && (
                                <div className="space-y-6">
                                    <div className="bg-[#111] p-10 rounded-[2rem] border border-gray-800 grid grid-cols-2 gap-6">
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Full Name</label>
                                            <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-black border-b-2 border-gray-800 p-4 rounded-xl text-white font-bold focus:border-[#CCFF00] outline-none" placeholder="RECIPIENT" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Email</label>
                                            <input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-black border-b-2 border-gray-800 p-4 rounded-xl text-white font-bold focus:border-[#CCFF00] outline-none" placeholder="AUDIT@EMAIL.COM" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-[#CCFF00] uppercase font-black tracking-widest">Phone</label>
                                            <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-black border-b-2 border-[#CCFF00]/30 p-4 rounded-xl text-[#CCFF00] font-black focus:border-[#CCFF00] outline-none" placeholder="+234..." />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Shipping Address</label>
                                            <input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full bg-black border-b-2 border-gray-800 p-4 rounded-xl text-white font-bold focus:border-[#CCFF00] outline-none" placeholder="DETAILED ADDRESS" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-gray-600 uppercase font-black tracking-widest">City</label>
                                            <input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full bg-black border-b-2 border-gray-800 p-4 rounded-xl text-white font-bold focus:border-[#CCFF00] outline-none" placeholder="LAGOS" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Zip</label>
                                            <input value={formData.zip} onChange={e => setFormData({ ...formData, zip: e.target.value })} className="w-full bg-black border-b-2 border-gray-800 p-4 rounded-xl text-white font-bold focus:border-[#CCFF00] outline-none" placeholder="100001" />
                                        </div>
                                    </div>
                                    <textarea value={formData.orderNotes} onChange={e => setFormData({ ...formData, orderNotes: e.target.value })} className="w-full bg-[#111] border border-gray-800 p-6 rounded-[2rem] text-white font-mono text-sm min-h-[100px] outline-none focus:border-[#CCFF00]" placeholder="SPECIFICATIONS / NOTES..." />
                                </div>
                            )}

                            {step === 'confirm' && (
                                <div className="space-y-8 animate-in fade-in duration-500 font-mono">
                                    <div className="bg-[#111] p-10 rounded-[2rem] border-2 border-[#CCFF00]/20 space-y-6 uppercase">
                                        <div className="flex items-center gap-4 text-[#CCFF00]">
                                            <ShieldCheck size={32} />
                                            <h3 className="text-2xl font-black italic">Verification</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-8 text-[10px] border-t border-gray-800 pt-6">
                                            <div>
                                                <p className="text-gray-600 font-black mb-1">Entity</p>
                                                <p className="text-white font-bold">{formData.name}</p>
                                                <p className="text-gray-400">{formData.phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 font-black mb-1">Terminal</p>
                                                <p className="text-white font-bold">{formData.address}</p>
                                                <p className="text-gray-400">{formData.city}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-5">
                            <div className="bg-[#111] p-10 rounded-[2.5rem] border border-gray-800 sticky top-32 shadow-2xl">
                                <h3 className="text-2xl font-display uppercase mb-8 text-white tracking-widest border-b border-gray-800 pb-6 italic">Summary</h3>
                                <div className="space-y-6 mb-10">
                                    <div className="flex gap-4 bg-[#CCFF00]/5 p-5 rounded-2xl border border-[#CCFF00]/20 font-mono">
                                        <Info size={20} className="text-[#CCFF00] shrink-0" />
                                        <p className="text-[10px] text-white uppercase font-black leading-relaxed">
                                            Logistics <span className="text-[#CCFF00]">Billed Separately</span> After Dispatch.
                                        </p>
                                    </div>
                                    <div className="flex justify-between text-white font-black text-2xl uppercase italic">
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(subtotal, currentCurrency)}</span>
                                    </div>
                                    <div className="flex justify-between text-5xl font-display text-[#CCFF00] pt-8 border-t border-gray-800 tracking-tighter">
                                        <span>Total</span>
                                        <span>{formatCurrency(totalCents, currentCurrency)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        if (step === 'cart') setStep('form');
                                        else if (step === 'form') setStep('confirm');
                                        else handlePlaceOrder();
                                    }}
                                    className="w-full bg-[#CCFF00] text-black py-6 rounded-2xl font-black uppercase text-xl hover:bg-white transition-all flex items-center justify-center gap-4"
                                    disabled={isSubmitting || cart.length === 0}
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : (
                                        <>
                                            {step === 'cart' ? 'Shipment' : step === 'form' ? 'Audit' : 'Complete Log'}
                                            <ArrowRight size={24} />
                                        </>
                                    )}
                                </button>
                                {step !== 'cart' && (
                                    <button onClick={() => setStep(step === 'confirm' ? 'form' : 'cart')} className="w-full mt-6 text-gray-600 font-bold uppercase text-[10px] hover:text-[#CCFF00] transition-colors tracking-widest">
                                        ← Previous Phase
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};