import React, { useState, useEffect } from 'react';
import {
    Users, Search, Mail, Calendar, DollarSign,
    ShoppingBag, Loader2, ArrowUpRight, Shield
} from 'lucide-react';
import { API_BASE_URL, formatCurrency } from '../utils/config.js';

export const AdminUsersView = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/users.php?action=list`);
            const data = await response.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats Calculations
    const totalSpend = users.reduce((sum, user) => sum + (parseInt(user.total_spend) || 0), 0);
    const totalOrders = users.reduce((sum, user) => sum + (parseInt(user.order_count) || 0), 0);

    return (
        <div className="space-y-8 text-current animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter">
                        Client Database <span className="text-primary ml-2 font-mono text-sm not-italic opacity-50">[{users.length}]</span>
                    </h2>
                    <p className="text-[10px] font-mono opacity-60 uppercase tracking-widest mt-1">
                        Registered Accounts & Activity
                    </p>
                </div>

                <div className="relative group w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl h-12 pl-12 pr-4 outline-none focus:border-primary transition-all font-mono text-xs text-current placeholder:opacity-40"
                    />
                </div>
            </header>

            {/* Quick Stats Row (Matches Dashboard StatsBar) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <p className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-1">Total Members</p>
                            <h3 className="text-2xl font-black">{users.length}</h3>
                        </div>
                        <div className="p-2 bg-white/5 rounded-lg text-primary">
                            <Users size={20} />
                        </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 text-current opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                        <Users size={80} />
                    </div>
                </div>

                <div className="bg-card border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <p className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-1">Lifetime Value</p>
                            <h3 className="text-2xl font-black">{formatCurrency(totalSpend)}</h3>
                        </div>
                        <div className="p-2 bg-white/5 rounded-lg text-green-500">
                            <DollarSign size={20} />
                        </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 text-green-500 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                        <DollarSign size={80} />
                    </div>
                </div>

                <div className="bg-card border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <p className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-1">Total Orders</p>
                            <h3 className="text-2xl font-black">{totalOrders}</h3>
                        </div>
                        <div className="p-2 bg-white/5 rounded-lg text-blue-500">
                            <ShoppingBag size={20} />
                        </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 text-blue-500 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                        <ShoppingBag size={80} />
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl overflow-x-auto">
                {loading ? (
                    <div className="p-20 flex justify-center items-center">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-white/5">
                        <thead className="bg-white/5">
                            <tr className="text-left text-[9px] font-black uppercase opacity-60 tracking-widest">
                                <th className="px-6 py-5">User Identity</th>
                                <th className="px-6 py-5">Contact</th>
                                <th className="px-6 py-5">Joined</th>
                                <th className="px-6 py-5 text-right">Orders</th>
                                <th className="px-6 py-5 text-right">Total Spent</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center text-xs font-black">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm leading-none">{user.name}</p>
                                                <p className="text-[10px] font-mono opacity-50 mt-1">ID: #{user.id + 1000}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 opacity-70">
                                            <Mail size={12} />
                                            <span className="text-xs">{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs opacity-60">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={12} />
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold ${user.order_count > 0 ? 'bg-primary/10 text-primary' : 'bg-white/5 opacity-50'
                                            }`}>
                                            {user.order_count} Orders
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-sm font-bold">
                                        {user.total_spend > 0 ? formatCurrency(user.total_spend) : <span className="opacity-20">-</span>}
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center opacity-40 font-mono text-xs uppercase tracking-widest">
                                        No Users Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};