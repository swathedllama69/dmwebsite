import React, { useState, useEffect, useMemo } from 'react';
import {
    Truck, RefreshCcw, Loader2, Search, FileText, ArrowUpDown,
    Clock, ChevronLeft, ChevronRight, CheckCircle, AlertCircle,
    Printer, X, MapPin, Instagram, Twitter, Mail, Eye, FileX
} from 'lucide-react';
import { formatCurrency, API_BASE_URL } from '../utils/config.js';

// --- HELPER CONFIGURATION ---
const formatOrderId = (id) => `ORD-${parseInt(id) + 8800}`;
const LOGO_URL = "https://devoltmould.com.ng/resources/devolt_logo.png";

// Helper specifically for the invoice items
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

// --- INVOICE/RECEIPT MODAL COMPONENT ---
const InvoiceModal = ({ order, onClose }) => {
    if (!order) return null;
    const docDate = new Date(order.created_at).toLocaleDateString();

    // LOGIC: Determine Document Type based on Status
    const isPaid = ['processing', 'shipped', 'delivered', 'completed', 'proof provided'].includes(order.status?.toLowerCase());
    const docTitle = isPaid ? "OFFICIAL RECEIPT" : "PROFORMA INVOICE";

    const handlePrint = () => {
        const originalTitle = document.title;
        const firstName = order.customer_name ? order.customer_name.split(' ')[0] : 'Customer';
        const fileName = `ADMIN_${isPaid ? 'RECEIPT' : 'INVOICE'}_${firstName}_${formatOrderId(order.id)}`;
        document.title = fileName;
        window.print();
        setTimeout(() => { document.title = originalTitle; }, 1000);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap');
                @media print {
                    @page { size: A4; margin: 0; }
                    html, body { height: 100%; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
                    body * { visibility: hidden; }
                    #printable-receipt, #printable-receipt * { visibility: visible; }
                    #printable-receipt {
                        position: absolute; left: 0; top: 0; width: 100%; max-width: 210mm;
                        padding: 40px; background: white; color: black !important;
                    }
                    .no-print { display: none !important; }
                }
            `}</style>

            <div id="printable-receipt" className="bg-white text-black w-full max-w-md rounded-xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="no-print absolute top-3 right-3 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600"><X size={20} /></button>

                <div className="p-8 overflow-y-auto print:overflow-visible print:p-0">
                    <div className="flex flex-col items-center text-center border-b border-dashed border-gray-300 pb-6 mb-6 print:border-black">
                        <img src={LOGO_URL} alt="Devolt Logo" className="h-14 w-auto object-contain mb-2" />
                        <div className="text-2xl font-black tracking-widest uppercase mb-1" style={{ fontFamily: "'Cinzel', serif" }}>- DEVOLT -</div>

                        {/* DYNAMIC DOCUMENT TITLE */}
                        <div className={`text-xs font-black uppercase tracking-[0.3em] border px-3 py-1 rounded mb-4 ${isPaid ? 'border-black text-black' : 'border-gray-300 text-gray-400'}`}>
                            {docTitle}
                        </div>

                        <div className="w-full flex justify-between items-center text-xs border-t border-dashed border-gray-200 pt-4 print:border-black">
                            <div className="text-left">
                                <span className="block text-gray-400 uppercase tracking-wider text-[10px]">Ref No.</span>
                                <span className="font-mono font-bold">#{order.order_number_display || formatOrderId(order.id)}</span>
                            </div>
                            <div className="text-right">
                                <span className="block text-gray-400 uppercase tracking-wider text-[10px]">Date</span>
                                <span className="font-mono font-bold">{docDate}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8 text-sm">
                        <p className="font-bold uppercase text-[10px] text-gray-400 tracking-widest mb-2 border-b border-gray-100 pb-1 print:border-black">Billed To</p>
                        <p className="font-bold text-lg">{order.customer_name}</p>
                        <p className="text-gray-600">{order.shipping_address}</p>
                        <p className="text-gray-600">{order.shipping_city} {order.shipping_zip}</p>
                        <p className="text-gray-600 mt-1 text-xs">{order.customer_email}</p>
                    </div>

                    <div className="mb-8">
                        <p className="font-bold uppercase text-[10px] text-gray-400 tracking-widest mb-3 border-b border-gray-100 pb-1 print:border-black">Description</p>
                        <div className="space-y-4">
                            {order.items && order.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm items-start">
                                    <div className="pr-4 flex-1">
                                        <div className="font-bold">{item.product_name}</div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Qty: {item.quantity} {item.size ? `• ${item.size}` : ''}</div>
                                    </div>
                                    <div className="font-mono text-right font-medium">{formatPrice((item.price_cents || item.price * 100) * item.quantity)}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t-2 border-black pt-4 mb-8 flex justify-between items-end">
                        <div className="text-xs text-gray-500">Total {isPaid ? 'Paid' : 'Due'}</div>
                        <div className="text-2xl font-black font-display">{formatPrice(order.total_cents)}</div>
                    </div>

                    <div className="mt-auto pt-8 border-t border-gray-100 print:border-black text-center">
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest flex justify-center items-center gap-1 mb-2"><MapPin size={10} /> Abuja, Nigeria</div>
                        {!isPaid && <div className="text-[9px] text-red-500 font-bold uppercase tracking-widest">Payment Pending - Not valid as receipt</div>}
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 no-print rounded-b-xl">
                    <button onClick={handlePrint} className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">
                        <Printer size={16} /> Print {isPaid ? 'Receipt' : 'Invoice'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const AdminOrdersList = ({ currentCurrency, setNotification, navigateToOrderDetail }) => {
    const [orders, setOrders] = useState([]);
    const [receiptOrderIds, setReceiptOrderIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

    // Invoice State
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [fetchingDetailsId, setFetchingDetailsId] = useState(null);

    const itemsPerPage = 12;

    const fetchData = async () => {
        setLoading(true);
        try {
            const [oRes, rRes] = await Promise.all([
                fetch(`${API_BASE_URL}/orders.php?action=get_all_orders`),
                fetch(`${API_BASE_URL}/receipts.php`)
            ]);
            const oData = await oRes.json();
            const rData = await rRes.json();
            setOrders(Array.isArray(oData) ? oData : (oData.orders || []));
            setReceiptOrderIds(new Set(rData.map(r => String(r.order_id))));
        } catch (err) {
            setNotification({ message: "Sync Error", type: 'error' });
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    // Logic to open invoice (Fetch details if items are missing)
    const handleOpenInvoice = async (e, order) => {
        e.stopPropagation();
        if (order.items && order.items.length > 0) {
            setSelectedInvoice(order);
        } else {
            setFetchingDetailsId(order.id);
            try {
                const response = await fetch(`${API_BASE_URL}/orders.php?action=get_order&id=${order.id}`);
                const data = await response.json();
                let details = Array.isArray(data) ? data[0] : (data.order || data);

                if (details.items && typeof details.items === 'string') {
                    try { details.items = JSON.parse(details.items); } catch (e) { details.items = []; }
                }

                const fullOrder = { ...order, ...details };
                setOrders(prev => prev.map(o => o.id === order.id ? fullOrder : o));
                setSelectedInvoice(fullOrder);
            } catch (err) {
                setNotification({ message: "Could not load order items.", type: 'error' });
            } finally {
                setFetchingDetailsId(null);
            }
        }
    };

    const processedOrders = useMemo(() => {
        let filtered = orders.filter(o =>
            o.id.toString().includes(searchTerm.toLowerCase()) ||
            o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        filtered.sort((a, b) => {
            // Handle string comparisons safely
            const valA = (a[sortConfig.key] || '').toString().toLowerCase();
            const valB = (b[sortConfig.key] || '').toString().toLowerCase();

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return filtered;
    }, [orders, searchTerm, sortConfig]);

    const paginatedOrders = processedOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(processedOrders.length / itemsPerPage);

    if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={40} /></div>;

    return (
        <>
            {selectedInvoice && <InvoiceModal order={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}

            <div className="space-y-6 pt-6 text-current animate-in fade-in duration-500">

                {/* Controls Header */}
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="relative flex-1 max-w-xl group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                        <input
                            type="text" placeholder="SEARCH ORDER ID OR CUSTOMER NAME..."
                            className="w-full bg-white/5 border border-white/10 text-current pl-12 pr-4 py-4 rounded-2xl focus:border-primary outline-none font-black text-xs tracking-widest uppercase transition-all placeholder:opacity-30"
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <button onClick={fetchData} className="bg-primary text-black px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:scale-105 active:scale-95 transition-all text-xs uppercase shadow-lg shadow-primary/20">
                        <RefreshCcw size={16} /> Refresh Orders
                    </button>
                </div>

                {/* Orders Table */}
                <div className="bg-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead className="bg-white/5 text-primary uppercase text-[10px] tracking-[0.2em] font-black border-b border-white/10">
                                <tr>
                                    <th className="p-6 w-16">S/N</th>

                                    {/* ORDER ID SORT */}
                                    <th className="p-6 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setSortConfig({ key: 'id', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
                                        Order ID <ArrowUpDown size={12} className="inline ml-1 opacity-50" />
                                    </th>

                                    <th className="p-6">Client Info</th>

                                    {/* DATE SORT */}
                                    <th className="p-6 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setSortConfig({ key: 'created_at', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
                                        Date / Time <ArrowUpDown size={12} className="inline ml-1 opacity-50" />
                                    </th>

                                    <th className="p-6 text-center">Payment Proof</th>
                                    <th className="p-6 text-right">Total Value</th>

                                    {/* STATUS SORT (New) */}
                                    <th className="p-6 text-center cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setSortConfig({ key: 'status', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
                                        Status <ArrowUpDown size={12} className="inline ml-1 opacity-50" />
                                    </th>

                                    <th className="p-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {paginatedOrders.map((order, index) => {
                                    const serialNumber = ((currentPage - 1) * itemsPerPage) + (index + 1);

                                    const statusLower = order.status?.toLowerCase() || '';
                                    const isCancelled = statusLower === 'cancelled';
                                    const isPending = statusLower === 'pending';

                                    return (
                                        // Row Click Handler for standard navigation
                                        <tr key={order.id} onClick={() => navigateToOrderDetail(order.id)} className="hover:bg-white/[0.02] transition-colors group text-current cursor-pointer">
                                            <td className="p-6 font-mono opacity-50 text-[10px]">{serialNumber}</td>

                                            {/* Clickable ID Style */}
                                            <td className="p-6 font-black text-sm tracking-tighter group-hover:text-primary transition-colors underline decoration-transparent group-hover:decoration-primary underline-offset-4">
                                                {order.order_number_display || `#${order.id}`}
                                            </td>

                                            <td className="p-6">
                                                <div className="font-black uppercase text-xs tracking-tight">{order.customer_name}</div>
                                                <div className="opacity-50 text-[10px] font-mono mt-1">{order.customer_email}</div>
                                            </td>
                                            <td className="p-6 font-mono text-[11px] opacity-80">
                                                <div className="flex items-center gap-2 mb-1"><span className="opacity-50">D:</span> {new Date(order.created_at).toLocaleDateString()}</div>
                                                <div className="flex items-center gap-2 text-primary"><Clock size={10} /> {new Date(order.created_at).toLocaleTimeString()}</div>
                                            </td>
                                            <td className="p-6 text-center">
                                                {receiptOrderIds.has(String(order.id)) ?
                                                    <div className="inline-flex items-center gap-1.5 text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase italic">
                                                        <CheckCircle size={10} /> Uploaded
                                                    </div> :
                                                    <div className="inline-flex items-center gap-1.5 opacity-40 px-3 py-1.5 text-[9px] font-black uppercase">
                                                        <AlertCircle size={10} /> Pending
                                                    </div>
                                                }
                                            </td>
                                            <td className="p-6 text-right font-black text-sm italic">{formatCurrency(order.total_cents, currentCurrency)}</td>
                                            <td className="p-6 text-center">
                                                <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${order.status === 'Completed' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                                                    order.status === 'Pending' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                                                        order.status === 'Cancelled' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                                            'bg-white/5 border-white/10 text-current'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right" onClick={(e) => e.stopPropagation()}>
                                                {/* Stop propagation on actions cell to prevent row click firing when clicking buttons */}
                                                <div className="flex justify-end gap-2">

                                                    {!isCancelled && (
                                                        <button
                                                            onClick={(e) => handleOpenInvoice(e, order)}
                                                            className={`p-2 border rounded-lg transition-all text-current disabled:opacity-50 ${isPending
                                                                ? 'bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500 hover:text-black'
                                                                : 'bg-white/5 border-white/10 hover:bg-primary hover:text-black hover:border-primary'
                                                                }`}
                                                            disabled={fetchingDetailsId === order.id}
                                                            title={isPending ? "View Invoice" : "Print Receipt"}
                                                        >
                                                            {fetchingDetailsId === order.id ? (
                                                                <Loader2 size={14} className="animate-spin" />
                                                            ) : isPending ? (
                                                                <FileText size={14} />
                                                            ) : (
                                                                <Printer size={14} />
                                                            )}
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => navigateToOrderDetail(order.id)}
                                                        className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/20 transition-all text-current"
                                                        title="View Details"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-6 bg-white/5 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-[10px] uppercase font-black opacity-60 tracking-[0.2em]">Viewing {paginatedOrders.length} of {processedOrders.length} entries</p>
                        <div className="flex gap-4 items-center">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="text-current hover:text-primary disabled:opacity-20 font-black uppercase text-[10px] flex items-center gap-2 transition-all">
                                <ChevronLeft size={16} /> Prev
                            </button>
                            <div className="flex gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-primary text-black' : 'bg-white/5 text-current hover:bg-white/20'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="text-current hover:text-primary disabled:opacity-20 font-black uppercase text-[10px] flex items-center gap-2 transition-all">
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};