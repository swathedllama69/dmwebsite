import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Package, Calendar, DollarSign, User, Mail, Truck, MessageSquare,
    Loader2, AlertCircle, RefreshCw, ArrowLeft, MapPin, Receipt, Phone
} from 'lucide-react';
import { API_BASE_URL, formatCurrency } from '../utils/config.js';

export const CustomerOrderDetail = ({ setNotification, currentCurrency }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrderDetails = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/orders.php?id=${id}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();

            if (data && data.length > 0) {
                setOrder(data[0]);
            } else {
                throw new Error("Order not found.");
            }
        } catch (e) {
            setError(e.message);
            setNotification({ message: "Error loading order details.", type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [id, setNotification]);

    useEffect(() => {
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    if (loading) return (
        <div className="pt-32 flex flex-col items-center justify-center min-h-[50vh]">
            <Loader2 className="animate-spin text-[#CCFF00] mb-4" size={40} />
            <p className="font-mono text-[#888] uppercase tracking-widest text-xs">Accessing Archives...</p>
        </div>
    );

    if (error || !order) return (
        <div className="pt-32 max-w-2xl mx-auto px-4">
            <div className="p-8 bg-[#0A0A0A] border border-red-900/30 rounded-xl text-center">
                <AlertCircle className="text-red-500 mx-auto mb-4" size={40} />
                <h3 className="text-xl font-display text-white mb-2">Retrieval Failed</h3>
                <p className="text-gray-500 font-mono text-sm mb-6">{error || "Order data unavailable"}</p>
                <div className="flex justify-center gap-4">
                    <button onClick={() => navigate('/account')} className="text-gray-400 hover:text-white underline font-mono text-xs">Return to Dashboard</button>
                    <button onClick={fetchOrderDetails} className="flex items-center gap-2 bg-[#1a1a1a] text-[#CCFF00] px-4 py-2 rounded hover:bg-[#333] transition-colors font-mono text-xs uppercase">
                        <RefreshCw size={14} /> Retry
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pt-32 pb-20 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header / Nav */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b border-[#222] pb-8">
                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/account')}
                        className="group flex items-center gap-2 text-gray-400 hover:text-[#CCFF00] transition-colors font-mono text-xs uppercase"
                    >
                        <div className="p-1 rounded bg-[#111] border border-[#333] group-hover:border-[#CCFF00] transition-colors">
                            <ArrowLeft size={14} />
                        </div>
                        Return to Dashboard
                    </button>
                    <div>
                        <p className="text-[#666] text-[10px] uppercase font-bold tracking-widest mb-1">Transaction Log</p>
                        <h1 className="text-4xl font-display text-white tracking-tighter">
                            ORDER <span className="text-[#CCFF00]">#{order.order_number_display || order.id}</span>
                        </h1>
                    </div>
                </div>

                <div className="flex flex-col md:items-end gap-2">
                    <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest opacity-60">Verified Contact</p>
                    <div className="flex items-center gap-2 text-[#CCFF00] bg-[#CCFF00]/5 px-4 py-2 rounded-full border border-[#CCFF00]/20">
                        <Phone size={14} />
                        <p className="font-mono text-sm font-bold">{order.customer_info?.phone || "No Phone Provided"}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Info Column (Left) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Status Banner */}
                    <div className="bg-[#0A0A0A] border border-[#333] rounded-2xl p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-xl">
                        <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-[#111] border border-[#333] flex items-center justify-center text-[#CCFF00] shadow-inner">
                                <Package size={28} />
                            </div>
                            <div>
                                <p className="text-[#666] text-[10px] uppercase font-bold tracking-widest mb-1">Fulfillment Status</p>
                                <p className="text-2xl font-display text-white uppercase italic">{order.status}</p>
                            </div>
                        </div>
                        <div className="sm:text-right">
                            <p className="text-[#666] text-[10px] uppercase font-bold tracking-widest mb-1">Timestamp</p>
                            <p className="text-white font-mono text-sm">
                                {new Date(order.created_at).toLocaleDateString(undefined, {
                                    year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric',
                                    minute: 'numeric', hour12: true
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Order Instructions Block */}
                    {order.order_notes && (
                        <div className="bg-[#111] border-l-4 border-[#CCFF00] rounded-r-2xl p-6 flex gap-4 shadow-lg">
                            <div className="shrink-0 pt-1">
                                <MessageSquare className="text-[#CCFF00]" size={24} />
                            </div>
                            <div>
                                <h3 className="text-[#666] text-[10px] uppercase font-bold mb-2 tracking-widest">
                                    Custom Specifications
                                </h3>
                                <p className="text-white font-mono text-sm leading-relaxed whitespace-pre-wrap">
                                    "{order.order_notes}"
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Order Items "Manifest" */}
                    <div className="bg-[#0A0A0A] border border-[#333] rounded-2xl overflow-hidden shadow-2xl">
                        <div className="bg-[#111] p-5 border-b border-[#333] flex justify-between items-center">
                            <h3 className="font-mono text-[10px] uppercase font-bold text-[#666] tracking-widest">Shipment Manifest</h3>
                            <span className="bg-[#CCFF00] text-black text-[10px] font-black px-2 py-0.5 rounded italic">
                                {order.items?.length || 0} UNITS
                            </span>
                        </div>
                        <div className="divide-y divide-[#222]">
                            {order.items && order.items.map((item, index) => (
                                <div key={index} className="p-6 flex gap-6 hover:bg-white/[0.02] transition-colors group">
                                    <div className="h-20 w-20 bg-black rounded-xl border border-[#333] overflow-hidden flex-shrink-0 group-hover:border-[#CCFF00] transition-colors">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[#333]">
                                                <Package size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-white text-base uppercase tracking-tight">{item.product_name}</h4>
                                            <p className="font-mono text-[#CCFF00] text-lg font-black">
                                                {formatCurrency(item.price_cents * item.quantity, currentCurrency)}
                                            </p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-[#555] text-xs font-mono">Unit: {formatCurrency(item.price_cents, currentCurrency)}</p>
                                            <span className="text-white text-xs font-mono font-bold">
                                                x{item.quantity}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Details (Right) */}
                <div className="space-y-6">

                    {/* Financial Summary */}
                    <div className="bg-[#0A0A0A] border border-[#333] rounded-2xl p-8 shadow-xl">
                        <h3 className="font-mono text-[10px] uppercase font-bold text-[#666] mb-6 flex items-center gap-2 tracking-widest">
                            <Receipt size={14} className="text-[#CCFF00]" /> Financial Summary
                        </h3>
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-sm text-[#888] font-mono">
                                <span>Subtotal</span>
                                <span>{formatCurrency(order.total_cents, currentCurrency)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-[#888] font-mono">
                                <span>Logistic Fees</span>
                                <span className="italic text-[10px]">TBD upon dispatch</span>
                            </div>
                        </div>
                        <div className="border-t border-[#222] pt-6 flex justify-between items-center">
                            <span className="text-white font-black uppercase text-xs tracking-widest">Grand Total</span>
                            <span className="text-[#CCFF00] font-mono text-3xl font-black italic tracking-tighter">
                                {formatCurrency(order.total_cents, currentCurrency)}
                            </span>
                        </div>
                        <div className="mt-8 pt-6 border-t border-[#222]">
                            <p className="text-[#666] text-[9px] uppercase font-black mb-2 tracking-[0.2em]">Settlement Method</p>
                            <p className="text-white text-xs font-bold uppercase flex items-center gap-3 bg-[#111] p-3 rounded-lg border border-[#222]">
                                {order.payment_method === 'bank_transfer' ? (
                                    <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></span>
                                ) : (
                                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                                )}
                                {order.payment_method.replace('_', ' ')}
                            </p>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-[#0A0A0A] border border-[#333] rounded-2xl p-8 shadow-xl">
                        <h3 className="font-mono text-[10px] uppercase font-bold text-[#666] mb-6 flex items-center gap-2 tracking-widest">
                            <MapPin size={14} className="text-[#CCFF00]" /> Logistics Profile
                        </h3>
                        <div className="text-sm text-gray-300 space-y-4 font-mono leading-relaxed">
                            <div>
                                <p className="text-[10px] text-gray-600 font-black uppercase mb-1">Consignee</p>
                                <p className="text-white font-bold uppercase tracking-tight">{order.customer_name}</p>
                            </div>

                            {/* SIDEBAR PHONE DISPLAY */}
                            <div>
                                <p className="text-[10px] text-gray-600 font-black uppercase mb-1">Contact Terminal</p>
                                <p className="text-[#CCFF00] font-bold">{order.customer_info?.phone || "No phone listed"}</p>
                            </div>

                            <div>
                                <p className="text-[10px] text-gray-600 font-black uppercase mb-1">Destination</p>
                                <p className="text-white text-xs leading-relaxed uppercase">
                                    {order.shipping_address_line1}<br />
                                    {order.shipping_city}, {order.shipping_country}
                                </p>
                            </div>

                            <div className="pt-4 mt-4 border-t border-[#222]">
                                <p className="text-[10px] text-gray-600 font-black uppercase mb-1">Audit Email</p>
                                <p className="text-white text-[10px] truncate">{order.customer_email}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};