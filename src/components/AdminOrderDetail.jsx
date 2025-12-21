import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Loader2, ArrowLeft, Printer, FileText, CheckCircle, ExternalLink,
    AlertCircle, RefreshCw, Mail, MapPin, Globe, Package, MessageSquare, Clock,
    ChevronDown, Save, X, Phone, User, Calendar, Trash2, Edit3, Lock, BellRing,
    Instagram, Twitter, Upload, XCircle, ShieldCheck, Send
} from 'lucide-react';
import { API_BASE_URL, formatCurrency } from '../utils/config.js';

// --- HELPER CONFIGURATION ---
// UPDATED: Only use this local format as a last resort. 
// We will prioritize order.order_number from the DB.
const formatOrderId = (id) => id ? `ORD-${parseInt(id) + 8800}` : '...';
const LOGO_URL = "https://devoltmould.com.ng/resources/devolt_logo.png";

const formatPrice = (cents, currency) => {
    if (!cents && cents !== 0) return '---';
    const code = currency?.code || 'NGN';
    const amount = cents / 100;
    try {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: code, minimumFractionDigits: 2 }).format(amount);
    } catch (e) { return `${amount.toFixed(2)}`; }
};

const getImageSrc = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const root = API_BASE_URL.replace('/api', '');
    return `${root}/${cleanPath}`;
};

// --- CONFIRMATION POPUP COMPONENT ---
const ConfirmationModal = ({ title, message, onConfirm, onCancel, isProcessing }) => (
    <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-[#111] border border-white/10 w-full max-w-sm rounded-3xl p-8 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
            <h3 className="text-white font-black uppercase text-xl mb-3 tracking-tight">{title}</h3>
            <p className="text-gray-400 text-xs mb-8 leading-relaxed font-mono">{message}</p>
            <div className="flex gap-4">
                <button onClick={onCancel} disabled={isProcessing} className="flex-1 py-4 rounded-xl border border-white/10 text-white font-bold text-xs uppercase hover:bg-white/5 transition-colors">
                    Cancel
                </button>
                <button onClick={onConfirm} disabled={isProcessing} className="flex-1 py-4 rounded-xl bg-primary text-black font-black text-xs uppercase hover:bg-primary/90 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-primary/20">
                    {isProcessing ? <Loader2 size={16} className="animate-spin" /> : "Confirm"}
                </button>
            </div>
        </div>
    </div>
);

// --- INVOICE MODAL ---
const InvoiceModal = ({ order, onClose }) => {
    if (!order) return null;
    const docDate = new Date(order.created_at).toLocaleDateString();
    const isPaid = ['processing', 'shipped', 'delivered', 'completed', 'proof provided'].includes(order.status?.toLowerCase());
    const docTitle = isPaid ? "OFFICIAL RECEIPT" : "PROFORMA INVOICE";

    // UPDATED: Use the real order number for the filename
    const realOrderId = order.order_number || order.order_number_display || formatOrderId(order.id);

    const handlePrint = () => {
        const originalTitle = document.title;
        const firstName = order.customer_name ? order.customer_name.split(' ')[0] : 'Customer';
        const fileName = `ADMIN_${isPaid ? 'RECEIPT' : 'INVOICE'}_${firstName}_${realOrderId}`;
        document.title = fileName;
        window.print();
        setTimeout(() => { document.title = originalTitle; }, 1000);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 text-black">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap');
                @media print {
                    @page { size: A4; margin: 0; }
                    html, body { height: 100%; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
                    body * { visibility: hidden; }
                    #printable-receipt, #printable-receipt * { visibility: visible; }
                    #printable-receipt { position: absolute; left: 0; top: 0; width: 100%; max-width: 210mm; padding: 40px; background: white; color: black !important; }
                    .no-print { display: none !important; }
                }
            `}</style>
            <div id="printable-receipt" className="bg-white w-full max-w-md rounded-xl shadow-2xl relative animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="no-print absolute top-3 right-3 z-10 p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200"><X size={20} /></button>
                <div className="p-8 overflow-y-auto print:overflow-visible print:p-0">
                    <div className="flex flex-col items-center text-center border-b border-dashed border-gray-300 pb-6 mb-6 print:border-black">
                        <img src={LOGO_URL} alt="Devolt Logo" className="h-14 w-auto object-contain mb-2" />
                        <div className="text-2xl font-black uppercase mb-1" style={{ fontFamily: "'Cinzel', serif" }}>- DEVOLT -</div>
                        <div className={`text-xs font-black uppercase tracking-[0.3em] border px-3 py-1 rounded mb-4 ${isPaid ? 'border-black text-black' : 'border-gray-300 text-gray-400'}`}>{docTitle}</div>
                        <div className="w-full flex justify-between text-xs border-t border-dashed border-gray-200 pt-4 print:border-black">
                            <div className="text-left"><span className="block text-gray-400 uppercase text-[10px]">Ref No.</span><span className="font-mono font-bold">#{realOrderId}</span></div>
                            <div className="text-right"><span className="block text-gray-400 uppercase text-[10px]">Date</span><span className="font-mono font-bold">{docDate}</span></div>
                        </div>
                    </div>

                    <div className="mb-8 text-sm">
                        <p className="font-bold uppercase text-[10px] text-gray-400 tracking-widest mb-2 border-b border-gray-100 pb-1 print:border-black">Billed To</p>
                        <p className="font-bold text-lg">{order.customer_name}</p>
                        <p className="text-gray-600">{order.shipping_address}, {order.shipping_city}</p>
                        <p className="text-gray-600 mt-1 text-xs">{order.customer_email}</p>
                        {order.shipping_phone && <p className="text-gray-600 text-xs">{order.shipping_phone}</p>}
                    </div>
                    <div className="mb-8">
                        <div className="space-y-4">
                            {order.items && order.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm items-start">
                                    <div className="pr-4 flex-1">
                                        <div className="font-bold">{item.product_name}</div>
                                        <div className="text-[10px] text-gray-500 uppercase mt-0.5">Qty: {item.quantity} {item.size ? `• ${item.size}` : ''}</div>
                                    </div>
                                    <div className="font-mono text-right font-medium">{formatPrice((item.price_cents || item.price_at_purchase) * item.quantity)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="border-t-2 border-black pt-4 mb-8 flex justify-between items-end">
                        <div className="text-xs text-gray-500">Total {isPaid ? 'Paid' : 'Due'}</div>
                        <div className="text-2xl font-black font-display">{formatPrice(order.total_cents)}</div>
                    </div>
                    <div className="mt-auto pt-8 border-t border-gray-100 print:border-black text-center space-y-4">
                        <div className="space-y-1">
                            <p className="font-bold uppercase text-[10px] tracking-widest">Thank you for your business!</p>
                            <p className="text-[9px] text-gray-500 max-w-[200px] mx-auto">We appreciate your trust in Devolt Mould.</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100 no-print rounded-b-xl">
                    <button onClick={handlePrint} className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg text-xs font-bold uppercase hover:bg-gray-800 transition-colors">
                        <Printer size={16} /> Print {isPaid ? 'Receipt' : 'Invoice'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const AdminOrderDetail = ({ setNotification, currentCurrency }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [paymentProof, setPaymentProof] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedItems, setEditedItems] = useState([]);
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', action: null });

    // Custom Message State
    const [customMessage, setCustomMessage] = useState('');
    const [isSendingMsg, setIsSendingMsg] = useState(false);

    // --- HELPER TO GET REAL ORDER ID ---
    const getRealOrderId = () => {
        if (!order) return '';
        // Prioritize the actual DB order number, fallback to display logic, then local formatter
        return order.order_number || order.order_number_display || formatOrderId(order.id);
    };

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            const [oRes, rRes] = await Promise.all([
                fetch(`${API_BASE_URL}/orders.php?action=get_order&id=${id}`),
                fetch(`${API_BASE_URL}/receipts.php`)
            ]);
            const oData = await oRes.json();
            const rData = await rRes.json();

            let orderObj = Array.isArray(oData) ? oData[0] : (oData.order || oData);

            if (orderObj) {
                if (typeof orderObj.items === 'string') {
                    try { orderObj.items = JSON.parse(orderObj.items); } catch (e) { orderObj.items = []; }
                }
            }
            setOrder(orderObj);
            setEditedItems(orderObj.items || []);

            const myReceipt = rData.find(r => parseInt(r.order_id) === parseInt(orderObj.id || id));
            setPaymentProof(myReceipt || null);

        } catch (err) {
            setNotification({ message: "Sync Error", type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [id, setNotification]);

    useEffect(() => { fetchAllData(); }, [fetchAllData]);

    const triggerConfirm = (title, message, action) => {
        setConfirmModal({ show: true, title, message, action });
    };

    const handleConfirmAction = async () => {
        if (!confirmModal.action) return;
        setIsUpdating(true);
        try {
            await confirmModal.action();
        } catch (error) {
            console.error(error);
        } finally {
            setIsUpdating(false);
            setConfirmModal({ ...confirmModal, show: false });
        }
    };

    const getStatusColor = (status) => {
        const s = status?.toLowerCase() || '';
        if (s === 'pending') return 'bg-yellow-500 text-black border-yellow-600';
        if (s === 'processing') return 'bg-blue-600 text-white border-blue-700';
        if (s === 'shipped') return 'bg-purple-600 text-white border-purple-700';
        if (s === 'delivered') return 'bg-cyan-600 text-black border-cyan-700';
        if (s === 'completed') return 'bg-green-600 text-white border-green-700';
        if (s === 'cancelled') return 'bg-red-600 text-white border-red-700';
        if (s === 'proof provided') return 'bg-orange-500 text-black border-orange-600';
        return 'bg-white text-black border-gray-300';
    };

    // --- HELPER: TRIGGER EMAIL ---
    const triggerSystemEmail = async (triggerType, dataPayload = {}) => {
        try {
            // NOTE: Using the direct API endpoint since orders.php might not be triggering it
            await fetch(`https://devoltmould.com.ng/api/send_email.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trigger: triggerType,
                    email: order.customer_email,
                    name: order.customer_name,
                    data: {
                        order_id: getRealOrderId(), // Use the correct ID here
                        link: "https://devoltmould.com.ng/dashboard",
                        ...dataPayload
                    }
                })
            });
            console.log(`Email triggered: ${triggerType}`);
        } catch (e) {
            console.error("Email trigger failed:", e);
        }
    };

    const updateStatus = async (newStatus) => {
        triggerConfirm(
            "Update Status?",
            `Change order status to "${newStatus}"? This will trigger an email notification to the customer.`,
            async () => {
                const res = await fetch(`${API_BASE_URL}/orders.php`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: order.id, status: newStatus, notify_customer: true })
                });
                const result = await res.json();

                if (result.success) {
                    setNotification({ message: "Status Updated", type: 'success' });
                    setOrder(prev => ({ ...prev, status: newStatus }));

                    // --- FIX: MANUALLY TRIGGER EMAIL HERE ---
                    // This ensures the email sends even if orders.php doesn't do it
                    await triggerSystemEmail('status_update', {
                        new_status: newStatus
                    });

                } else throw new Error(result.error);
            }
        );
    };

    // --- CUSTOM MESSAGE SENDER ---
    const handleSendCustomMessage = async () => {
        if (!customMessage.trim()) return;

        setIsSendingMsg(true);
        try {
            // Updated to use getRealOrderId()
            await triggerSystemEmail('admin_message', {
                message_body: customMessage.replace(/\n/g, '<br>'),
            });

            setNotification({ message: "Message Sent Successfully", type: 'success' });
            setCustomMessage('');
        } catch (e) {
            console.error(e);
            setNotification({ message: "Network Error", type: 'error' });
        } finally {
            setIsSendingMsg(false);
        }
    };

    // --- RECEIPT ACTIONS ---
    const handleAdminReceiptUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUpdating(true);
        setNotification({ message: "Uploading proof...", type: 'default' });

        const formData = new FormData();
        formData.append('order_id', order.id);
        formData.append('receipt_file', file);

        try {
            const res = await fetch(`${API_BASE_URL}/receipts.php`, { method: 'POST', body: formData });
            const result = await res.json();
            if (result.success || res.ok) {
                setNotification({ message: "Receipt Uploaded", type: 'success' });
                fetchAllData();
            } else throw new Error(result.error);
        } catch (err) {
            setNotification({ message: err.message, type: 'error' });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleVerifyReceipt = () => {
        triggerConfirm(
            "Verify Payment?",
            "Mark receipt as Verified? This will automatically set order status to 'Processing' and notify the customer.",
            async () => {
                const res = await fetch(`${API_BASE_URL}/receipts.php`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: paymentProof.id,
                        verification_status: 'Verified',
                        order_id: order.id
                    })
                });
                if (res.ok) {
                    setOrder(prev => ({ ...prev, status: 'Processing' }));
                    setNotification({ message: "Payment Verified", type: 'success' });

                    // Trigger "Processing" Email Manually
                    await triggerSystemEmail('status_update', { new_status: 'Processing' });

                    fetchAllData();
                } else setNotification({ message: "Verification failed", type: 'error' });
            }
        );
    };

    const handleRejectReceipt = () => {
        triggerConfirm(
            "Reject Payment?",
            "Mark receipt as Rejected? This will set order status to 'Pending' and notify the customer.",
            async () => {
                const res = await fetch(`${API_BASE_URL}/receipts.php`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: paymentProof.id,
                        verification_status: 'Rejected',
                        order_id: order.id
                    })
                });
                if (res.ok) {
                    setOrder(prev => ({ ...prev, status: 'Pending' }));
                    setNotification({ message: "Payment Rejected", type: 'success' });

                    // Trigger Payment Rejected Email
                    await triggerSystemEmail('payment_rejected');

                    fetchAllData();
                } else setNotification({ message: "Action failed", type: 'error' });
            }
        );
    };

    const handleDeleteReceipt = () => {
        triggerConfirm(
            "Delete Receipt?",
            "Permanently delete this receipt record?",
            async () => {
                const res = await fetch(`${API_BASE_URL}/receipts.php?id=${paymentProof.id}`, { method: 'DELETE' });
                if (res.ok) {
                    setNotification({ message: "Receipt Deleted", type: 'success' });
                    setPaymentProof(null);
                    fetchAllData();
                } else {
                    setNotification({ message: "Delete failed", type: 'error' });
                }
            }
        );
    };

    const saveItems = async () => {
        const newTotal = editedItems.reduce((sum, item) => sum + ((item.price_cents || item.price_at_purchase) * item.quantity), 0);
        triggerConfirm(
            "Save Changes?",
            `Order total will be recalculated to ${formatCurrency(newTotal, currentCurrency)}.`,
            async () => {
                const res = await fetch(`${API_BASE_URL}/orders.php`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'update_items',
                        id: order.id,
                        items: editedItems,
                        total_cents: newTotal,
                        notify_customer: true
                    })
                });
                const result = await res.json();
                if (result.success) {
                    setNotification({ message: "Order updated", type: 'success' });
                    setOrder(prev => ({ ...prev, items: editedItems, total_cents: newTotal }));
                    setIsEditing(false);

                    // Optionally notify customer of update
                    // await triggerSystemEmail('admin_message', { message_body: "Your order items have been updated by admin." });
                } else throw new Error(result.error);
            }
        );
    };

    const sendReminder = async () => {
        triggerConfirm(
            "Send Reminder?",
            "Send an email payment reminder to the customer?",
            async () => {
                await triggerSystemEmail('payment_reminder');
                setNotification({ message: "Reminder email queued", type: 'success' });
            }
        );
    };

    const updateQty = (idx, d) => {
        const ni = [...editedItems];
        if (ni[idx].quantity + d > 0) { ni[idx].quantity += d; setEditedItems(ni); }
    };

    const removeItem = (idx) => {
        if (window.confirm("Remove item?")) setEditedItems(editedItems.filter((_, i) => i !== idx));
    };

    const currentTotal = useMemo(() => (isEditing ? editedItems : order?.items || []).reduce((s, i) => s + ((i.price_cents || i.price_at_purchase) * i.quantity), 0), [isEditing, editedItems, order]);

    if (loading) return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={48} /></div>;
    if (!order) return <div className="pt-32 text-center text-current">Order not found.</div>;

    const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Completed', 'Cancelled', 'Proof Provided'];
    const isPaid = ['processing', 'shipped', 'delivered', 'completed', 'proof provided'].includes(order.status?.toLowerCase());

    return (
        <>
            {showInvoiceModal && <InvoiceModal order={order} onClose={() => setShowInvoiceModal(false)} />}
            {confirmModal.show && <ConfirmationModal {...confirmModal} onConfirm={handleConfirmAction} onCancel={() => setConfirmModal({ ...confirmModal, show: false })} isProcessing={isUpdating} />}

            <div className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-8 font-sans text-current animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-center bg-card p-5 rounded-2xl border border-white/10 shadow-2xl gap-4 sticky top-20 z-40 backdrop-blur-md bg-opacity-90">
                    <button onClick={() => navigate('/admin')} className="text-current hover:text-primary flex items-center gap-2 font-black uppercase text-xs tracking-tighter transition-colors">
                        <ArrowLeft size={18} /> Back
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <select
                                value={order.status}
                                onChange={(e) => updateStatus(e.target.value)}
                                disabled={isUpdating}
                                className={`appearance-none pl-4 pr-10 py-3 rounded-xl font-bold text-xs uppercase tracking-wider outline-none cursor-pointer transition-all disabled:opacity-50 border ${getStatusColor(order.status)}`}
                            >
                                {statusOptions.map(s => <option key={s} value={s} className="bg-white text-black">{s}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 pointer-events-none mix-blend-difference text-white" size={14} />
                        </div>

                        <button onClick={() => setShowInvoiceModal(true)} className="bg-white/5 border border-white/10 text-current px-4 py-3 rounded-xl font-black uppercase text-xs flex items-center gap-2 hover:bg-white/10 transition-colors">
                            <Printer size={16} /> {isPaid ? 'Receipt' : 'Invoice'}
                        </button>
                        <button onClick={() => isEditing ? saveItems() : setIsEditing(true)} disabled={isUpdating} className={`px-6 py-3 rounded-xl font-black uppercase text-xs flex items-center gap-2 transition-all shadow-lg ${isEditing ? 'bg-primary text-black hover:scale-105' : 'bg-card border border-white/10 hover:border-primary'}`}>
                            {isUpdating ? <Loader2 size={16} className="animate-spin" /> : isEditing ? <><Save size={16} /> Save</> : <><Edit3 size={16} /> Edit</>}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT: Customer & Contents */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-gradient-to-br from-card to-background border border-white/10 p-8 rounded-3xl shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-primary/10 transition-all duration-700"></div>
                            <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
                                <div className="space-y-4">
                                    <div><p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Customer Profile</p><h1 className="text-3xl font-black uppercase leading-none">{order.customer_name}</h1></div>
                                    <div className="flex flex-wrap gap-4 text-xs font-mono opacity-80">
                                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><Mail size={12} className="text-primary" /> {order.customer_email}</div>
                                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><Phone size={12} className="text-primary" /> {order.shipping_phone || "N/A"}</div>
                                    </div>
                                </div>
                                <div className="text-right space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Reference</p>
                                    <h2 className="text-4xl font-black text-primary font-display tracking-tighter">{getRealOrderId()}</h2>
                                    <div className="flex items-center justify-end gap-2 text-xs font-mono opacity-60"><Calendar size={12} /> {new Date(order.created_at).toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        <div className={`bg-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl transition-all ${isEditing ? 'ring-2 ring-primary/50' : ''}`}>
                            <div className="p-6 bg-white/5 border-b border-white/10 flex justify-between items-center">
                                <h3 className="font-black uppercase text-sm flex items-center gap-3"><Package size={18} className="text-primary" /> {isEditing ? 'Editing Contents...' : 'Package Contents'}</h3>
                                {isEditing && <span className="text-[10px] text-primary font-bold animate-pulse">EDIT MODE ACTIVE</span>}
                            </div>
                            <div className="divide-y divide-white/5">
                                {(isEditing ? editedItems : order.items)?.map((item, idx) => (
                                    <div key={idx} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                                        <div className="flex items-center gap-5 flex-1">
                                            <div className="w-16 h-16 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex-shrink-0 relative">
                                                {item.image_url ? <img src={getImageSrc(item.image_url)} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center opacity-20"><Package size={24} /></div>}
                                                {!isEditing && <div className="absolute bottom-0 right-0 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-tl-md">x{item.quantity}</div>}
                                            </div>
                                            <div>
                                                <p className="font-bold uppercase text-sm">{item.product_name}</p>
                                                <div className="flex gap-3 text-[10px] mt-1 opacity-60 font-mono uppercase"><span>Price: {formatCurrency(item.price_cents || item.price_at_purchase, currentCurrency)}</span></div>
                                            </div>
                                        </div>
                                        {isEditing ? (
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center bg-white/5 rounded-lg border border-white/10">
                                                    <button onClick={() => updateQty(idx, -1)} className="px-3 py-1 hover:bg-white/10 text-lg">-</button>
                                                    <span className="w-8 text-center font-mono font-bold text-sm">{item.quantity}</span>
                                                    <button onClick={() => updateQty(idx, 1)} className="px-3 py-1 hover:bg-white/10 text-lg">+</button>
                                                </div>
                                                <button onClick={() => removeItem(idx)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16} /></button>
                                            </div>
                                        ) : (
                                            <p className="font-mono font-bold text-sm">{formatCurrency((item.price_cents || item.price_at_purchase) * item.quantity, currentCurrency)}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="p-8 bg-white/5 border-t border-white/10 flex justify-between items-center">
                                <span className="font-black uppercase text-xs tracking-widest opacity-60">Total Value</span>
                                <span className={`text-3xl font-black italic tracking-tighter text-primary transition-all ${isEditing ? 'scale-110' : ''}`}>{formatCurrency(currentTotal, currentCurrency)}</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Payment, Status & Custom Message */}
                    <div className="space-y-6">
                        {/* Custom Message Box */}
                        <div className="bg-card rounded-3xl border border-white/10 p-6 shadow-xl">
                            <h3 className="font-black uppercase text-xs flex items-center gap-2 border-b border-white/10 pb-4 mb-4 opacity-80">
                                <Send size={16} /> Send Custom Email
                            </h3>
                            <div className="space-y-3">
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-gray-500 outline-none focus:border-primary resize-none h-24"
                                    placeholder="Type message to customer..."
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                />
                                <button
                                    onClick={handleSendCustomMessage}
                                    disabled={isSendingMsg || !customMessage.trim()}
                                    className="w-full bg-primary/10 text-primary border border-primary/20 py-3 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-primary hover:text-black transition-all disabled:opacity-50"
                                >
                                    {isSendingMsg ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} /> Send Message</>}
                                </button>
                            </div>
                        </div>

                        <div className="bg-card rounded-3xl border border-white/10 p-6 shadow-xl">
                            <h3 className="font-black uppercase text-xs flex items-center gap-2 border-b border-white/10 pb-4 mb-4 opacity-80"><MapPin size={16} /> Shipping Details</h3>
                            <div className="space-y-4 text-xs font-mono opacity-80 leading-relaxed"><p className="font-bold">{order.shipping_address}</p><p>{order.shipping_city}, {order.shipping_zip}</p><p>{order.shipping_country}</p></div>
                        </div>

                        {/* Customer Note */}
                        {order.order_notes && (
                            <div className="bg-primary/5 rounded-3xl border border-primary/20 p-6">
                                <h3 className="font-black uppercase text-xs flex items-center gap-2 text-primary mb-3"><MessageSquare size={16} /> Customer Note</h3>
                                <p className="text-xs font-mono italic opacity-80">"{order.order_notes}"</p>
                            </div>
                        )}

                        <div className="bg-card rounded-3xl border border-white/10 p-6 shadow-xl relative overflow-hidden">
                            <h3 className="font-black uppercase text-xs flex items-center gap-2 border-b border-white/10 pb-4 mb-4 opacity-80">
                                <ShieldCheck size={16} /> Payment Verification
                            </h3>
                            {paymentProof ? (
                                <div className="space-y-4">
                                    <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-black group relative">
                                        <img src={getImageSrc(paymentProof.file_path)} className="w-full h-full object-cover opacity-80" alt="Proof" />
                                        <a href={getImageSrc(paymentProof.file_path)} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                                            <div className="bg-primary text-black px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2"><ExternalLink size={14} /> View Original</div>
                                        </a>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                                        <span className="text-[10px] font-mono opacity-50">Current Status</span>
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${paymentProof.verification_status === 'Verified' ? 'bg-green-500/10 text-green-500 border-green-500/20' : paymentProof.verification_status === 'Rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                            {paymentProof.verification_status}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <button onClick={handleVerifyReceipt} className="bg-green-600/20 text-green-500 border border-green-600/30 hover:bg-green-600 hover:text-white py-3 rounded-xl font-bold text-xs uppercase flex justify-center items-center gap-2 transition-all">
                                            <CheckCircle size={14} /> Verify
                                        </button>
                                        <button onClick={handleRejectReceipt} className="bg-red-600/20 text-red-500 border border-red-600/30 hover:bg-red-600 hover:text-white py-3 rounded-xl font-bold text-xs uppercase flex justify-center items-center gap-2 transition-all">
                                            <XCircle size={14} /> Reject
                                        </button>
                                    </div>
                                    <button onClick={handleDeleteReceipt} className="w-full text-xs text-red-500/60 hover:text-red-500 underline decoration-red-500/30 hover:decoration-red-500 py-2">
                                        Delete Receipt Record
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="py-8 text-center border-2 border-dashed border-white/10 rounded-2xl opacity-50">
                                        <AlertCircle size={24} className="mx-auto mb-2" />
                                        <p className="text-[10px] font-bold uppercase">No Proof Uploaded</p>
                                    </div>
                                    <div className="relative group">
                                        <input type="file" onChange={handleAdminReceiptUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={isUpdating} />
                                        <button className="w-full py-3 rounded-xl border border-dashed border-white/20 hover:border-primary text-current hover:text-primary font-bold text-xs uppercase flex justify-center items-center gap-2 transition-all">
                                            <Upload size={14} /> Upload for Customer
                                        </button>
                                    </div>
                                    <button onClick={sendReminder} className="w-full py-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-bold uppercase text-xs rounded-xl hover:bg-yellow-500 hover:text-black transition-all flex items-center justify-center gap-2">
                                        <BellRing size={14} /> Send Reminder
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminOrderDetail;