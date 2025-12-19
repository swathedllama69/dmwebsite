import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Package, ArrowLeft, MapPin, Receipt, Phone,
    Loader2, AlertCircle, MessageSquare, Box, Printer
} from 'lucide-react';
import { API_BASE_URL, formatCurrency } from '../utils/config.js';

// --- CONFIGURATION ---
const formatOrderId = (id) => `ORD-${parseInt(id) + 8800}`;

// REPLACE THIS LINK WITH YOUR ACTUAL LOGO URL
const LOGO_URL = "devoltmould.com.ng/assets/devolt_logo.png";

export const CustomerOrderDetail = ({ setNotification, currentCurrency }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- FETCH DATA LOGIC ---
    const fetchOrderDetails = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/orders.php?id=${id}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();

            let targetOrder = null;
            if (Array.isArray(data) && data.length > 0) {
                targetOrder = data[0];
            } else if (data && !Array.isArray(data)) {
                targetOrder = data;
            } else {
                throw new Error("Order not found.");
            }

            // Parse Items if String
            if (targetOrder.items && typeof targetOrder.items === 'string') {
                try {
                    targetOrder.items = JSON.parse(targetOrder.items);
                } catch (e) {
                    targetOrder.items = [];
                }
            }
            if (!Array.isArray(targetOrder.items)) targetOrder.items = [];

            setOrder(targetOrder);

        } catch (e) {
            setError(e.message);
            setNotification({ message: "Error loading order details.", type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [id, setNotification]);

    useEffect(() => { fetchOrderDetails(); }, [fetchOrderDetails]);

    // --- PRINT GENERATION LOGIC ---
    const handlePrint = () => {
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

        const itemsHtml = order.items.map(item => `
          <tr>
            <td>${item.product_name}</td>
            <td>${item.quantity}</td>
            <td>${fmt(item.price_cents)}</td>
            <td>${fmt(item.price_cents * item.quantity)}</td>
          </tr>
        `).join('');

        const printWindow = window.open('', '_blank', 'width=900,height=800');

        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${docType} #${order.order_number_display}</title>
            <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap" rel="stylesheet">
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; background: #fff; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
              
              /* Logo and Brand Container */
              .brand-container { display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 10px; }
              .logo-img { height: 50px; width: auto; object-fit: contain; }
              .brand-name { font-family: 'Cinzel', serif; font-size: 36px; font-weight: 700; text-transform: uppercase; margin: 0; letter-spacing: 2px; }
              
              .contact { font-size: 12px; color: #555; margin-top: 5px; line-height: 1.5; }
              .doc-title { text-align: right; font-size: 24px; font-weight: bold; margin-bottom: 10px; font-family: 'Cinzel', serif; letter-spacing: 1px; }
              .meta { text-align: right; font-size: 12px; margin-bottom: 30px; line-height: 1.5; }
              
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th { text-align: left; background: #eee; padding: 12px; font-family: 'Cinzel', serif; font-weight: 700; font-size: 14px; }
              td { padding: 12px; border-bottom: 1px solid #ddd; font-size: 14px; }
              .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; padding-top: 10px; border-top: 2px solid #eee; }
              
              @media print {
                  body { padding: 0; }
                  button { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
               <div class="brand-container">
                   <img src="${LOGO_URL}" class="logo-img" alt="Logo" />
                   <h1 class="brand-name">-DEVOLT-</h1>
               </div>
               <div class="contact">
                 <div>08146068754 &bull; sales@devoltmould.com.ng</div>
                 <div>@devolt.mould &bull; @devolt_mould</div>
               </div>
            </div>
    
            <div class="doc-title">${docType}</div>
            <div class="meta">
              <strong>Order ID:</strong> ${order.order_number_display}<br/>
              <strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}<br/>
              <strong>Customer:</strong> ${order.customer_name}
            </div>
    
            <table>
              <thead>
                <tr><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
    
            <div class="total">
              Total: ${fmt(order.total_cents)}
            </div>
    
            <script>
               window.onload = function() { window.print(); };
            </script>
          </body>
          </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    if (loading) return <div className="pt-40 flex justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;

    if (error || !order) return (
        <div className="pt-32 px-4 max-w-lg mx-auto">
            <div className="p-8 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl text-center shadow-xl">
                <AlertCircle className="text-red-500 mx-auto mb-4" size={32} />
                <h3 className="text-lg font-bold mb-2">Order Unavailable</h3>
                <p className="text-xs text-gray-500 mb-6">{error}</p>
                <button onClick={() => navigate('/account')} className="underline text-xs font-bold uppercase tracking-widest">Return Dashboard</button>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pt-32 pb-20 px-4 md:px-8 text-current animate-in fade-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="mb-8">
                <button onClick={() => navigate('/account')} className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest opacity-60 hover:opacity-100 hover:text-primary transition-all mb-6">
                    <ArrowLeft size={12} /> Back to Dashboard
                </button>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">
                        Order <span className="text-primary">{formatOrderId(order.id)}</span>
                    </h1>

                    <div className="flex items-center gap-3">
                        {/* Print Button */}
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
                        >
                            <Printer size={14} />
                            Print
                        </button>

                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/10 rounded-full border border-gray-200 dark:border-white/10">
                            <div className={`w-2 h-2 rounded-full ${order.status === 'Completed' ? 'bg-green-500' : 'bg-primary'}`}></div>
                            <span className="text-[10px] font-bold uppercase tracking-widest">{order.status}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02]">
                            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                <Package size={14} /> Package Contents
                            </h3>
                            <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded">
                                {order.items?.length || 0} ITEMS
                            </span>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-white/5">
                            {order.items && order.items.map((item, idx) => (
                                <div key={idx} className="p-6 flex gap-5">
                                    <div className="h-20 w-20 bg-gray-100 dark:bg-black rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden relative shrink-0">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-300"><Box size={20} /></div>
                                        )}
                                        <div className="absolute bottom-0 right-0 bg-primary text-black text-[9px] font-black px-1.5 py-0.5 rounded-tl-lg">
                                            x{item.quantity}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-sm uppercase tracking-wide">{item.product_name}</h4>
                                            <p className="font-mono font-bold text-sm">{formatCurrency(item.price_cents * item.quantity, currentCurrency)}</p>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1">Unit Price: {formatCurrency(item.price_cents, currentCurrency)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {order.order_notes && (
                        <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl flex gap-4">
                            <MessageSquare className="text-primary shrink-0" size={20} />
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Note</h4>
                                <p className="text-sm font-mono italic opacity-80">"{order.order_notes}"</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Logistics */}
                <div className="space-y-6">
                    {/* Financial */}
                    <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-8">
                        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-6 flex items-center gap-2">
                            <Receipt size={14} /> Payment
                        </h3>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-xs opacity-60 font-mono">
                                <span>Subtotal</span>
                                <span>{formatCurrency(order.total_cents, currentCurrency)}</span>
                            </div>
                            <div className="flex justify-between text-xs opacity-60 font-mono">
                                <span>Delivery</span>
                                <span className="italic opacity-50">Not Included</span>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-dashed border-gray-300 dark:border-white/10 flex justify-between items-center">
                            <span className="font-black uppercase text-xs">Total Paid</span>
                            <span className="text-xl font-black italic tracking-tighter text-primary">
                                {formatCurrency(order.total_cents, currentCurrency)}
                            </span>
                        </div>
                    </div>

                    {/* Shipping */}
                    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-8">
                        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-6 flex items-center gap-2">
                            <MapPin size={14} /> Shipping To
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-bold uppercase">{order.customer_name}</p>
                                <p className="text-[10px] opacity-60">{order.customer_email}</p>
                            </div>
                            <div className="flex gap-3 items-start">
                                <Phone size={14} className="text-primary mt-0.5" />
                                <p className="text-xs font-mono font-bold">
                                    {order.shipping_phone || order.customer_phone || "N/A"}
                                </p>
                            </div>
                            <div className="text-xs opacity-70 leading-relaxed pl-3 border-l-2 border-gray-100 dark:border-white/10">
                                {order.shipping_address}<br />
                                {order.shipping_city}, {order.shipping_zip}<br />
                                {order.shipping_country}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};