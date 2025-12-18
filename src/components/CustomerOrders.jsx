import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Loader2, AlertCircle, RefreshCw, ChevronRight, Calendar } from 'lucide-react';
import { API_BASE_URL, formatCurrency } from '../utils/config.js';
import { useNavigate } from 'react-router-dom';
import { formatCustomerId } from '../utils/config.js';

export const CustomerOrders = ({ userId, currentCurrency, setNotification }) => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = useCallback(async () => {
        // DEBUG: Log to console to verify ID exists
        console.log("Fetching orders for User ID:", userId);

        // FIX 1: If no User ID, stop loading and show error instead of spinning forever
        if (!userId) return;

        // --- FIX: UNMASK THE ID ---
        // If the ID comes in as "MEM-1501", we turn it back into "1"
        let apiUserId = userId;

        // Check if it's a string containing "MEM-"
        if (typeof userId === 'string' && userId.includes('MEM-')) {
            // 1. Remove "MEM-"
            const numberPart = userId.replace('MEM-', '');

            // 2. Subtract the offset (Use the SAME offset you put in utils/config.js)
            // If your ID is 1 and it shows 1501, your offset is 1500.
            // If your ID is 1 and it shows 8801, your offset is 8800.
            const offset = 1500; // <--- UPDATE THIS TO MATCH YOUR CONFIG OFFSET

            apiUserId = parseInt(numberPart) - offset;

            console.log(`Unmasked ID: ${userId} -> ${apiUserId}`);
        }

        setLoading(true);
        setError(null);

        try {
            // FIX 2: Added 'action' parameter to match your backend pattern
            // If your backend is pure PHP, it likely needs ?action=get_orders
            const url = `${API_BASE_URL}/orders.php?action=get_user_orders&user_id=${userId}`;
            console.log("Requesting URL:", url);

            const response = await fetch(`${API_BASE_URL}/orders.php?action=get_user_orders&user_id=${apiUserId}`);

            // DEBUG: Log raw text if JSON parsing fails
            const responseText = await response.text();
            console.log("API Raw Response:", responseText);

            if (!response.ok) {
                throw new Error(`HTTP Error ${response.status}: ${responseText}`);
            }

            // Parse JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (err) {
                throw new Error("Invalid JSON response from server.");
            }

            // Check if backend returned a logical error (e.g. { success: false })
            if (data.error) {
                throw new Error(data.error);
            }

            // Ensure data is an array
            const ordersList = Array.isArray(data) ? data : (data.orders || []);
            setOrders(ordersList);

        } catch (e) {
            console.error("Fetch Error:", e);
            setError(e.message || "Failed to load order history.");
            if (setNotification) {
                setNotification({ message: "Error loading orders.", type: 'error' });
            }
        } finally {
            setLoading(false);
        }
    }, [userId, setNotification]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // --- RENDER HELPERS ---
    const getStatusStyle = (status) => {
        const base = "px-3 py-1 rounded-sm text-[10px] uppercase font-bold tracking-wider border";
        switch (status) {
            case 'Completed': return `${base} bg-green-900/20 text-green-400 border-green-900`;
            case 'Shipped': return `${base} bg-blue-900/20 text-blue-400 border-blue-900`;
            case 'Processing': return `${base} bg-yellow-900/20 text-yellow-400 border-yellow-900`;
            case 'Pending': return `${base} bg-red-900/20 text-red-400 border-red-900`;
            default: return `${base} bg-gray-800 text-gray-400 border-gray-700`;
        }
    };

    // --- LOADING VIEW ---
    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64 bg-[#0A0A0A] border border-[#333] rounded-xl">
            <Loader2 className="text-[#CCFF00] mb-4 animate-spin" size={32} />
            <p className="font-mono text-sm text-[#888]">Retrieving data...</p>
        </div>
    );

    // --- ERROR VIEW ---
    if (error) return (
        <div className="p-6 bg-red-900/10 border border-red-900/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-4">
                <AlertCircle className="text-red-500" size={24} />
                <div>
                    <h3 className="font-bold text-red-400">Unable to Load Orders</h3>
                    <p className="text-red-600/80 text-sm font-mono">{error}</p>
                </div>
            </div>
            <button onClick={fetchOrders} className="p-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded transition-colors">
                <RefreshCw size={18} />
            </button>
        </div>
    );

    // --- EMPTY VIEW ---
    if (orders.length === 0) return (
        <div className="text-center py-20 bg-[#0A0A0A] border border-[#333] rounded-xl border-dashed">
            <ShoppingBag size={48} className="mx-auto text-[#333] mb-4" />
            <p className="font-mono text-[#888]">No orders found.</p>
        </div>
    );

    // --- MAIN TABLE VIEW ---
    return (
        <div className="bg-[#0A0A0A] border border-[#333] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[#333] bg-[#111]">
                            <th className="p-4 font-mono text-xs uppercase text-[#666]">ID</th>
                            <th className="p-4 font-mono text-xs uppercase text-[#666]">Date</th>
                            <th className="p-4 font-mono text-xs uppercase text-[#666]">Total</th>
                            <th className="p-4 font-mono text-xs uppercase text-[#666]">Status</th>
                            <th className="p-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222]">
                        {orders.map(order => (
                            <tr
                                key={order.id}
                                onClick={() => navigate(`/account/orders/${order.id}`)}
                                className="group hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                            >
                                <td className="p-4 font-mono text-white font-bold group-hover:text-[#CCFF00] transition-colors">
                                    {order.order_number_display || order.id}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-[#888] text-sm font-mono">
                                        <Calendar size={14} />
                                        {new Date(order.created_at).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                            hour12: true
                                        })}
                                    </div>
                                </td>
                                <td className="p-4 font-mono text-white">
                                    {formatCurrency(order.total_cents, currentCurrency)}
                                </td>
                                <td className="p-4">
                                    <span className={getStatusStyle(order.status)}>{order.status}</span>
                                </td>
                                <td className="p-4 text-right text-[#444] group-hover:text-[#CCFF00]">
                                    <ChevronRight size={18} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};