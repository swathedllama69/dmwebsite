import React, { useState, useEffect } from 'react';
import {
    Search, Filter, CheckCircle, XCircle,
    Eye, Loader2, Calendar, CreditCard, User, X, FileText, Download
} from 'lucide-react';
import { API_BASE_URL } from '../utils/config.js';

export const AdminReceiptsView = ({ setNotification }) => {
    const [receipts, setReceipts] = useState([]);
    const [filteredReceipts, setFilteredReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedImage, setSelectedImage] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    const fetchReceipts = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/receipts.php?action=list`);
            const data = await response.json();
            const safeData = Array.isArray(data) ? data : [];
            setReceipts(safeData);
            setFilteredReceipts(safeData);
        } catch (error) {
            console.error("Error fetching receipts:", error);
            setNotification?.({ message: "Failed to load payment records", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReceipts();
    }, []);

    useEffect(() => {
        let result = receipts;
        if (statusFilter !== 'All') {
            result = result.filter(r => r.verification_status === statusFilter);
        }
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(r =>
                (r.user_name || '').toLowerCase().includes(lowerTerm) ||
                (r.order_id || '').toString().includes(lowerTerm)
            );
        }
        setFilteredReceipts(result);
    }, [searchTerm, statusFilter, receipts]);

    const handleVerification = async (id, status, orderId) => {
        if (!window.confirm(`Are you sure you want to ${status.toUpperCase()} this payment?`)) return;

        setProcessingId(id);
        try {
            const response = await fetch(`${API_BASE_URL}/receipts.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, verification_status: status, order_id: orderId })
            });

            const result = await response.json();
            if (result.success) {
                setNotification?.({ message: `Payment ${status}`, type: 'success' });
                fetchReceipts();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            setNotification?.({ message: error.message || "Update failed", type: 'error' });
        } finally {
            setProcessingId(null);
        }
    };

    // --- Dynamic Styles ---
    const cardClass = "bg-card border border-current/10 shadow-xl";
    const inputClass = "w-full bg-current/5 border border-current/10 rounded-xl h-12 pl-12 pr-4 outline-none focus:border-primary transition-all font-mono text-xs text-current placeholder:text-current/40";

    return (
        <div className="space-y-8 text-current animate-in fade-in duration-500">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-end">
                <div>
                    <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter">
                        Payment Terminal
                    </h2>
                    <p className="text-[10px] font-mono opacity-60 uppercase tracking-widest mt-1 flex items-center gap-2">
                        <FileText size={12} /> Verify Transfer Receipts
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative group flex-1 md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" size={16} />
                        <input
                            type="text"
                            placeholder="Search user or Order ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" size={16} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-card border border-current/10 rounded-xl h-12 pl-12 pr-8 outline-none focus:border-primary appearance-none cursor-pointer font-mono text-xs text-current font-bold uppercase tracking-wider"
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Verified">Verified</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Dynamic Table */}
            <div className={`${cardClass} rounded-2xl overflow-hidden overflow-x-auto`}>
                {loading ? (
                    <div className="p-20 flex justify-center items-center">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-current/5">
                        <thead className="bg-current/5">
                            <tr className="text-left text-[9px] font-black uppercase opacity-60 tracking-widest">
                                <th className="px-6 py-5">Date</th>
                                <th className="px-6 py-5">Customer</th>
                                <th className="px-6 py-5">Order Ref</th>
                                <th className="px-6 py-5">Proof</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-current/5">
                            {filteredReceipts.map((receipt) => (
                                <tr key={receipt.id} className="hover:bg-current/[0.02] transition-colors group">
                                    <td className="px-6 py-4 font-mono text-xs opacity-70">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={12} className="opacity-50" />
                                            {new Date(receipt.uploaded_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-current/5 flex items-center justify-center border border-current/10">
                                                <User size={14} className="opacity-50" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-xs uppercase">{receipt.user_name || "Guest User"}</span>
                                                <span className="text-[9px] font-mono opacity-50">{receipt.user_email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs">
                                        <span className="bg-primary/10 text-primary px-2 py-1 rounded font-bold">#{receipt.order_id}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedImage(receipt.file_path)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-current/5 hover:bg-current/10 border border-current/10 rounded-lg transition-all group/btn"
                                        >
                                            <Eye size={12} className="opacity-50 group-hover/btn:opacity-100 group-hover/btn:text-primary transition-opacity" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">View</span>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${receipt.verification_status === 'Verified'
                                            ? 'bg-green-500/10 border-green-500/20 text-green-500'
                                            : receipt.verification_status === 'Rejected'
                                                ? 'bg-red-500/10 border-red-500/20 text-red-500'
                                                : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${receipt.verification_status === 'Verified' ? 'bg-green-500' :
                                                receipt.verification_status === 'Rejected' ? 'bg-red-500' : 'bg-yellow-500'
                                                }`} />
                                            {receipt.verification_status}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {receipt.verification_status === 'Pending' && (
                                            <div className="flex justify-end gap-2 opacity-80 hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleVerification(receipt.id, 'Verified', receipt.order_id)}
                                                    disabled={processingId === receipt.id}
                                                    className="p-2 hover:bg-green-500/20 rounded-lg text-green-500 transition-colors disabled:opacity-50 border border-transparent hover:border-green-500/30"
                                                    title="Verify Payment"
                                                >
                                                    {processingId === receipt.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                                </button>
                                                <button
                                                    onClick={() => handleVerification(receipt.id, 'Rejected', receipt.order_id)}
                                                    disabled={processingId === receipt.id}
                                                    className="p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors disabled:opacity-50 border border-transparent hover:border-red-500/30"
                                                    title="Reject Payment"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredReceipts.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center opacity-40 font-mono text-xs uppercase tracking-widest">
                                        No Receipts Logged
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Image Modal (Fixed Overlay) */}
            {selectedImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="relative max-w-3xl w-full bg-card border border-current/10 rounded-3xl p-2 shadow-2xl overflow-hidden">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-md hover:bg-red-600 transition-colors z-10"
                        >
                            <X size={20} />
                        </button>

                        {/* If URL starts with http/https use it, otherwise assume local relative path */}
                        <img
                            src={selectedImage.startsWith('http') ? selectedImage : `${API_BASE_URL}/../${selectedImage}`}
                            alt="Receipt Proof"
                            className="w-full h-auto max-h-[80vh] object-contain rounded-2xl bg-black/50"
                        />

                        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
                            <div className="bg-black/80 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10">
                                <p className="text-white text-[10px] font-mono uppercase tracking-widest font-bold">Evidence: {selectedImage.split('/').pop()}</p>
                            </div>
                            <a
                                href={selectedImage.startsWith('http') ? selectedImage : `${API_BASE_URL}/../${selectedImage}`}
                                download
                                className="pointer-events-auto bg-primary text-black px-4 py-2 rounded-xl text-xs font-black uppercase hover:scale-105 transition-transform flex items-center gap-2"
                            >
                                <Download size={14} /> Download
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};