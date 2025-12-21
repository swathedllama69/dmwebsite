import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingCart, X, Plus, Minus, Banknote,
    ArrowRight, CheckCircle, Loader2, Upload, ArrowLeft,
    CreditCard, Info, ShieldCheck, Phone, Mail,
    Send, Copy, AlertTriangle, MapPin, FileText, Smartphone,
    Package
} from 'lucide-react';
import { formatCurrency, getPrimaryImage, API_BASE_URL } from '../utils/config.js';

// --- Custom Confirmation Modal ---
const OrderModal = ({ isOpen, onClose, onConfirm, isSubmitting }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
            <div className="bg-card border border-current/10 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center text-current animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                    <ShieldCheck size={32} />
                </div>
                <h3 className="font-display text-2xl uppercase mb-2">Confirm Order</h3>
                <p className="font-mono text-xs opacity-60 mb-8 leading-relaxed">
                    Order will be logged as <strong>Pending</strong>. Processing begins after payment verification. Proceed?
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} disabled={isSubmitting} className="flex-1 py-3 rounded-xl border border-current/10 font-mono text-xs font-bold uppercase hover:bg-current/5 transition-colors">Cancel</button>
                    <button onClick={onConfirm} disabled={isSubmitting} className="flex-1 py-3 rounded-xl bg-primary text-black font-mono text-xs font-bold uppercase hover:opacity-90 transition-colors flex items-center justify-center gap-2">
                        {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : 'Place Order'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Dynamic Progress Bar ---
const CheckoutProgress = ({ step }) => {
    const steps = ['cart', 'details', 'review', 'payment', 'success'];
    const currentIdx = steps.indexOf(step);

    return (
        <div className="w-full max-w-2xl mx-auto mb-12">
            <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-current/5 rounded-full -z-10"></div>
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary transition-all duration-500 rounded-full -z-10"
                    style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((s, i) => {
                    const isActive = i <= currentIdx;
                    const isCurrent = i === currentIdx;
                    return (
                        <div key={s} className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${isActive
                                ? 'bg-primary border-primary text-black scale-110 shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]'
                                : 'bg-card border-current/10 text-current/30'
                                }`}>
                                {i + 1}
                            </div>
                            <span className={`text-[9px] uppercase font-black tracking-widest transition-all ${isCurrent ? 'text-primary' : 'text-current/20'}`}>
                                {s === 'details' ? 'Info' : s}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const CheckoutProcess = ({
    cart,
    currentCurrency,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    setNotification,
    userId,
    customerEmail,
    userFirstName,
    userLastName,
    userPhone,
    settings
}) => {
    const navigate = useNavigate();
    const [step, setStep] = useState('cart');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
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
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const subtotal = cart.reduce((sum, i) => sum + (i.quantity * (i.product.on_sale ? i.product.sale_price : i.product.price)), 0);

    useEffect(() => {
        fetch(`${API_BASE_URL}/settings.php?keys=accountName,accountNumber,bankName`)
            .then(res => res.json())
            .then(data => setBankDetails(data))
            .catch(err => console.error("Bank fetch error:", err));
    }, []);

    // Auto-Populate User Data
    useEffect(() => {
        if (userFirstName || userLastName || customerEmail || userPhone) {
            setFormData(prev => ({
                ...prev,
                firstName: userFirstName || prev.firstName,
                lastName: userLastName || prev.lastName,
                email: customerEmail || prev.email,
                phone: userPhone || prev.phone
            }));
        }
    }, [userFirstName, userLastName, customerEmail, userPhone]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setNotification({ message: "COPIED TO CLIPBOARD", type: 'success' });
    };

    const validateForm = () => {
        if (!formData.firstName || !formData.lastName || !formData.phone || !formData.address || !formData.email) {
            setNotification({ message: "All fields marked with * are required.", type: 'error' });
            return false;
        }
        return true;
    };

    const handlePlaceOrder = async () => {
        setIsSubmitting(true);
        try {
            const fullName = `${formData.firstName} ${formData.lastName}`.trim();

            // 1. Create Order
            const payload = {
                customer_info: { ...formData, name: fullName },
                order_notes: formData.orderNotes,
                cart_items: cart.map(i => ({
                    product_id: i.product.id,
                    product_name: i.product.name,
                    quantity: i.quantity,
                    price_at_purchase: i.product.on_sale ? i.product.sale_price : i.product.price
                })),
                total_cents: subtotal,
                user_id: userId,
                payment_method: paymentMethod
            };

            const res = await fetch(`${API_BASE_URL}/orders.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            console.log("Order Creation Response:", result);

            if (!res.ok || !result.success) throw new Error(result.error || "Order Failed");

            const idToSave = result.order_id || result.id || result.orderId;

            if (!idToSave) {
                throw new Error("Order Success but ID missing. Check console.");
            }

            setFinalOrderId(idToSave);
            setShowConfirmModal(false);
            setStep('payment');

            // 2. Trigger Email via New API (Robust Method)
            try {
                // Use full URL to avoid relative path issues if configured differently
                // Or use relative '/api/send_email.php' if hosted on same domain
                await fetch(`https://devoltmould.com.ng/api/send_email.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        trigger: "order_confirmation",
                        email: formData.email,
                        name: fullName,
                        data: {
                            order_id: idToSave,
                            total_price: formatCurrency(subtotal, currentCurrency, settings),
                            link: "https://devoltmould.com.ng/dashboard"
                        }
                    })
                });
            } catch (mailErr) {
                console.warn("Mail trigger failed, but order placed:", mailErr);
            }

        } catch (err) {
            console.error("Place Order Error:", err);
            setNotification({ message: err.message, type: 'error' });
        } finally { setIsSubmitting(false); }
    };

    const handleReceiptUpload = async (file) => {
        if (!file) return;

        if (!finalOrderId) {
            setNotification({ message: "Error: Order ID is missing. Cannot upload.", type: 'error' });
            return;
        }

        setIsSubmitting(true);
        setNotification({ message: "UPLOADING PROOF...", type: 'default' });

        const data = new FormData();
        data.append('order_id', finalOrderId);
        data.append('receipt_file', file);

        try {
            const res = await fetch(`${API_BASE_URL}/receipts.php`, { method: 'POST', body: data });
            const result = await res.json();

            if (!res.ok || result.error) throw new Error(result.error || "Upload Failed");

            setNotification({ message: "RECEIPT SENT SUCCESSFULLY", type: 'success' });
            clearCart();
            setStep('success');

            // Trigger Email for Receipt Upload
            try {
                await fetch(`https://devoltmould.com.ng/api/send_email.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        trigger: "payment_receipt", // Ensure this case exists in PHP
                        email: formData.email,
                        name: `${formData.firstName} ${formData.lastName}`,
                        data: {
                            order_id: finalOrderId,
                            amount_paid: "Receipt Uploaded",
                            link: "https://devoltmould.com.ng/admin"
                        }
                    })
                });
            } catch (e) { console.error("Receipt mail error", e); }

        } catch (err) {
            console.error("Upload Error:", err);
            setNotification({ message: "Upload failed. Please send via WhatsApp.", type: 'error' });
        } finally { setIsSubmitting(false); }
    };

    const inputClass = "w-full bg-transparent border border-current/10 p-4 rounded-xl outline-none focus:border-primary transition-all font-mono text-sm text-current placeholder:text-current/30";

    return (
        <div className="min-h-screen bg-background text-current pt-32 pb-20 px-4 transition-colors duration-500">
            <div className="max-w-6xl mx-auto">
                <CheckoutProgress step={step} />

                {step === 'cart' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="mb-12 flex justify-between items-end">
                            <div>
                                <h1 className="text-6xl font-display uppercase tracking-tighter italic text-current">Cart</h1>
                                <p className="font-mono text-xs opacity-60 mt-2 uppercase tracking-widest text-current">{cart.length} Items Selected</p>
                            </div>
                        </header>

                        <div className="grid lg:grid-cols-12 gap-12">
                            <div className="lg:col-span-8 space-y-4">
                                {cart.map(item => (
                                    <div key={item.product.id} className="flex gap-6 items-center bg-card border border-current/10 p-4 rounded-2xl group hover:border-primary/30 transition-all relative overflow-hidden">
                                        <div className="w-24 h-24 bg-black/5 dark:bg-white/5 rounded-xl overflow-hidden border border-current/5 shrink-0">
                                            <img src={getPrimaryImage(item.product.images)} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-black uppercase text-lg tracking-tight text-current">{item.product.name}</h4>
                                            <p className="font-mono text-sm opacity-60 mb-2 text-current">{item.product.category}</p>
                                            <p className="text-primary font-mono font-bold">{formatCurrency(item.product.on_sale ? item.product.sale_price : item.product.price, currentCurrency, settings)}</p>
                                        </div>
                                        <div className="flex items-center gap-4 bg-black/5 dark:bg-white/5 rounded-xl px-4 py-2 border border-current/5 text-current">
                                            <button onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)} className="hover:text-primary"><Minus size={16} /></button>
                                            <span className="font-mono font-bold w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)} className="hover:text-primary"><Plus size={16} /></button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.product.id)} className="p-3 hover:text-red-500 transition-colors opacity-40 hover:opacity-100 text-current"><X size={20} /></button>
                                    </div>
                                ))}
                                {cart.length === 0 && (
                                    <div className="text-center py-20 opacity-40 font-mono uppercase tracking-widest text-current flex flex-col items-center">
                                        <ShoppingCart size={48} className="mb-4 opacity-50" />
                                        Cart Empty
                                    </div>
                                )}
                            </div>

                            <div className="lg:col-span-4">
                                <div className="bg-card border border-current/10 p-8 rounded-3xl sticky top-32 text-current shadow-lg relative overflow-hidden">
                                    <Banknote className="absolute -right-4 -bottom-4 text-current opacity-[0.03] w-32 h-32 rotate-12" />
                                    <div className="flex justify-between items-center mb-8 pb-8 border-b border-current/10 relative z-10">
                                        <span className="font-black uppercase text-sm tracking-widest opacity-60">Subtotal</span>
                                        <span className="font-mono text-2xl font-bold">{formatCurrency(subtotal, currentCurrency, settings)}</span>
                                    </div>
                                    <button
                                        onClick={() => cart.length > 0 && setStep('details')}
                                        disabled={cart.length === 0}
                                        className="w-full bg-primary text-black py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 relative z-10 shadow-lg shadow-primary/20"
                                    >
                                        Continue <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'details' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-3xl mx-auto text-current">
                        <button onClick={() => setStep('cart')} className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest opacity-60 hover:opacity-100 mb-8"><ArrowLeft size={14} /> Back to Cart</button>

                        <div className="bg-card border border-current/10 p-8 md:p-12 rounded-[2rem] space-y-8 shadow-xl relative overflow-hidden">
                            <MapPin className="absolute -right-6 -top-6 text-current opacity-[0.03] w-48 h-48" />

                            <div className="relative z-10 grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1 text-current">First Name *</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" size={16} />
                                        <input value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className={`${inputClass} pl-12`} placeholder="FIRST NAME" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1 text-current">Last Name *</label>
                                    <input value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className={inputClass} placeholder="LAST NAME" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1 text-current">Phone Number *</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" size={16} />
                                        <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className={`${inputClass} pl-12`} placeholder="+234..." />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1 text-current">Email Address *</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" size={16} />
                                        <input
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className={`${inputClass} pl-12 ${userId ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            placeholder="EMAIL@ADDRESS.COM"
                                            readOnly={!!userId}
                                        />
                                    </div>
                                    {userId && <p className="text-[9px] text-primary ml-2 font-mono">Linked to your account</p>}
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1 text-current">Delivery Address *</label>
                                    <input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className={inputClass} placeholder="STREET ADDRESS" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1 text-current">City</label>
                                    <input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className={inputClass} placeholder="CITY" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1 text-current">Zip Code</label>
                                    <input value={formData.zip} onChange={e => setFormData({ ...formData, zip: e.target.value })} className={inputClass} placeholder="ZIP CODE" />
                                </div>
                            </div>

                            <div className="relative z-10 pt-8 border-t border-current/10">
                                <div className="flex items-center gap-2 mb-4 text-primary">
                                    <FileText size={18} />
                                    <h3 className="font-black uppercase text-sm tracking-widest">Custom Specifications</h3>
                                </div>
                                <p className="text-[10px] font-mono opacity-50 mb-4 leading-relaxed max-w-lg text-current">
                                    Please specify sizes, color preferences, or custom text engravings here.
                                </p>
                                <textarea
                                    value={formData.orderNotes}
                                    onChange={e => setFormData({ ...formData, orderNotes: e.target.value })}
                                    className={`${inputClass} min-h-[150px] resize-none bg-black/5 dark:bg-white/10`}
                                    placeholder="E.g. Size 10, Matte Black Finish, Engrave 'Forever'..."
                                />
                            </div>

                            <button onClick={() => validateForm() && setStep('review')} className="relative z-10 w-full bg-primary text-black py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg">
                                Review Order
                            </button>
                        </div>
                    </div>
                )}

                {step === 'review' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-4xl mx-auto text-current">
                        <button onClick={() => setStep('details')} className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest opacity-60 hover:opacity-100 mb-8"><ArrowLeft size={14} /> Edit Details</button>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="bg-card border border-current/10 p-6 rounded-[2rem] shadow-sm">
                                    <h3 className="font-black uppercase text-xs tracking-widest mb-6 opacity-50 flex items-center gap-2"><Package size={14} /> Order Summary</h3>
                                    <div className="space-y-4">
                                        {cart.map(item => (
                                            <div key={item.product.id} className="flex justify-between items-center text-sm font-mono border-b border-current/5 pb-2 last:border-0">
                                                <span>{item.quantity}x {item.product.name}</span>
                                                <span className="opacity-70">{formatCurrency((item.product.on_sale ? item.product.sale_price : item.product.price) * item.quantity, currentCurrency, settings)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between items-center pt-4 border-t border-current/10 font-bold text-lg">
                                            <span>Subtotal</span>
                                            <span className="text-primary">{formatCurrency(subtotal, currentCurrency, settings)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-primary/10 border border-primary/20 p-5 rounded-2xl flex gap-3 items-start text-primary">
                                    <Info size={18} className="mt-0.5 shrink-0" />
                                    <p className="text-[10px] font-mono opacity-80 leading-relaxed">
                                        <strong>NOTE:</strong> Delivery fees are excluded. Logistics costs will be calculated and billed separately upon dispatch.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-card border border-current/10 p-6 rounded-[2rem] shadow-sm">
                                    <h3 className="font-black uppercase text-xs tracking-widest mb-6 opacity-50 flex items-center gap-2"><CreditCard size={14} /> Payment Method</h3>
                                    <div className="space-y-3">
                                        <button onClick={() => setPaymentMethod('bank_transfer')} className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${paymentMethod === 'bank_transfer' ? 'bg-primary/10 border-primary text-primary' : 'bg-transparent border-current/10 opacity-50'}`}>
                                            <Banknote size={20} />
                                            <span className="font-bold text-sm uppercase">Bank Transfer</span>
                                            {paymentMethod === 'bank_transfer' && <CheckCircle size={16} className="ml-auto" />}
                                        </button>
                                        <button disabled className="w-full flex items-center gap-4 p-4 rounded-xl border border-current/5 bg-current/5 opacity-30 cursor-not-allowed">
                                            <CreditCard size={20} />
                                            <span className="font-bold text-sm uppercase">Card (Coming Soon)</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-card border border-current/10 p-6 rounded-[2rem] shadow-sm space-y-2">
                                    <h3 className="font-black uppercase text-xs tracking-widest mb-2 opacity-50">Ship To</h3>
                                    <p className="font-bold text-sm">{formData.firstName} {formData.lastName}</p>
                                    <p className="text-xs opacity-70 font-mono">{formData.email}</p>
                                    <p className="text-xs opacity-70 font-mono">{formData.address}, {formData.city}</p>
                                    <p className="text-xs opacity-70 font-mono">{formData.phone}</p>
                                </div>

                                <button onClick={() => setShowConfirmModal(true)} className="w-full bg-primary text-black py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20">
                                    Confirm Order
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'payment' && (
                    <div className="animate-in fade-in zoom-in duration-500 max-w-lg mx-auto text-center text-current">
                        <div className="mb-8">
                            <h2 className="text-4xl font-display uppercase italic mb-2">Payment</h2>
                            <p className="font-mono text-xs opacity-60">Order ID: <span className="text-primary font-bold">{finalOrderId}</span></p>
                        </div>

                        <div className="bg-card border border-current/10 p-8 rounded-[2.5rem] shadow-2xl mb-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2">Transfer Amount</p>
                            <h3 className="text-5xl font-display text-primary mb-8 tracking-tighter">{formatCurrency(subtotal, currentCurrency, settings)}</h3>

                            <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-6 border border-current/5 space-y-1">
                                <p className="font-mono text-xl font-bold tracking-widest">{bankDetails.accountNumber}</p>
                                <p className="text-[10px] uppercase font-black tracking-widest opacity-60">{bankDetails.bankName}</p>
                                <p className="text-[10px] uppercase font-bold opacity-40">{bankDetails.accountName}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="relative group w-full">
                                <input type="file" id="receipt" className="hidden" onChange={(e) => handleReceiptUpload(e.target.files[0])} />
                                <label htmlFor="receipt" className="flex flex-col items-center justify-center gap-3 bg-card hover:bg-primary hover:text-black border-2 border-dashed border-current/10 hover:border-primary p-8 rounded-3xl cursor-pointer transition-all">
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Upload size={24} />}
                                    <span className="font-black uppercase text-xs tracking-widest">Upload Payment Receipt</span>
                                </label>
                            </div>

                            <button onClick={() => { clearCart(); setStep('success'); }} className="text-xs font-mono uppercase underline opacity-50 hover:opacity-100 hover:text-primary transition-colors">
                                I'll send it later via WhatsApp
                            </button>
                        </div>
                    </div>
                )}

                {step === 'success' && (
                    <div className="animate-in fade-in zoom-in duration-700 max-w-2xl mx-auto text-center text-current">
                        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)]">
                            <CheckCircle size={40} className="text-black" />
                        </div>
                        <h1 className="text-5xl font-display uppercase italic mb-4">Order Placed!</h1>
                        <div onClick={() => copyToClipboard(finalOrderId)} className="inline-flex items-center gap-3 bg-card border border-current/10 px-6 py-3 rounded-xl cursor-pointer hover:border-primary transition-all mb-12">
                            <span className="font-mono font-bold text-xl tracking-widest">#{finalOrderId}</span>
                            <Copy size={14} className="opacity-50" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-12 text-left">
                            <div className="bg-card border border-current/10 p-6 rounded-2xl relative overflow-hidden">
                                <FileText className="absolute -right-2 -bottom-2 text-current opacity-[0.03] w-20 h-20" />
                                <h4 className="font-black uppercase text-xs mb-2 opacity-50">Next Steps</h4>
                                <p className="text-[10px] font-mono leading-relaxed opacity-80">
                                    We will verify your payment and process your order. Updates will be sent to your email.
                                </p>
                            </div>
                            <div className="bg-card border border-current/10 p-6 rounded-2xl relative overflow-hidden">
                                <Smartphone className="absolute -right-2 -bottom-2 text-current opacity-[0.03] w-20 h-20" />
                                <h4 className="font-black uppercase text-xs mb-2 opacity-50">Need Help?</h4>
                                <div className="flex flex-col gap-2">
                                    <a href="https://wa.me/2348146068754" target="_blank" className="flex items-center gap-2 text-[10px] font-bold hover:text-primary transition-colors"><Smartphone size={12} /> WhatsApp Support</a>
                                    <a href="mailto:sales@devoltmould.com.ng" className="flex items-center gap-2 text-[10px] font-bold hover:text-primary transition-colors"><Mail size={12} /> sales@devoltmould.com.ng</a>
                                </div>
                            </div>
                        </div>

                        <button onClick={() => navigate('/')} className="px-10 py-4 rounded-full border border-current/10 hover:bg-current hover:text-background font-black text-xs uppercase tracking-widest transition-all">
                            Back to Home
                        </button>
                    </div>
                )}

                <OrderModal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={handlePlaceOrder}
                    isSubmitting={isSubmitting}
                />
            </div>
        </div>
    );
};