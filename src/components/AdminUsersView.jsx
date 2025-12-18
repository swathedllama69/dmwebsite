import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Search, Loader2, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../utils/config.js';

export const AdminUsersView = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/users.php`);
            const data = await res.json();
            // Assuming the API now returns user data directly via GET
            if (Array.isArray(data)) {
                setUsers(data);
            } else {
                console.error("User API returned non-array data:", data);
                setUsers([]);
            }
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="animate-spin text-[#CCFF00]" size={40} />
            <p className="text-white font-mono mt-4 uppercase text-xs tracking-widest">Retrieving User Directory...</p>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-500 space-y-6">
            <div className="flex justify-between items-end mb-8 border-b border-[#333] pb-4">
                <h2 className="text-4xl font-display uppercase text-white tracking-tighter">Registered Users ({users.length})</h2>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            placeholder="Search users..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-black border border-[#333] p-3 pl-10 rounded-xl text-white font-mono text-xs focus:border-[#CCFF00] outline-none w-64"
                        />
                    </div>
                    <button
                        onClick={fetchUsers}
                        className="flex items-center gap-2 text-[#888] hover:text-white transition-colors text-xs uppercase font-mono"
                    >
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>
            </div>

            <div className="bg-[#111] border border-[#333] rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-black text-[#888] font-mono text-[10px] uppercase tracking-[0.2em]">
                        <tr>
                            <th className="p-6">User Details</th>
                            <th className="p-6">Contact</th>
                            <th className="p-6">Join Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222]">
                        {filtered.map(user => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#CCFF00] text-black flex items-center justify-center font-black">
                                            {user.name ? user.name.charAt(0) : 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white uppercase tracking-tighter">{user.name || 'Anonymous'}</p>
                                            <p className="text-[10px] text-gray-500 font-mono">UID: #{user.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6 font-mono text-sm text-white">{user.email}</td>
                                <td className="p-6 text-gray-400 font-mono text-xs uppercase">{new Date(user.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan="3" className="p-10 text-center text-gray-500 font-mono text-sm">No users found matching "{search}"</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};