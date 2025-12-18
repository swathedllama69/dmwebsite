import React, { useState, useEffect, useMemo } from 'react';
import { Truck, RefreshCcw, Loader2, Search, FileText, ArrowUpDown, Clock, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { formatCurrency, API_BASE_URL } from '../utils/config.js';

export const AdminOrdersList = ({ currentCurrency, setNotification, navigateToOrderDetail }) => {
    const [orders, setOrders] = useState([]);
    const [receiptOrderIds, setReceiptOrderIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
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

    const processedOrders = useMemo(() => {
        let filtered = orders.filter(o =>
            o.id.toString().includes(searchTerm.toLowerCase()) ||
            o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        filtered.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return filtered;
    }, [orders, searchTerm, sortConfig]);

    const paginatedOrders = processedOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(processedOrders.length / itemsPerPage);

    if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-[#CCFF00]" size={40} /></div>;

    return (
        <div className="space-y-6 pt-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#CCFF00]" size={20} />
                    <input
                        type="text" placeholder="SEARCH ORDER ID OR CUSTOMER NAME..."
                        className="w-full bg-[#111] border-2 border-gray-800 text-white pl-12 pr-4 py-4 rounded-2xl focus:border-[#CCFF00] outline-none font-black text-xs tracking-widest uppercase"
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>
                <button onClick={fetchData} className="bg-[#CCFF00] text-black px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:scale-105 active:scale-95 transition-all text-xs uppercase">
                    <RefreshCcw size={16} /> Refresh Orders
                </button>
            </div>

            <div className="bg-[#0a0a0a] rounded-3xl border border-gray-800 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead className="bg-[#111] text-[#CCFF00] uppercase text-[10px] tracking-[0.2em] font-black border-b border-gray-800">
                            <tr>
                                {/* Added S/N Header */}
                                <th className="p-6 w-16">S/N</th>
                                <th className="p-6 cursor-pointer hover:bg-black transition-colors" onClick={() => setSortConfig({ key: 'id', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>Order ID <ArrowUpDown size={12} className="inline ml-1" /></th>
                                <th className="p-6">Client Info</th>
                                <th className="p-6 cursor-pointer hover:bg-black transition-colors" onClick={() => setSortConfig({ key: 'created_at', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>Date / Time <ArrowUpDown size={12} className="inline ml-1" /></th>
                                <th className="p-6 text-center">Payment Status</th>
                                <th className="p-6 text-right">Total Value</th>
                                <th className="p-6 text-right">Order Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-900">
                            {paginatedOrders.map((order, index) => {
                                // Calculate continuous Serial Number across pages
                                const serialNumber = ((currentPage - 1) * itemsPerPage) + (index + 1);

                                return (
                                    <tr key={order.id} onClick={() => navigateToOrderDetail(order.id)} className="hover:bg-[#CCFF00]/5 cursor-pointer transition-all border-b border-gray-900/50">
                                        {/* Added S/N Cell */}
                                        <td className="p-6 font-mono text-gray-500 text-[10px]">{serialNumber}</td>

                                        <td className="p-6 font-black text-white text-sm tracking-tighter">{order.order_number_display || `#${order.id}`}</td>
                                        <td className="p-6">
                                            <div className="text-white font-black uppercase text-xs tracking-tight">{order.customer_name}</div>
                                            <div className="text-gray-500 text-[10px] font-mono mt-1">{order.customer_email}</div>
                                        </td>
                                        <td className="p-6 font-mono text-[11px] text-white">
                                            <div className="flex items-center gap-2 mb-1"><span className="text-gray-600">D:</span> {new Date(order.created_at).toLocaleDateString()}</div>
                                            <div className="flex items-center gap-2 text-[#CCFF00]"><Clock size={10} /> {new Date(order.created_at).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="p-6 text-center">
                                            {receiptOrderIds.has(String(order.id)) ?
                                                <div className="flex items-center justify-center gap-1.5 text-[#CCFF00] bg-[#CCFF00]/10 border border-[#CCFF00]/20 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase italic">
                                                    <CheckCircle size={10} /> Receipt Uploaded
                                                </div> :
                                                <div className="flex items-center justify-center gap-1.5 text-gray-600 px-3 py-1.5 text-[9px] font-black uppercase">
                                                    <AlertCircle size={10} /> Not Found
                                                </div>
                                            }
                                        </td>
                                        <td className="p-6 text-right text-white font-black text-sm italic">{formatCurrency(order.total_cents, currentCurrency)}</td>
                                        <td className="p-6 text-right">
                                            <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${order.status === 'Completed' ? 'bg-green-600 text-white' : 'bg-gray-800 text-white'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 bg-[#111] border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em]">Viewing {paginatedOrders.length} of {processedOrders.length} entries</p>
                    <div className="flex gap-4 items-center">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="text-white hover:text-[#CCFF00] disabled:opacity-20 font-black uppercase text-[10px] flex items-center gap-2 transition-all">
                            <ChevronLeft size={16} /> Prev
                        </button>
                        <div className="flex gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-[#CCFF00] text-black' : 'bg-black text-gray-500 hover:text-white'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="text-white hover:text-[#CCFF00] disabled:opacity-20 font-black uppercase text-[10px] flex items-center gap-2 transition-all">
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};