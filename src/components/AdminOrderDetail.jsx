import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Loader2, ArrowLeft, Printer, FileText, CheckCircle, ExternalLink,
    AlertCircle, RefreshCw, Mail, MapPin, Globe, Package, MessageSquare, Clock
} from 'lucide-react';
import { API_BASE_URL, formatCurrency } from '../utils/config.js';

const AdminOrderDetail = ({ setNotification, currentCurrency }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [paymentProof, setPaymentProof] = useState(null);
    const [loading, setLoading] = useState(true);

    const DOMAIN_ROOT = API_BASE_URL.replace('/api', '');
    const LOGO_URL = "http://devoltmould.com.ng/resources/devolt_logo.png";

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            const [oRes, rRes, pRes] = await Promise.all([
                fetch(`${API_BASE_URL}/orders.php?id=${id}`),
                fetch(`${API_BASE_URL}/receipts.php`),
                fetch(`${API_BASE_URL}/products.php`)
            ]);

            const oData = await oRes.json();
            const rData = await rRes.json();
            const pData = await pRes.json();

            const orderObj = Array.isArray(oData) ? oData[0] : oData;

            if (orderObj && orderObj.items) {
                orderObj.items = orderObj.items.map(item => {
                    // Find the product match to get the raw image_url string
                    const productMatch = pData.find(p => String(p.id) === String(item.product_id));
                    let rawUrl = productMatch ? productMatch.image_url : null;

                    // Fix: Split by comma and take the first URL, then trim whitespace
                    let firstUrl = rawUrl ? rawUrl.split(',')[0].trim() : null;

                    // Prepend domain only if it's a relative path
                    if (firstUrl && !firstUrl.startsWith('http')) {
                        firstUrl = `${DOMAIN_ROOT}/${firstUrl.startsWith('/') ? firstUrl.slice(1) : firstUrl}`;
                    }

                    return { ...item, processed_image_url: firstUrl };
                });
            }

            setOrder(orderObj);
            setPaymentProof(rData.find(r => String(r.order_id) === String(id)) || null);
        } catch (err) {
            setNotification({ message: "Sync Error", type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [id, setNotification, DOMAIN_ROOT]);

    useEffect(() => { fetchAllData(); }, [fetchAllData]);

    const printOfficialReceipt = () => {
        if (!order) return;
        const printWindow = window.open('', '_blank');
        const itemsHtml = order.items.map(item => `
            <tr>
                <td style="padding: 15px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 15px;">
                    ${item.image_url ? `<img src="${item.image_url}" style="width: 50px; height: 50px; object-fit: cover; border: 1px solid #eee;" />` : ''}
                    <div>
                        <div style="font-weight: 800; text-transform: uppercase; font-size: 13px;">${item.product_name}</div>
                        <div style="font-size: 10px; color: #333;">ID: ${item.product_id}</div>
                    </div>
                </td>
                <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.price_at_purchase || item.price_cents, currentCurrency)}</td>
                <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${formatCurrency((item.price_at_purchase || item.price_cents) * item.quantity, currentCurrency)}</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>DEVOLT_RECEIPT_${order.id}</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; color: #000; }
                        .header { display: flex; justify-content: space-between; border-bottom: 5px solid #000; padding-bottom: 20px; }
                        .billing { margin: 30px 0; display: flex; justify-content: space-between; }
                        table { width: 100%; border-collapse: collapse; }
                        th { background: #f0f0f0; padding: 10px; text-transform: uppercase; font-size: 11px; border-bottom: 2px solid #000; }
                        .total { font-size: 30px; font-weight: 900; text-align: right; margin-top: 30px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <img src="${LOGO_URL}" style="height: 60px;" />
                        <div style="text-align: right">
                            <h1 style="margin:0; letter-spacing:-2px;">OFFICIAL RECEIPT</h1>
                            <div style="font-weight:bold">${order.order_number_display || '#' + order.id}</div>
                            <div style="font-size:12px">${new Date(order.created_at).toLocaleDateString()}</div>
                        </div>
                    </div>
                    <div class="billing">
                    <strong>CUSTOMER:</strong><br/>
                        ${order.customer_info.name}<br/>
                        ${order.customer_info.address}<br/>
                        ${order.customer_info.phone ? `TEL: ${order.customer_info.phone}<br/>` : ''}
                        ${order.customer_info.email}
                    <div style="text-align: right;"><strong>PAYMENT:</strong><br/>${order.payment_method?.toUpperCase()}</div>
                    </div>
                    <table>
                        <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead>
                        <tbody>${itemsHtml}</tbody>
                    </table>
                    <div class="total">TOTAL PAID: ${formatCurrency(order.total_cents, currentCurrency)}</div>
                </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 600);
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin text-[#CCFF00]" size={48} /></div>;

    return (
        <div className="pt-24 pb-20 px-4 md:px-8 max-w-6xl mx-auto space-y-8 font-mono">
            {/* TOOLBAR */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-[#111] p-5 rounded-2xl border border-gray-700 shadow-2xl gap-4">
                <button onClick={() => navigate(-1)} className="text-white hover:text-[#CCFF00] flex items-center gap-2 font-black uppercase text-xs tracking-tighter">
                    <ArrowLeft size={18} /> Back to order list
                </button>
                <button onClick={printOfficialReceipt} className="bg-[#CCFF00] text-black px-10 py-3 rounded-xl font-black uppercase text-sm flex items-center gap-2 hover:scale-105 transition-all">
                    <Printer size={20} /> Generate Receipt
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* PRIMARY CONTENT */}
                <div className="lg:col-span-2 space-y-6">

                    {/* CUSTOMER HEADER (Moved to Top) */}
                    <div className="bg-[#CCFF00] p-8 rounded-3xl text-black shadow-xl">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                            <div>
                                <p className="text-gray-500 text-xs uppercase font-black tracking-widest opacity-60">Phone Number</p>
                                <p className="text-black font-bold">{order.customer_info.phone || "NOT PROVIDED"}</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Customer Billing</h4>
                                <h2 className="text-3xl font-black uppercase leading-none">{order.customer_info.name}</h2>
                                <p className="font-bold text-sm">{order.customer_info.address}, {order.customer_info.city}</p>
                            </div>
                            <div className="md:text-right space-y-2">
                                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Order Reference</h4>
                                <h2 className="text-2xl font-black">{order.order_number_display || `#${order.id}`}</h2>
                                <p className="text-xs font-bold bg-black text-white inline-block px-2 py-1 rounded">
                                    {new Date(order.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ITEMS LIST */}
                    <div className="bg-[#151515] rounded-3xl border border-gray-700 overflow-hidden shadow-2xl">
                        <div className="p-6 bg-white/5 border-b border-gray-700">
                            <h3 className="text-white font-black uppercase text-sm flex items-center gap-3">
                                <Package size={20} className="text-[#CCFF00]" /> Product Summary
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-800">
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="p-6 flex justify-between items-center hover:bg-white/[0.03] transition-colors">
                                    <div className="flex items-center gap-5">
                                        <div className="w-20 h-20 bg-black rounded-xl border border-gray-700 overflow-hidden flex-shrink-0">
                                            {item.image_url ? (
                                                <img src={item.image_url} className="w-full h-full object-cover" alt="product" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-800"><Package size={30} /></div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-white font-black uppercase text-md tracking-tight">{item.product_name}</p>
                                            <p className="text-xs text-[#CCFF00] font-bold mt-1">QTY: {item.quantity} • {formatCurrency(item.price_at_purchase || item.price_cents, currentCurrency)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-black text-lg">
                                            {formatCurrency((item.price_at_purchase || item.price_cents) * item.quantity, currentCurrency)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-10 bg-black flex justify-between items-center border-t border-gray-700">
                            <span className="text-gray-400 font-black uppercase text-xs tracking-widest">Total Amount Paid</span>
                            <span className="text-[#CCFF00] text-5xl font-black italic tracking-tighter">
                                {formatCurrency(order.total_cents, currentCurrency)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* SIDEBAR */}
                <div className="space-y-6">
                    {/* PAYMENT PROOF */}
                    <div className="bg-[#111] rounded-3xl border border-gray-700 p-8 shadow-2xl space-y-6">
                        <h3 className="text-white font-black uppercase text-xs flex items-center gap-3 border-b border-gray-800 pb-4">
                            <FileText size={18} className="text-[#CCFF00]" /> Payment Verification
                        </h3>
                        {paymentProof ? (
                            <div className="space-y-4">
                                <div className="aspect-square w-full rounded-2xl overflow-hidden border-2 border-gray-800 bg-black group relative cursor-crosshair">
                                    <img src={`${DOMAIN_ROOT}${paymentProof.file_path}`} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" alt="receipt" />
                                    <a href={`${DOMAIN_ROOT}${paymentProof.file_path}`} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
                                        <ExternalLink size={24} className="text-[#CCFF00] mb-2" />
                                        <span className="text-white font-black text-[10px] uppercase">Expand Proof</span>
                                    </a>
                                </div>
                                <div className={`text-center py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${paymentProof.verification_status === 'Verified' ? 'bg-green-600 text-white' : 'bg-yellow-500 text-black'}`}>
                                    {paymentProof.verification_status}
                                </div>
                            </div>
                        ) : (
                            <div className="py-10 text-center border-2 border-dashed border-gray-800 rounded-3xl">
                                <AlertCircle size={30} className="mx-auto text-gray-700 mb-3" />
                                <p className="text-gray-500 font-black text-[10px] uppercase tracking-tighter">No Receipt Uploaded</p>
                            </div>
                        )}
                    </div>

                    {/* CONTACT */}
                    <div className="bg-[#151515] rounded-3xl border border-gray-700 p-8 shadow-2xl">
                        <h3 className="text-white font-black uppercase text-xs border-b border-gray-800 pb-4 mb-6">Contact Info</h3>
                        <div className="space-y-4 font-mono text-sm">
                            <p className="text-[#CCFF00] font-bold">{order.customer_info.email}</p>
                            <p className="text-gray-400">Payment: <span className="text-white font-bold">{order.payment_method?.toUpperCase()}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetail;