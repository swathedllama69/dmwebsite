import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Save, ShoppingBag, DollarSign, MapPin, Printer, Download, X, AlertCircle } from 'lucide-react';

// NOTE: Assumes formatCurrency utility is available via the component's context or shared imports
import { formatCurrency } from '../utils/config.js';

const RECEIPT_LOGO_URL = "http://devoltmould.com.ng/resources/devolt_logo.png";


// --- Receipt View Component (Optimized for A4/PDF Download) ---
const ReceiptView = ({ order, currentCurrency, onClose }) => {
    const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    const handleDownloadClick = () => {
        // Triggers the browser's Print dialog, where the user must select 'Save as PDF' 
        window.print();
    };

    return (
        // Full screen wrapper for receipt preview
        <div className="fixed inset-0 z-[100] bg-gray-900/90 overflow-y-auto p-4 md:p-10 flex flex-col items-center">

            {/* Controls (Hidden during print) */}
            <div className="mt-4 mb-6 flex justify-center gap-4 print:hidden w-full max-w-4xl">
                <button
                    onClick={handleDownloadClick}
                    className="flex items-center justify-center gap-2 bg-[#CCFF00] text-black px-6 py-3 rounded-lg font-bold hover:bg-white transition-colors uppercase tracking-wide font-mono"
                >
                    <Download size={18} /> Download/Print Receipt
                </button>
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 font-mono text-sm text-gray-400 hover:text-white transition-colors"
                >
                    <X size={16} /> Close Preview
                </button>
            </div>

            <p className="text-center font-mono text-xs text-gray-400 mb-4 print:hidden">
                * Note: Select "Save as PDF" in the print dialog for an automatic download. Optimized for A4 paper size.
            </p>

            <div id="receipt-content"
                className="bg-white text-black p-8 md:p-12 max-w-4xl mx-auto rounded-lg shadow-xl mb-10 
                            print:shadow-none print:my-0 print:p-8 print:w-full print:max-w-none print:h-auto print:text-black"
            >

                {/* Header (Logo & Order Info) */}
                <div className="flex justify-between items-start mb-6 border-b border-gray-300 pb-4">
                    <div className="flex items-center">
                        <img
                            src={RECEIPT_LOGO_URL}
                            alt="Devolt Mould Logo"
                            className="h-16 w-auto mr-4"
                        />
                        <h1 className="text-2xl font-bold uppercase">Transaction Receipt</h1>
                    </div>

                    <div className="text-right">
                        {/* FIX: Use the prefixed order number */}
                        <p className="text-lg font-mono">Order # {order.order_number_display || String(order.id).padStart(6, '0')}</p>
                        <p className="text-sm text-gray-600">Date: {new Date(order.created_at).toLocaleDateString()}</p>
                        <p className={`text-sm font-bold mt-1 ${order.status === 'Completed' ? 'text-green-600' : 'text-orange-500'}`}>
                            Status: {order.status.toUpperCase()}
                        </p>
                    </div>
                </div>

                {/* Customer Details */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-2 border-b border-gray-200 pb-1">Customer & Shipping Details</h2>
                    <p className="font-mono text-sm">{order.customer_info.name}</p>
                    <p className="font-mono text-sm text-gray-600">{order.customer_info.email}</p>
                    <p className="font-mono text-sm mt-2">{order.customer_info.address}</p>
                    <p className="font-mono text-sm">{order.customer_info.city}, {order.customer_info.zip}</p>
                </div>

                {/* Items Table */}
                <table className="w-full mb-8 border-collapse">
                    <thead>
                        <tr className="border-b-2 border-gray-500 bg-gray-50">
                            <th className="text-left font-bold py-2 px-1">Item ({totalItems})</th>
                            <th className="font-bold py-2 text-right w-1/5 px-1">Unit Price</th>
                            <th className="font-bold py-2 text-center w-1/12 px-1">Qty</th>
                            <th className="font-bold py-2 text-right w-1/5 px-1">Line Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map(item => (
                            <tr key={item.product_id} className="border-b border-gray-200">
                                <td className="py-3 text-left px-1">{item.product_name}</td>
                                <td className="py-3 text-right font-mono text-sm px-1">{formatCurrency(item.price_at_purchase, currentCurrency)}</td>
                                <td className="py-3 text-center font-mono text-sm px-1">{item.quantity}</td>
                                <td className="py-3 text-right font-mono font-bold px-1">{formatCurrency(item.price_at_purchase * item.quantity, currentCurrency)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals Summary */}
                <div className="flex justify-end pt-4 space-y-2 flex-col items-end">
                    <p className="font-mono text-sm">Subtotal: <span className="font-bold">{formatCurrency(order.total_cents - (order.shipping_cents || 0), currentCurrency)}</span></p>
                    <p className="font-mono text-sm">Shipping: <span className="font-bold">{formatCurrency(order.shipping_cents || 0, currentCurrency)}</span></p>
                    <p className="font-mono text-xl font-bold border-t-2 border-black pt-2">
                        GRAND TOTAL: {formatCurrency(order.total_cents, currentCurrency)}
                    </p>
                </div>
            </div>

        </div>
    );
}

// --- OrderDetail Component (A3.4) ---
export const OrderDetail = ({ orderId, currentCurrency, navigate, API_BASE_URL, setNotification }) => {
    // The component receives orderId via props from the helper component
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);

    const fetchOrder = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch single order using query parameter 'id'
            const response = await fetch(`${API_BASE_URL}/orders.php?id=${orderId}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // Assuming data is the singular order object
            setOrder(data);
        } catch (e) {
            console.error("Failed to fetch order details:", e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [orderId, API_BASE_URL]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    const handleStatusChange = async (statusLabel) => {
        // FIX: Map the UI label ("Delivered") to the API/DB value ("Completed")
        const newStatus = statusLabel === 'Delivered' ? 'Completed' : statusLabel;

        if (!window.confirm(`Are you sure you want to change status to "${statusLabel}"?`)) {
            return;
        }

        setSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/orders.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, status: newStatus })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            // Update local state using the newStatus (the DB value)
            setOrder(prev => ({ ...prev, status: newStatus }));
            setNotification({ message: `Order #${orderId} updated to ${statusLabel}.`, type: 'success' });
        } catch (e) {
            console.error("Status update failed:", e);
            setNotification({ message: `Error updating status: ${e.message}`, type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center py-20"><Loader2 className="animate-spin w-8 h-8 mx-auto text-[#CCFF00]" /><p className="mt-4 font-mono text-[#888]">Loading order details...</p></div>;
    if (error) return <div className="text-center py-10 bg-red-900/20 border border-red-700 rounded-lg"><p className="font-mono text-red-400">Error loading order: {error}</p></div>;
    if (!order) return <div className="text-center py-10 bg-[#111] rounded-lg border border-[#333] font-mono text-[#888]">Order Not Found.</div>;

    // --- RECEIPT VIEW RENDER ---
    if (showReceipt) {
        return <ReceiptView order={order} currentCurrency={currentCurrency} onClose={() => setShowReceipt(false)} />;
    }
    // ---------------------------

    const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    const StatusButton = ({ status, label, bgColor }) => {
        // Map the DB status back to the UI label for button matching
        const currentStatusLabel = order.status === 'Completed' ? 'Delivered' : order.status;

        // Use the label for the button text, but send the label (which will be mapped in handleStatusChange)
        return (
            <button
                onClick={() => handleStatusChange(label)}
                disabled={currentStatusLabel === label || saving}
                className={`font-mono text-xs uppercase px-3 py-1 rounded-md text-black transition-opacity ${bgColor} ${currentStatusLabel === label ? 'opacity-100 font-bold' : 'opacity-50 hover:opacity-100'} disabled:opacity-30 disabled:cursor-not-allowed`}
            >
                {label}
            </button>
        );
    };

    // Helper to determine the current status color for the header
    const getStatusColor = (status) => {
        // Map 'Completed' back to the UI color scheme for 'Delivered'
        const currentStatus = status === 'Completed' ? 'Delivered' : status;
        switch (currentStatus) {
            case 'Pending': return 'bg-yellow-400';
            case 'Processing': return 'bg-blue-300';
            case 'Shipped': return 'bg-blue-400';
            case 'Delivered': return 'bg-[#CCFF00]';
            case 'Cancelled': return 'bg-red-400';
            default: return 'bg-gray-400';
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto pt-20 p-8 text-white">
            <div className="bg-[#111] rounded-lg shadow-xl border border-[#1a1a1a] p-6 md:p-8">
                <button
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-2 font-mono text-sm text-[#888] hover:text-[#CCFF00] mb-8 transition-colors"
                >
                    <ArrowLeft size={16} /> Back to Orders List
                </button>

                <header className="border-b border-[#333] pb-4 mb-8 flex justify-between items-start">
                    <div>
                        <h2 className="font-display text-4xl uppercase text-[#CCFF00]">
                            {/* FIX: Use the prefixed order number */}
                            Order #{order.order_number_display || String(order.id).padStart(6, '0')}
                        </h2>
                        <p className="font-mono text-sm text-[#888] mt-1">Placed on: {new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <span className={`px-4 py-1 rounded-full font-mono font-bold text-black text-sm ${getStatusColor(order.status)}`}>
                            {order.status === 'Completed' ? 'DELIVERED' : order.status.toUpperCase()}
                        </span>
                        <p className="font-mono text-2xl text-white font-bold mt-2">{formatCurrency(order.total_cents, currentCurrency)}</p>
                    </div>
                </header>

                {/* Status Controls */}
                <div className="mb-8 p-4 bg-black border border-[#333] rounded-md flex items-center justify-between">
                    <p className="font-mono text-sm uppercase text-white">Update Status:</p>
                    <div className="space-x-2 flex items-center">
                        <StatusButton status="Pending" label="Pending" bgColor="bg-yellow-400" />
                        <StatusButton status="Processing" label="Processing" bgColor="bg-blue-300" />
                        <StatusButton status="Shipped" label="Shipped" bgColor="bg-blue-400" />
                        <StatusButton status="Delivered" label="Delivered" bgColor="bg-[#CCFF00]" />
                        <StatusButton status="Cancelled" label="Cancelled" bgColor="bg-red-400" />

                        {saving && <Loader2 size={16} className="text-[#CCFF00] animate-spin ml-4" />}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Customer Info */}
                    <div className="md:col-span-1 border border-[#333] p-4 rounded-md">
                        <h3 className="font-mono text-lg text-[#CCFF00] mb-3 flex items-center gap-2"><MapPin size={18} /> Customer & Shipping</h3>
                        <p className="text-white font-bold">{order.customer_info.name}</p>
                        <p className="text-sm text-[#888]">{order.customer_info.email}</p>
                        <p className="text-sm text-[#888] mt-4">{order.customer_info.address}</p>
                        <p className="text-sm text-[#888]">{order.customer_info.city}, {order.customer_info.zip}</p>
                    </div>

                    {/* Items & Totals */}
                    <div className="md:col-span-2 border border-[#333] p-4 rounded-md">
                        <h3 className="font-mono text-lg text-[#CCFF00] mb-3 flex items-center gap-2"><ShoppingBag size={18} /> Items ({totalItems})</h3>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {order.items.map(item => (
                                <div key={item.product_id} className="flex justify-between items-center text-sm border-b border-[#1a1a1a] pb-2">
                                    <span className="font-semibold text-white">{item.product_name}</span>
                                    <span className="font-mono text-[#888]">
                                        {item.quantity} x {formatCurrency(item.price_at_purchase, currentCurrency)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="mt-4 pt-4 border-t border-[#333] space-y-2">
                            {/* Assuming total_cents includes shipping, and shipping_cents is fetched/available */}
                            <div className="flex justify-between font-mono text-sm text-[#888]">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(order.total_cents - (order.shipping_cents || 0), currentCurrency)}</span>
                            </div>
                            <div className="flex justify-between font-mono text-sm text-[#888]">
                                <span>Shipping:</span>
                                <span>{formatCurrency(order.shipping_cents || 0, currentCurrency)}</span>
                            </div>
                            <div className="flex justify-between font-mono text-lg font-bold text-[#CCFF00]">
                                <span>TOTAL:</span>
                                <span>{formatCurrency(order.total_cents, currentCurrency)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Receipt Button */}
                <div className="mt-8 pt-6 border-t border-[#333] text-right">
                    <button
                        onClick={() => setShowReceipt(true)}
                        className="flex items-center gap-2 ml-auto bg-gray-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-600 transition-colors uppercase tracking-wide font-mono"
                    >
                        <Printer size={18} /> Generate Receipt
                    </button>
                </div>
            </div>
        </div>
    );
};