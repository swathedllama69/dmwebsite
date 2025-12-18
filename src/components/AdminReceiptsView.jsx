import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Receipt,
    Loader2,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    X,
    ExternalLink,
    Search,
    User,
    DollarSign
} from 'lucide-react';
import { API_BASE_URL, formatCurrency } from '../utils/config.js';

export const AdminReceiptsView = ({ currentCurrency, setNotification }) => {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('Pending');

    // Use absolute URL for direct file access from shared hosting
    // This removes the "api/" part of the URL to point to the root where /receipt_uploads lives
    const DOMAIN_ROOT = API_BASE_URL.replace('/api', '');

    const ADMIN_USER_ID = 1;

    const fetchReceipts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/receipts.php`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setReceipts(data);
        } catch (e) {
            console.error("Failed to fetch receipts:", e);
            setError(e.message || "Failed to load receipts.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReceipts();
    }, [fetchReceipts]);

    const updateReceiptStatus = async (receiptId, newStatus) => {
        if (!confirm(`Confirm status change to '${newStatus}'? This will automatically update the Order status.`)) return;

        setReceipts(receipts.map(r => r.receipt_id === receiptId ? { ...r, isUpdating: true } : r));

        try {
            const response = await fetch(`${API_BASE_URL}/receipts.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receipt_id: receiptId,
                    status: newStatus,
                    admin_user_id: ADMIN_USER_ID
                })
            });

            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.error || "Update failed");

            setNotification({ message: result.message, type: 'success' });
            fetchReceipts();
        } catch (e) {
            setNotification({ message: `Error: ${e.message}`, type: 'error' });
            setReceipts(receipts.map(r => r.receipt_id === receiptId ? { ...r, isUpdating: false } : r));
        }
    };

    const filteredReceipts = useMemo(() => {
        let items = [...receipts];
        if (filterStatus !== 'All') {
            items = items.filter(r => r.verification_status === filterStatus);
        }
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            items = items.filter(r =>
                r.order_number_display.toLowerCase().includes(lowerSearch) ||
                r.customer_email.toLowerCase().includes(lowerSearch) ||
                r.customer_name.toLowerCase().includes(lowerSearch)
            );
        }
        return items.sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date));
    }, [receipts, filterStatus, searchTerm]);

    if (loading && receipts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="text-[#CCFF00] animate-spin mb-4" size={40} />
                <p className="text-gray-400 font-mono">Fetching Payment Proofs...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center border-b border-[#333] pb-4">
                <h2 className="font-display text-3xl uppercase text-white flex items-center gap-3">
                    <Receipt size={28} className="text-[#CCFF00]" /> Payments Review
                </h2>
                <button onClick={fetchReceipts} className="text-[#888] hover:text-[#CCFF00] flex items-center gap-2 font-mono text-xs uppercase">
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Sync Data
                </button>
            </header>

            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-grow max-w-md">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by Order # or Customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black border border-[#333] p-3 pl-10 rounded text-white font-mono text-sm focus:border-[#CCFF00] outline-none"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs uppercase font-mono text-gray-500 tracking-widest">Filter:</span>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-black border border-[#333] text-white p-2 rounded font-mono text-sm outline-none focus:border-[#CCFF00]"
                    >
                        <option value="Pending">Pending</option>
                        <option value="Verified">Verified</option>
                        <option value="Rejected">Rejected</option>
                        <option value="All">All History</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto border border-[#333] rounded-lg">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#111] text-[#888] font-mono text-[10px] uppercase tracking-widest">
                        <tr>
                            <th className="p-4 border-b border-[#333]">ID</th>
                            <th className="p-4 border-b border-[#333]">Order Info</th>
                            <th className="p-4 border-b border-[#333]">Customer</th>
                            <th className="p-4 border-b border-[#333]">Amount</th>
                            <th className="p-4 border-b border-[#333]">Status</th>
                            <th className="p-4 border-b border-[#333] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222]">
                        {filteredReceipts.map((receipt) => (
                            <tr key={receipt.receipt_id} className={`hover:bg-white/5 transition-colors group ${receipt.isUpdating ? 'opacity-50' : ''}`}>
                                <td className="p-4 font-mono text-xs text-gray-500">#{receipt.receipt_id}</td>

                                <td className="p-4">
                                    <div className="flex items-center gap-4">
                                        {/* --- MODERN THUMBNAIL PREVIEW --- */}
                                        <div className="relative w-12 h-12 bg-black rounded-lg border border-[#333] overflow-hidden flex-shrink-0 group-hover:border-[#CCFF00] transition-colors">
                                            <img
                                                src={`${DOMAIN_ROOT}${receipt.file_path}`}
                                                alt="Receipt"
                                                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity cursor-zoom-in"
                                                onClick={() => window.open(`${DOMAIN_ROOT}${receipt.file_path}`, '_blank')}
                                                onError={(e) => { e.target.src = "https://devoltmould.com.ng/resources/placeholder.jpg"; }}
                                            />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white uppercase tracking-tighter">{receipt.order_number_display}</div>
                                            <div className="text-[10px] text-gray-500 font-mono">{new Date(receipt.upload_date).toLocaleString()}</div>
                                        </div>
                                    </div>
                                </td>

                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-sm text-white font-bold">
                                        <User size={14} className="text-[#CCFF00]" /> {receipt.customer_name}
                                    </div>
                                    <div className="text-xs text-gray-500 font-mono">{receipt.customer_email}</div>
                                </td>

                                <td className="p-4 font-black text-lg text-[#CCFF00] font-mono">
                                    {formatCurrency(receipt.total_cents, currentCurrency)}
                                </td>

                                <td className="p-4">
                                    <span className={`text-[10px] px-3 py-1 rounded-full font-mono font-black uppercase tracking-widest ${receipt.verification_status === 'Verified' ? 'bg-green-900/30 text-green-400 border border-green-500/30' :
                                        receipt.verification_status === 'Rejected' ? 'bg-red-900/30 text-red-400 border border-red-500/30' :
                                            'bg-yellow-900/20 text-yellow-500 border border-yellow-500/20'
                                        }`}>
                                        {receipt.verification_status}
                                    </span>
                                </td>

                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-4 items-center">
                                        <button
                                            onClick={() => window.open(`${DOMAIN_ROOT}${receipt.file_path}`, '_blank')}
                                            className="text-white bg-[#222] hover:bg-white hover:text-black p-2 rounded-lg transition-all flex items-center gap-2 text-[10px] uppercase font-bold tracking-tighter"
                                        >
                                            <ExternalLink size={14} /> Full View
                                        </button>

                                        {receipt.verification_status === 'Pending' && (
                                            <div className="flex gap-2 border-l border-[#333] pl-4">
                                                <button
                                                    disabled={receipt.isUpdating}
                                                    onClick={() => updateReceiptStatus(receipt.receipt_id, 'Verified')}
                                                    className="bg-green-600 hover:bg-green-400 text-white p-2 rounded-lg transition-colors disabled:opacity-20"
                                                    title="Verify Payment"
                                                >
                                                    {receipt.isUpdating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                                </button>
                                                <button
                                                    disabled={receipt.isUpdating}
                                                    onClick={() => updateReceiptStatus(receipt.receipt_id, 'Rejected')}
                                                    className="bg-red-600 hover:bg-red-400 text-white p-2 rounded-lg transition-colors disabled:opacity-20"
                                                    title="Reject Payment"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredReceipts.length === 0 && (
                    <div className="p-12 text-center text-gray-500 font-mono text-sm uppercase">
                        No transactions found
                    </div>
                )}
            </div>
        </div>
    );
};