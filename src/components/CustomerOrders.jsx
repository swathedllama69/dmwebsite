import React, { useState, useEffect, useCallback } from 'react';
import {
    Package, ChevronDown, Clock,
    CheckCircle, XCircle, Truck,
    ShoppingBag, Loader2, FileText,
    Eye, Printer, X, MapPin,
    Instagram, Twitter, Mail
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/config.js';

// --- CONFIGURATION ---
const formatOrderId = (id) => `ORD-${parseInt(id) + 8800}`;
const LOGO_URL = "https://devoltmould.com.ng/resources/devolt_logo.png";
const WEBSITE_URL = "www.devoltmould.com.ng";

const formatPrice = (cents, currency) => {
    if (!cents && cents !== 0) return '---';
    const code = currency?.code || 'NGN';
    const amount = cents / 100;
    try {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: code,
            minimumFractionDigits: 2
        }).format(amount);
    } catch (e) {
        return `${amount.toFixed(2)}`;
    }
};

// --- INVOICE MODAL COMPONENT ---
const InvoiceModal = ({ order, onClose }) => {
    if (!order) return null;

    const docDate = new Date(order.created_at).toLocaleDateString();

    const handlePrint = () => {
        // 1. Store original title
        const originalTitle = document.title;

        // 2. Create custom filename: FirstName_OrderNumber
        const firstName = order.customer_name ? order.customer_name.split(' ')[0] : 'Customer';
        const orderId = order.order_number_display || formatOrderId(order.id);
        const fileName = `${firstName}_${orderId}`;

        // 3. Set title (Browsers use this for the PDF filename)
        document.title = fileName;

        // 4. Print
        window.print();

        // 5. Restore title after delay
        setTimeout(() => {
            document.title = originalTitle;
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">

            {/* --- CSS FOR PRINTING --- */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap');
                
                @media print {
                    /* 1. Setup A4 Page */
                    @page { 
                        size: A4; 
                        margin: 0; 
                    }
                    
                    /* 2. Reset Body to allow full page printing (Fixes blank page) */
                    html, body {
                        height: 100%;
                        width: 100%;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: visible !important;
                    }

                    /* 3. Hide all other UI elements */
                    body * {
                        visibility: hidden;
                    }

                    /* 4. Show ONLY the receipt and its children */
                    #printable-receipt, #printable-receipt * {
                        visibility: visible;
                    }

                    /* 5. Position receipt perfectly on the paper */
                    #printable-receipt {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%; /* Full A4 width */
                        max-width: 210mm; /* A4 width standard */
                        min-height: 100vh;
                        margin: 0;
                        padding: 40px; /* Comfortable padding */
                        background: white;
                        box-shadow: none !important;
                        border: none !important;
                        overflow: visible !important;
                        color: black !important;
                    }

                    /* 6. Utility Hides */
                    .no-print { display: none !important; }
                    
                    /* 7. Force colors */
                    .text-gray-400, .text-gray-500, .text-gray-600 { color: #000 !important; }
                }
            `}</style>

            {/* Modal Box */}
            <div
                id="printable-receipt"
                className="bg-white text-black w-full max-w-md rounded-xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
            >

                {/* Close Button (Hidden on Print) */}
                <button
                    onClick={onClose}
                    className="no-print absolute top-3 right-3 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
                >
                    <X size={20} />
                </button>

                {/* --- CONTENT AREA --- */}
                <div className="p-8 overflow-y-auto print:overflow-visible print:p-0">

                    {/* Header */}
                    <div className="flex flex-col items-center text-center border-b border-dashed border-gray-300 pb-6 mb-6 print:border-black">
                        <img src={LOGO_URL} alt="Devolt Logo" className="h-14 w-auto object-contain mb-2" />

                        <div className="text-2xl font-black tracking-widest uppercase mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
                            - DEVOLT -
                        </div>

                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">Moulding the New Standard</p>

                        <div className="w-full flex justify-between items-center text-xs border-t border-dashed border-gray-200 pt-4 print:border-black">
                            <div className="text-left">
                                <span className="block text-gray-400 uppercase tracking-wider text-[10px]">Order ID</span>
                                <span className="font-mono font-bold">#{order.order_number_display || formatOrderId(order.id)}</span>
                            </div>
                            <div className="text-right">
                                <span className="block text-gray-400 uppercase tracking-wider text-[10px]">Date</span>
                                <span className="font-mono font-bold">{docDate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-8 text-sm">
                        <p className="font-bold uppercase text-[10px] text-gray-400 tracking-widest mb-2 border-b border-gray-100 pb-1 print:border-black print:text-black">Billed To</p>
                        <p className="font-bold text-lg">{order.customer_name || 'Valued Customer'}</p>
                        <p className="text-gray-600">{order.shipping_address}</p>
                        <p className="text-gray-600">{order.shipping_city} {order.shipping_zip}</p>
                        <p className="text-gray-600 mt-1 text-xs">{order.customer_email}</p>
                    </div>

                    {/* Items */}
                    <div className="mb-8">
                        <p className="font-bold uppercase text-[10px] text-gray-400 tracking-widest mb-3 border-b border-gray-100 pb-1 print:border-black print:text-black">Items</p>
                        <div className="space-y-4">
                            {order.items && order.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm items-start">
                                    <div className="pr-4 flex-1">
                                        <div className="font-bold">{item.product_name}</div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">
                                            Qty: {item.quantity} {item.size ? `• Size: ${item.size}` : ''}
                                        </div>
                                    </div>
                                    <div className="font-mono text-right font-medium">
                                        {formatPrice((item.price ? item.price * 100 : item.price_cents) * item.quantity)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="border-t-2 border-black pt-4 mb-8 flex justify-between items-end">
                        <div className="text-xs text-gray-500 print:text-black">Total Amount</div>
                        <div className="text-2xl font-black font-display">{formatPrice(order.total_cents)}</div>
                    </div>

                    {/* Footer / Socials */}
                    <div className="mt-auto pt-8 border-t border-gray-100 print:border-black">
                        <div className="flex flex-col items-center justify-center space-y-3 text-center">

                            <div className="text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                <MapPin size={10} /> Abuja, Federal Capital Territory
                            </div>

                            <div className="flex items-center gap-4 text-xs font-medium text-gray-600 print:text-black">
                                <div className="flex items-center gap-1.5">
                                    <Instagram size={14} />
                                    <Twitter size={14} />
                                    <span>@devolt_mould</span>
                                </div>
                                <div className="w-1 h-1 bg-gray-300 rounded-full print:bg-black"></div>
                                <div className="flex items-center gap-1.5">
                                    <Mail size={14} />
                                    <span>sales@devoltmould.com.ng</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Print/Save Button (Hidden on Print) */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 no-print rounded-b-xl">
                    <button
                        onClick={handlePrint}
                        className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                    >
                        <Printer size={16} /> Save / Print Receipt
                    </button>
                </div>

            </div>
        </div>
    );
};

// ... (Order Status Badge & CustomerOrders Component remain unchanged below) ...
const OrderStatusBadge = ({ status }) => {
    const s = status?.toLowerCase() || '';
    const styles = {
        pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        processing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        shipped: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        delivered: 'bg-green-500/10 text-green-500 border-green-500/20',
        cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    const icons = {
        pending: Clock, processing: Package, shipped: Truck, delivered: CheckCircle, cancelled: XCircle,
    };
    const style = styles[s] || 'bg-white/5 text-gray-400 border-white/10';
    const Icon = icons[s] || Package;

    return (
        <span className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${style}`}>
            <Icon size={10} /> {status}
        </span>
    );
};

export const CustomerOrders = ({ userId, currentCurrency, setNotification }) => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [fetchingDetails, setFetchingDetails] = useState({});
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    // --- FETCH ORDERS LIST ---
    const fetchOrders = useCallback(async () => {
        if (!userId) { setLoading(false); return; }
        try {
            const response = await fetch(`${API_BASE_URL}/orders.php?action=get_user_orders&user_id=${userId}`);
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setOrders(Array.isArray(data) ? data : (data.orders || []));
        } catch (error) {
            if (setNotification) setNotification({ message: "Could not load history", type: "error" });
        } finally {
            setLoading(false);
        }
    }, [userId, setNotification]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    // --- FETCH DETAILS ---
    const fetchOrderDetails = async (orderId) => {
        const currentOrder = orders.find(o => o.id === orderId);
        if (currentOrder && Array.isArray(currentOrder.items) && currentOrder.items.length > 0) {
            return currentOrder;
        }

        setFetchingDetails(prev => ({ ...prev, [orderId]: true }));
        try {
            const response = await fetch(`${API_BASE_URL}/orders.php?action=get_order&id=${orderId}`);
            const data = await response.json();
            let details = Array.isArray(data) ? data[0] : (data.success ? data.order : data);

            if (!details) throw new Error("Invalid order data");

            if (details.items && typeof details.items === 'string') {
                try { details.items = JSON.parse(details.items); } catch (e) { details.items = []; }
            }
            if (!Array.isArray(details.items)) details.items = [];

            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, items: details.items } : o));
            return { ...currentOrder, ...details };

        } catch (err) {
            console.error("Fetch details error", err);
            return null;
        } finally {
            setFetchingDetails(prev => ({ ...prev, [orderId]: false }));
        }
    };

    const toggleOrder = (orderId) => {
        const isExpanding = expandedOrder !== orderId;
        setExpandedOrder(isExpanding ? orderId : null);
        if (isExpanding) fetchOrderDetails(orderId);
    };

    // --- OPEN RECEIPT MODAL ---
    const handleOpenInvoice = async (e, order) => {
        e.stopPropagation();
        if (!order.items || order.items.length === 0) {
            const fullDetails = await fetchOrderDetails(order.id);
            if (fullDetails) setSelectedInvoice(fullDetails);
            else alert("Could not load invoice data.");
        } else {
            setSelectedInvoice(order);
        }
    };

    const handleViewFullOrder = (e, orderId) => {
        e.stopPropagation();
        navigate(`/account/orders/${orderId}`);
    };

    if (loading) return <div className="flex justify-center h-48 items-center"><Loader2 className="animate-spin text-primary" size={24} /></div>;

    if (orders.length === 0) return (
        <div className="flex flex-col items-center justify-center h-80 text-center space-y-4 animate-in fade-in">
            <div className="bg-card border border-white/10 p-6 rounded-full shadow-lg"><ShoppingBag size={32} className="opacity-20 text-current" /></div>
            <div><h3 className="text-lg font-bold italic opacity-40">No Orders</h3><p className="text-[10px] opacity-40">History empty.</p></div>
        </div>
    );

    return (
        <>
            {/* Invoice Modal Overlay */}
            {selectedInvoice && (
                <InvoiceModal order={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
            )}

            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div><h2 className="text-xl font-display font-bold italic uppercase">Order History</h2></div>
                    <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-[10px] font-black border border-primary/20">{orders.length} ITEMS</div>
                </div>

                <div className="grid gap-3">
                    {orders.map((order) => {
                        const isPending = order.status?.toLowerCase() === 'pending';
                        const isLoadingDetails = fetchingDetails[order.id];

                        return (
                            <div key={order.id} className={`bg-card border border-white/5 text-current rounded-2xl overflow-hidden transition-all duration-300 ${expandedOrder === order.id ? 'shadow-xl ring-1 ring-primary/20' : 'hover:border-primary/30'}`}>
                                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                                    {/* Left: Info */}
                                    <div onClick={() => toggleOrder(order.id)} className="flex items-center gap-3 cursor-pointer flex-1">
                                        <div className={`p-2.5 rounded-xl transition-colors ${expandedOrder === order.id ? 'bg-primary text-black' : 'bg-white/5 text-current'}`}>
                                            <Package size={18} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="font-mono text-xs font-bold text-primary">{formatOrderId(order.id)}</span>
                                                <span className="text-[9px] opacity-40 uppercase font-bold">{new Date(order.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="text-lg font-display font-bold italic leading-none">{formatPrice(order.total_cents, currentCurrency)}</div>
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                                        <OrderStatusBadge status={order.status} />

                                        <div className="flex items-center gap-2">
                                            {/* VIEW ORDER BUTTON */}
                                            <button
                                                onClick={(e) => handleViewFullOrder(e, order.id)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5"
                                                title="View Full Details"
                                            >
                                                <Eye size={14} className="opacity-70" />
                                                <span className="text-[10px] font-bold uppercase tracking-wide">View Order</span>
                                            </button>

                                            {/* RECEIPT BUTTON */}
                                            <button
                                                onClick={(e) => handleOpenInvoice(e, order)}
                                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                                title={isPending ? "View Invoice" : "View Receipt"}
                                            >
                                                {isLoadingDetails ? (
                                                    <Loader2 size={16} className="animate-spin opacity-50" />
                                                ) : (
                                                    <FileText size={16} className="opacity-50 hover:opacity-100" />
                                                )}
                                            </button>

                                            {/* EXPAND TOGGLE */}
                                            <button
                                                onClick={() => toggleOrder(order.id)}
                                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                            >
                                                <ChevronDown size={16} className={`transition-transform duration-300 opacity-50 ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Dropdown */}
                                <div className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${expandedOrder === order.id ? 'max-h-[800px]' : 'max-h-0'}`}>
                                    <div className="p-4 pt-0 border-t border-white/5 bg-black/20">
                                        <div className="space-y-2 pt-4">
                                            {order.items && order.items.map((item, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-lg bg-white/5 overflow-hidden border border-white/10 flex-shrink-0">
                                                            {item.image || item.image_url ?
                                                                <img src={item.image || item.image_url} alt={item.product_name} className="h-full w-full object-cover" />
                                                                : <ShoppingBag size={14} className="opacity-20 m-auto" />
                                                            }
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-xs leading-tight">{item.product_name}</div>
                                                            {item.size && <div className="text-[9px] opacity-60 mt-0.5 uppercase tracking-wide">Size: {item.size}</div>}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-mono text-xs opacity-60">x{item.quantity}</div>
                                                        <div className="font-bold text-xs mt-0.5">
                                                            {formatPrice((item.price ? item.price * 100 : item.price_cents), currentCurrency)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};