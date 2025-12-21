import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Package, ArrowLeft, MapPin, Receipt, Phone,
    Loader2, AlertCircle, MessageSquare, Box, Printer,
    Instagram, Twitter, Mail, Upload, Eye, CheckCircle,
    Calendar, CreditCard, Clock
} from 'lucide-react';
import { API_BASE_URL, formatCurrency } from '../utils/config.js';

// --- CONFIGURATION ---
const formatOrderId = (id) => `ORD-${parseInt(id) + 8800}`;
const LOGO_URL = "https://devoltmould.com.ng/resources/devolt_logo.png";

export const CustomerOrderDetail = ({ setNotification, currentCurrency }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Receipt State
    const [receipt, setReceipt] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadKey, setUploadKey] = useState(0); // To reset file input

    // --- FETCH DATA ---
    const fetchOrderDetails = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError(null);

        try {
            // 1. Fetch Order
            const response = await fetch(`${API_BASE_URL}/orders.php?id=${id}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();

            let targetOrder = null;
            if (Array.isArray(data) && data.length > 0) targetOrder = data[0];
            else if (data && !Array.isArray(data)) targetOrder = data;
            else throw new Error("Order not found.");

            // Parse Items
            if (targetOrder.items && typeof targetOrder.items === 'string') {
                try { targetOrder.items = JSON.parse(targetOrder.items); } catch (e) { targetOrder.items = []; }
            }
            if (!Array.isArray(targetOrder.items)) targetOrder.items = [];

            setOrder(targetOrder);

            // 2. Fetch Receipts to check if one exists for this order
            // Note: Optimally, the order endpoint should return this, but we can fetch separately safely.
            const receiptRes = await fetch(`${API_BASE_URL}/receipts.php`);
            if (receiptRes.ok) {
                const allReceipts = await receiptRes.json();
                // Find receipt for this specific numeric ID
                const myReceipt = allReceipts.find(r => parseInt(r.order_id) === parseInt(targetOrder.id));
                setReceipt(myReceipt || null);
            }

        } catch (e) {
            setError(e.message);
            if (setNotification) setNotification({ message: "Error loading order details.", type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [id, setNotification]);

    useEffect(() => { fetchOrderDetails(); }, [fetchOrderDetails]);

    // --- UPLOAD HANDLER ---
    const handleReceiptUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !order) return;

        setIsUploading(true);
        setNotification({ message: "UPLOADING RECEIPT...", type: 'default' });

        const formData = new FormData();
        formData.append('order_id', order.id); // Send raw ID, backend handles decoding
        formData.append('receipt_file', file);

        try {
            const res = await fetch(`${API_BASE_URL}/receipts.php`, {
                method: 'POST',
                body: formData
            });

            const result = await res.json();

            if (!res.ok || result.error) {
                throw new Error(result.error || "Upload failed");
            }

            setNotification({ message: "RECEIPT SENT SUCCESSFULLY", type: 'success' });

            // Refresh to show the new receipt status
            fetchOrderDetails();
            setUploadKey(prev => prev + 1); // Reset input

        } catch (err) {
            console.error(err);
            setNotification({ message: err.message || "Upload failed.", type: 'error' });
        } finally {
            setIsUploading(false);
        }
    };

    // --- PRINT LOGIC ---
    const handlePrint = () => {
        if (!order) return;
        const originalTitle = document.title;
        const firstName = (order.customer_name || 'Customer').split(' ')[0];
        const fileName = `${firstName}_${formatOrderId(order.id)}`;
        document.title = fileName;
        window.print();
        setTimeout(() => { document.title = originalTitle; }, 1000);
    };

    if (loading) return <div className="pt-40 flex justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;

    if (error || !order) return (
        <div className="pt-32 px-4 max-w-lg mx-auto text-current">
            <div className="p-8 bg-card border border-white/10 rounded-3xl text-center shadow-xl">
                <AlertCircle className="text-red-500 mx-auto mb-4" size={32} />
                <h3 className="text-lg font-bold mb-2">Order Unavailable</h3>
                <p className="text-xs opacity-60 mb-6">{error || "Could not find this order."}</p>
                <button onClick={() => navigate('/account')} className="underline text-xs font-bold uppercase tracking-widest">Return Dashboard</button>
            </div>
        </div>
    );

    const docDate = new Date(order.created_at).toLocaleDateString();
    const docTime = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <>
            {/* =====================================================================================
                1. PRINT STYLES (Standardized A4)
               ===================================================================================== */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap');
                @media print {
                    @page { size: A4; margin: 0; }
                    html, body { height: 100%; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
                    body * { visibility: hidden; } 
                    #print-receipt, #print-receipt * { visibility: visible; }
                    #print-receipt {
                        position: absolute; left: 0; top: 0; width: 100%; max-width: 210mm;
                        padding: 40px; background: white; color: black; display: block !important;
                    }
                    .no-print { display: none !important; }
                }
            `}</style>

            {/* --- HIDDEN PRINT TEMPLATE --- */}
            <div id="print-receipt" className="hidden print:block bg-white text-black font-sans">
                <div className="flex flex-col items-center text-center border-b border-black pb-6 mb-8">
                    <img src={LOGO_URL} alt="Devolt Logo" className="h-16 w-auto object-contain mb-2" />
                    <div className="text-3xl font-black tracking-widest uppercase mb-1" style={{ fontFamily: "'Cinzel', serif" }}>- DEVOLT -</div>
                    <p className="text-[10px] uppercase tracking-widest mb-4">Moulding the New Standard</p>
                    <div className="w-full flex justify-between items-end border-t border-dashed border-gray-400 pt-4 mt-2">
                        <div className="text-left">
                            <span className="block text-[10px] uppercase tracking-wider font-bold">Order ID</span>
                            <span className="font-mono font-bold text-lg">#{order.order_number_display || formatOrderId(order.id)}</span>
                        </div>
                        <div className="text-right">
                            <span className="block text-[10px] uppercase tracking-wider font-bold">Date</span>
                            <span className="font-mono font-bold">{docDate}</span>
                        </div>
                    </div>
                </div>
                {/* ... (Print Layout kept same as previous) ... */}
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <p className="font-bold uppercase text-[10px] border-b border-black pb-1 mb-2 inline-block">Billed To</p>
                        <p className="font-bold text-lg">{order.customer_name}</p>
                        <p className="text-sm">{order.customer_email}</p>
                        <p className="text-sm">{order.shipping_phone}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold uppercase text-[10px] border-b border-black pb-1 mb-2 inline-block">Shipping Address</p>
                        <p className="text-sm max-w-[200px] leading-relaxed">
                            {order.shipping_address}<br />{order.shipping_city} {order.shipping_zip}<br />{order.shipping_country}
                        </p>
                    </div>
                </div>
                <div className="mb-8">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b-2 border-black">
                                <th className="text-left py-2 uppercase text-[10px] tracking-widest">Item Description</th>
                                <th className="text-center py-2 uppercase text-[10px] tracking-widest">Qty</th>
                                <th className="text-right py-2 uppercase text-[10px] tracking-widest">Price</th>
                                <th className="text-right py-2 uppercase text-[10px] tracking-widest">Total</th>
                            </tr>
                        </thead>
                        <tbody className="font-mono">
                            {order.items.map((item, i) => (
                                <tr key={i} className="border-b border-gray-200">
                                    <td className="py-3">
                                        <span className="font-bold block text-sm">{item.product_name}</span>
                                        {item.size && <span className="text-[10px]">Size: {item.size}</span>}
                                    </td>
                                    <td className="py-3 text-center align-top">{item.quantity}</td>
                                    <td className="py-3 text-right align-top">{formatCurrency(item.price_cents || (item.price * 100), currentCurrency)}</td>
                                    <td className="py-3 text-right align-top font-bold">{formatCurrency((item.price_cents || (item.price * 100)) * item.quantity, currentCurrency)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end mb-12">
                    <div className="w-1/2">
                        <div className="flex justify-between py-4 border-b-2 border-black">
                            <span className="text-sm uppercase font-black">Total</span>
                            <span className="font-mono text-xl font-bold">{formatCurrency(order.total_cents, currentCurrency)}</span>
                        </div>
                    </div>
                </div>
                <div className="mt-auto pt-8 border-t border-black text-center">
                    <div className="flex justify-center items-center gap-6 text-[10px] uppercase font-bold tracking-widest mb-4">
                        <span className="flex items-center gap-1"><MapPin size={12} /> Abuja, Nigeria</span>
                        <span className="flex items-center gap-1"><Mail size={12} /> sales@devoltmould.com.ng</span>
                    </div>
                </div>
            </div>

            {/* =====================================================================================
                2. SCREEN DASHBOARD UI
               ===================================================================================== */}
            <div className="max-w-5xl mx-auto pt-32 pb-20 px-4 md:px-8 text-current animate-in fade-in slide-in-from-bottom-4 print:hidden">

                {/* Header Navigation */}
                <div className="mb-8">
                    <button onClick={() => navigate('/account')} className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest opacity-60 hover:opacity-100 hover:text-primary transition-all mb-6">
                        <ArrowLeft size={12} /> Back to Dashboard
                    </button>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">
                                Order <span className="text-primary">{formatOrderId(order.id)}</span>
                            </h1>
                            <div className="flex items-center gap-4 mt-2 text-xs font-mono opacity-60">
                                <span className="flex items-center gap-1"><Calendar size={12} /> {docDate}</span>
                                <span className="flex items-center gap-1"><Clock size={12} /> {docTime}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 bg-card border border-white/20 text-current px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors shadow-lg"
                            >
                                <Printer size={14} /> Print Receipt
                            </button>

                            {/* Status Badge */}
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${order.status === 'Completed' || order.status === 'Delivered'
                                ? 'bg-green-500/10 border-green-500/20 text-green-500'
                                : 'bg-white/5 border-white/10 text-current'
                                }`}>
                                <div className={`w-2 h-2 rounded-full ${order.status === 'Completed' || order.status === 'Delivered' ? 'bg-green-500' : 'bg-primary'}`}></div>
                                <span className="text-[10px] font-bold uppercase tracking-widest">{order.status}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN: Items & Notes */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Dynamic Card Container */}
                        <div className="bg-card border border-white/10 rounded-3xl overflow-hidden shadow-sm">
                            {/* Card Header */}
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                    <Package size={14} /> Package Contents
                                </h3>
                                <span className="text-[10px] font-bold bg-white/10 text-current px-2 py-1 rounded border border-white/5">
                                    {order.items?.length || 0} ITEMS
                                </span>
                            </div>

                            {/* Card Content */}
                            <div className="divide-y divide-white/5">
                                {order.items && order.items.map((item, idx) => (
                                    <div key={idx} className="p-6 flex gap-5">
                                        <div className="h-20 w-20 bg-white/5 rounded-xl border border-white/10 overflow-hidden relative shrink-0">
                                            {item.image_url || item.image ? (
                                                <img src={item.image_url || item.image} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full opacity-20"><Box size={20} /></div>
                                            )}
                                            <div className="absolute bottom-0 right-0 bg-white/20 text-current backdrop-blur-md text-[9px] font-black px-1.5 py-0.5 rounded-tl-lg border-l border-t border-white/10">
                                                x{item.quantity}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-sm uppercase tracking-wide">{item.product_name}</h4>
                                                <p className="font-mono font-bold text-sm">{formatCurrency((item.price_cents || item.price * 100) * item.quantity, currentCurrency)}</p>
                                            </div>
                                            {item.size && <p className="text-[10px] opacity-60 mt-1 uppercase">Size: {item.size}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {order.order_notes && (
                            <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl flex gap-4">
                                <MessageSquare className="text-primary shrink-0" size={20} />
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1 text-primary">Order Note</h4>
                                    <p className="text-sm font-mono italic opacity-80">"{order.order_notes}"</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Logistics & Payment */}
                    <div className="space-y-6">

                        {/* Payment & Receipt Card */}
                        <div className="bg-card border border-white/10 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                            {receipt && (
                                <div className="absolute top-0 right-0 bg-green-500/10 text-green-500 px-3 py-1 rounded-bl-xl text-[9px] font-black uppercase tracking-widest border-b border-l border-green-500/20 flex items-center gap-1">
                                    <CheckCircle size={10} /> Payment Submitted
                                </div>
                            )}

                            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-6 flex items-center gap-2">
                                <Receipt size={14} /> Payment Details
                            </h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-xs font-mono">
                                    <span className="opacity-60 flex items-center gap-2"><CreditCard size={12} /> Method</span>
                                    <span className="uppercase font-bold">{order.payment_method || 'Bank Transfer'}</span>
                                </div>
                                <div className="flex justify-between text-xs font-mono">
                                    <span className="opacity-60">Subtotal</span>
                                    <span>{formatCurrency(order.total_cents, currentCurrency)}</span>
                                </div>
                                <div className="flex justify-between text-xs font-mono">
                                    <span className="opacity-60">Status</span>
                                    <span className={receipt ? "text-green-500 font-bold" : "text-yellow-500 font-bold"}>
                                        {receipt ? "Verification Pending" : "Awaiting Proof"}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-dashed border-white/20 flex justify-between items-center mb-6">
                                <span className="font-black uppercase text-xs">Total</span>
                                <span className="text-xl font-black italic tracking-tighter text-primary">
                                    {formatCurrency(order.total_cents, currentCurrency)}
                                </span>
                            </div>

                            {/* Upload / View Receipt Logic */}
                            <div className="bg-white/5 rounded-xl p-1">
                                {receipt ? (
                                    <a
                                        href={receipt.file_path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-white/10 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-wide group"
                                    >
                                        <Eye size={14} className="group-hover:text-primary transition-colors" />
                                        View Uploaded Receipt
                                    </a>
                                ) : (
                                    <div className="relative group">
                                        <input
                                            key={uploadKey}
                                            type="file"
                                            onChange={handleReceiptUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            disabled={isUploading}
                                        />
                                        <button className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-dashed border-primary/30 text-primary bg-primary/5 group-hover:bg-primary/10 transition-all text-xs font-bold uppercase tracking-wide ${isUploading ? 'opacity-50' : ''}`}>
                                            {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                            {isUploading ? "Uploading..." : "Upload Payment Proof"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Shipping Card */}
                        <div className="bg-card border border-white/10 rounded-3xl p-8">
                            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-6 flex items-center gap-2">
                                <MapPin size={14} /> Shipping To
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold uppercase">{order.customer_name}</p>
                                    <p className="text-[10px] opacity-60">{order.customer_email}</p>
                                </div>
                                <div className="flex gap-3 items-start">
                                    <Phone size={14} className="opacity-50 mt-0.5" />
                                    <p className="text-xs font-mono font-bold">
                                        {order.shipping_phone || order.customer_phone || "N/A"}
                                    </p>
                                </div>
                                <div className="text-xs opacity-70 leading-relaxed pl-3 border-l-2 border-white/10">
                                    {order.shipping_address}<br />
                                    {order.shipping_city} {order.shipping_zip}<br />
                                    {order.shipping_country}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};