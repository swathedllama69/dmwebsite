import React, { useState, useEffect, useCallback } from 'react';
import {
    Package, ChevronDown, Clock,
    CheckCircle, XCircle, Truck,
    ShoppingBag, Loader2, FileText, Download,
    Eye, Printer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/config.js';

// --- CONFIGURATION ---
const formatOrderId = (id) => `ORD-${parseInt(id) + 8800}`;

// UPDATE: Using the likely public URL for your logo based on the path provided
const LOGO_URL = "https://devoltmould.com.ng/resources/devolt_logo.png";

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

// --- PRINT LOGIC ---
const handlePrintDocument = (order) => {
    if (!order) return;

    let docType = '';
    const status = order.status;

    if (status === 'Pending') {
        docType = 'INVOICE';
    } else if (['Processing', 'Shipped', 'Completed'].includes(status)) {
        docType = 'RECEIPT';
    } else if (status === 'Cancelled') {
        alert("This order is Cancelled. No invoice or receipt available.");
        return;
    }

    const fmt = (cents) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(cents / 100);
    };

    // Safely map items, defaulting to empty array if missing
    const itemsHtml = (order.items || []).map(item => `
      <tr>
        <td>${item.product_name}</td>
        <td>${item.quantity}</td>
        <td>${fmt(item.price ? item.price * 100 : (item.price_cents || 0))}</td>
        <td>${fmt((item.price ? item.price * 100 : (item.price_cents || 0)) * item.quantity)}</td>
      </tr>
    `).join('');

    const printWindow = window.open('', '_blank', 'width=900,height=800');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${docType} #${order.order_number_display || formatOrderId(order.id)}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          
          /* Logo Styling */
          .brand-container { display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 10px; }
          .logo-img { height: 60px; width: auto; object-fit: contain; }
          .brand-name { font-family: 'Cinzel', serif; font-size: 36px; font-weight: 700; text-transform: uppercase; margin: 0; letter-spacing: 2px; }
          
          .contact { font-size: 12px; color: #555; margin-top: 5px; line-height: 1.5; }
          .doc-title { text-align: right; font-size: 24px; font-weight: bold; margin-bottom: 10px; font-family: 'Cinzel', serif; letter-spacing: 1px; }
          .meta { text-align: right; font-size: 12px; margin-bottom: 30px; line-height: 1.5; }
          
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { text-align: left; background: #eee; padding: 12px; font-family: 'Cinzel', serif; font-weight: 700; font-size: 14px; }
          td { padding: 12px; border-bottom: 1px solid #ddd; font-size: 14px; }
          .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; padding-top: 10px; border-top: 2px solid #eee; }
        </style>
      </head>
      <body>
        <div class="header">
           <div class="brand-container">
               <img src="${LOGO_URL}" class="logo-img" alt="Logo" onerror="this.style.display='none'" />
               <h1 class="brand-name">-DEVOLT-</h1>
           </div>
           <div class="contact">
             <div>08146068754 &bull; sales@devoltmould.com.ng</div>
             <div>@devolt.mould &bull; @devolt_mould</div>
           </div>
        </div>

        <div class="doc-title">${docType}</div>
        <div class="meta">
          <strong>Order ID:</strong> ${order.order_number_display || formatOrderId(order.id)}<br/>
          <strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}<br/>
          <strong>Customer:</strong> ${order.customer_name || order.shipping_name || 'Valued Customer'}
        </div>

        <table>
          <thead>
            <tr><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr>
          </thead>
          <tbody>
            ${itemsHtml || '<tr><td colspan="4" style="text-align:center; padding:20px;">No items found</td></tr>'}
          </tbody>
        </table>

        <div class="total">
          Total: ${fmt(order.total_cents)}
        </div>

        <script>
           // Print automatically when loaded
           window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
};

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

    // --- 1. FETCH ORDERS LIST (Summary Only) ---
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

    // --- 2. FETCH SINGLE DETAILS (Helper Function) ---
    // Returns the data directly so we don't have to wait for State update
    const fetchOrderDetails = async (orderId) => {
        const currentOrder = orders.find(o => o.id === orderId);

        // If we already have items, just return the current order
        if (currentOrder && Array.isArray(currentOrder.items) && currentOrder.items.length > 0) {
            return currentOrder;
        }

        setFetchingDetails(prev => ({ ...prev, [orderId]: true }));
        try {
            const response = await fetch(`${API_BASE_URL}/orders.php?action=get_order&id=${orderId}`);
            const data = await response.json();

            let details = data.success ? data.order : data;

            // Fix JSON string parsing
            if (details.items && typeof details.items === 'string') {
                try { details.items = JSON.parse(details.items); } catch (e) { details.items = []; }
            }
            if (!Array.isArray(details.items)) details.items = [];

            // Update React State
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, items: details.items } : o));

            // Return the full order object with items
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
        // Only fetch if we are opening it
        if (isExpanding) fetchOrderDetails(orderId);
    };

    // --- 3. PRINT HANDLER (Fix for Empty Items) ---
    const handleViewReceipt = async (e, order) => {
        e.stopPropagation(); // Stop row from toggling

        let orderToPrint = order;

        // Check if items are missing
        if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
            // Show loading cursor or logic here if desired
            const updatedOrder = await fetchOrderDetails(order.id);
            if (updatedOrder) {
                orderToPrint = updatedOrder;
            } else {
                alert("Could not load items. Please try again.");
                return;
            }
        }

        handlePrintDocument(orderToPrint);
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

                            {/* --- ORDER ROW SUMMARY --- */}
                            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                                {/* Left: Icon & Info (Clickable for Expand) */}
                                <div onClick={() => toggleOrder(order.id)} className="flex items-center gap-3 cursor-pointer flex-1">
                                    <div className={`p-2.5 rounded-xl transition-colors ${expandedOrder === order.id ? 'bg-primary text-black' : 'bg-white/5 text-current'}`}>
                                        <Package size={18} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            {/* NAVIGATE TO DETAIL PAGE ON CLICK */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate(`/account/orders/${order.id}`); }}
                                                className="font-mono text-xs font-bold text-primary hover:underline"
                                            >
                                                {formatOrderId(order.id)}
                                            </button>
                                            <span className="text-[9px] opacity-40 uppercase font-bold">{new Date(order.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-lg font-display font-bold italic leading-none">{formatPrice(order.total_cents, currentCurrency)}</div>
                                    </div>
                                </div>

                                {/* Right: Actions (Always Visible) */}
                                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                                    <OrderStatusBadge status={order.status} />

                                    <div className="flex items-center gap-1">
                                        {/* VIEW FULL DETAILS */}
                                        <button
                                            onClick={(e) => handleViewFullOrder(e, order.id)}
                                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                            title="View Full Details"
                                        >
                                            <Eye size={16} className="opacity-70" />
                                        </button>

                                        {/* PRINT RECEIPT */}
                                        <button
                                            onClick={(e) => handleViewReceipt(e, order)}
                                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                            title={isPending ? "Print Invoice" : "Print Receipt"}
                                        >
                                            {isLoadingDetails ? (
                                                <Loader2 size={16} className="animate-spin opacity-50" />
                                            ) : (
                                                isPending ? <FileText size={16} className="text-yellow-500" /> : <Printer size={16} className="opacity-70" />
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

                            {/* --- EXPANDABLE ITEMS LIST --- */}
                            <div className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${expandedOrder === order.id ? 'max-h-[800px]' : 'max-h-0'}`}>
                                <div className="p-4 pt-0 border-t border-white/5 bg-black/20">
                                    <div className="space-y-2 pt-4">
                                        <h4 className="text-[9px] uppercase font-black tracking-widest opacity-40 mb-2">Items</h4>
                                        {isLoadingDetails ? (
                                            <div className="flex justify-center py-4"><Loader2 className="animate-spin opacity-50" size={20} /></div>
                                        ) : (
                                            order.items && order.items.length > 0 ? (
                                                order.items.map((item, index) => (
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
                                                ))
                                            ) : <div className="p-3 bg-white/5 text-center text-xs opacity-60 rounded-xl">No items details found.</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
};