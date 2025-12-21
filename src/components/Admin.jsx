import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { THEMES } from '../utils/themeEngine';
import {
    Package, Plus, Trash2, Edit, LogOut, LayoutDashboard,
    ShoppingBag, Settings, Search, ChevronUp, ChevronDown, RefreshCw,
    Loader2, AlertCircle, X, Star, DollarSign, Image as ImageIcon, Receipt, User as UserIcon,
    Globe, ShieldCheck, Type, Monitor, Palette, RotateCcw, Layers, Banknote, PoundSterling,
    Save, ChevronLeft, ChevronRight
} from 'lucide-react';

import { API_BASE_URL, formatCurrency } from '../utils/config.js';
import { AdminOrdersList } from './AdminOrdersList.jsx';
import { AdminReceiptsView } from './AdminReceiptsView.jsx';
import { AdminUsersView } from './AdminUsersView.jsx';

// --- Internal Reusable Pagination Component ---
const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-white/[0.02]">
            <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest">
                Showing {Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(totalItems, currentPage * itemsPerPage)} of {totalItems}
            </p>
            <div className="flex gap-2">
                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-20 hover:bg-white/10 transition-all"
                >
                    <ChevronLeft size={16} />
                </button>
                <div className="flex items-center px-4 font-mono text-xs font-bold">
                    {currentPage} / {totalPages}
                </div>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-20 hover:bg-white/10 transition-all"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

// --- Reusable Stats Bar ---
const StatsBar = ({ orders, users, receipts, products, currentCurrency }) => {
    // Turnover: Total of all sales (non-cancelled)
    const turnover = orders
        .filter(o => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + parseInt(o.total_cents || 0), 0);

    // FIX: Pending Payment now counts Orders that are Pending (as requested), 
    // instead of just uploaded receipts.
    const pendingPayments = orders.filter(o => o.status === 'Pending').length;
    const totalProducts = products.length;

    const stats = [
        { label: 'Turnover', value: formatCurrency(turnover, currentCurrency), icon: <DollarSign className="text-green-500" /> },
        { label: 'Total Products', value: totalProducts, icon: <Package className="text-blue-500" /> },
        { label: 'Pending Payments', value: pendingPayments, icon: <Receipt className="text-yellow-500" /> },
        { label: 'Total Orders', value: orders.length, icon: <ShoppingBag className="text-primary" /> },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
                <div key={i} className="bg-card border border-white/10 p-6 rounded-2xl hover:border-primary/50 transition-all group relative overflow-hidden text-current shadow-sm">
                    <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity text-current">
                        {React.cloneElement(stat.icon, { size: 80 })}
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5 w-fit mb-4 text-current">{stat.icon}</div>
                    <p className="text-[10px] uppercase font-mono opacity-60 tracking-widest">{stat.label}</p>
                    <h4 className="text-2xl font-black">{stat.value}</h4>
                </div>
            ))}
        </div>
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, productName, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
            <div className="bg-card p-8 rounded-lg shadow-2xl border border-red-700 max-w-sm w-full relative text-current">
                <button onClick={onClose} className="absolute top-3 right-3 opacity-50 hover:opacity-100 transition-colors">
                    <X size={20} />
                </button>
                <AlertCircle className="text-red-500 mx-auto mb-4" size={32} />
                <h3 className="font-display text-2xl uppercase mb-4 text-center">Confirm Deletion</h3>
                <p className="font-mono text-sm opacity-60 text-center mb-6">
                    Are you sure you want to permanently delete: <span className="font-bold block mt-1">{productName}</span>?
                </p>
                <div className="flex justify-center gap-4">
                    <button onClick={onClose} disabled={loading} className="font-mono text-sm px-4 py-2 rounded opacity-60 hover:opacity-100 transition-colors disabled:opacity-30">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700 transition-colors uppercase tracking-wide font-mono ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (<><Loader2 className="animate-spin text-white" size={18} /> Deleting...</>) : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Dashboard Content ---
const DashboardPanel = ({ products, orders, users, receipts, currentCurrency, navigate, setNotification, onRefresh, isRefreshing }) => {
    const [subTab, setSubTab] = useState('pending');

    const filteredOrders = useMemo(() => {
        if (subTab === 'completed') {
            return orders.filter(o => o.status === 'Completed' || o.status === 'Shipped');
        }
        // Pending status includes 'Pending' or 'Processing' per instructions
        return orders.filter(o => o.status === 'Pending' || o.status === 'Processing');
    }, [orders, subTab]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="font-display text-3xl uppercase text-current mb-2">Store Analytics</h2>
                    <p className="font-mono text-sm opacity-60">Real-time overview of your store's performance.</p>
                </div>
                <button onClick={onRefresh} disabled={isRefreshing} className="flex items-center gap-2 font-mono text-[10px] font-black uppercase opacity-60 hover:opacity-100 transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                    <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-primary' : ''} /> Refresh_Data
                </button>
            </header>

            <StatsBar
                orders={orders}
                users={users}
                receipts={receipts}
                products={products}
                currentCurrency={currentCurrency}
            />

            <div className="space-y-6">
                <div className="flex gap-8 border-b border-white/10">
                    <button
                        onClick={() => setSubTab('pending')}
                        className={`pb-4 font-black text-[10px] uppercase tracking-[0.2em] transition-all relative ${subTab === 'pending' ? 'text-primary' : 'opacity-40 hover:opacity-100'}`}
                    >
                        Pending Orders ({orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length})
                        {subTab === 'pending' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_var(--accent-color)]" />}
                    </button>
                    <button
                        onClick={() => setSubTab('completed')}
                        className={`pb-4 font-black text-[10px] uppercase tracking-[0.2em] transition-all relative ${subTab === 'completed' ? 'text-primary' : 'opacity-40 hover:opacity-100'}`}
                    >
                        Completed Orders ({orders.filter(o => o.status === 'Completed' || o.status === 'Shipped').length})
                        {subTab === 'completed' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_var(--accent-color)]" />}
                    </button>
                </div>

                <AdminOrdersList
                    ordersOverride={filteredOrders}
                    currentCurrency={currentCurrency}
                    setNotification={setNotification}
                    navigateToOrderDetail={(id) => navigate(`/admin/order/${id}`)}
                    paginated={true}
                    onRefresh={onRefresh}
                />
            </div>
        </div>
    );
};

// --- USER REVIEWS MANAGEMENT PANEL ---
const AdminReviewsPanel = ({ setNotification }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchAllReviews = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/reviews.php?action=list_all`);
            const data = await response.json();
            setReviews(Array.isArray(data) ? data : []);
        } catch (e) {
            setNotification({ message: "REVIEW_SYNC_FAILED", type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [setNotification]);

    useEffect(() => { fetchAllReviews(); }, [fetchAllReviews]);

    const paginatedReviews = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return reviews.slice(start, start + itemsPerPage);
    }, [reviews, currentPage]);

    const deleteReview = async (id) => {
        if (!window.confirm("PERMANENTLY DELETE THIS USER REVIEW?")) return;
        try {
            const response = await fetch(`${API_BASE_URL}/reviews.php?id=${id}`, { method: 'DELETE' });
            if (response.ok) {
                setNotification({ message: "REVIEW_REMOVED", type: 'success' });
                fetchAllReviews();
            }
        } catch (e) {
            setNotification({ message: "DELETE_FAILED", type: 'error' });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 text-current">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="font-display text-3xl uppercase italic tracking-tighter">
                        User_Review_Repository <span className="text-primary ml-2 font-mono text-sm not-italic opacity-50">[{reviews.length}]</span>
                    </h2>
                    <p className="text-[10px] font-mono opacity-60 uppercase tracking-widest mt-1">Manage customer feedback and ratings</p>
                </div>
                <button onClick={fetchAllReviews} className="flex items-center gap-2 font-mono text-[10px] font-black uppercase opacity-60 hover:opacity-100 transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                    <RefreshCw size={12} className={loading ? 'animate-spin text-primary' : ''} /> Refresh_Data
                </button>
            </header>

            <div className="bg-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl overflow-x-auto">
                <table className="min-w-full divide-y divide-white/5">
                    <thead className="bg-white/5">
                        <tr className="text-left text-[9px] font-black uppercase opacity-60 tracking-widest">
                            <th className="px-6 py-5">#</th>
                            <th className="px-6 py-5">Product_ID</th>
                            <th className="px-6 py-5">Customer</th>
                            <th className="px-6 py-5">Rating</th>
                            <th className="px-6 py-5">Feedback</th>
                            <th className="px-6 py-5">Submitted_At</th>
                            <th className="px-6 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {paginatedReviews.map((r, index) => (
                            <tr key={r.id} className="hover:bg-white/[0.02] transition-colors text-[11px] font-mono">
                                <td className="px-6 py-4 opacity-40">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                <td className="px-6 py-4 text-primary font-black">UNIT_{r.product_id}</td>
                                <td className="px-6 py-4 font-bold">{r.user_name}</td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={10} className={i < r.rating ? "text-primary fill-primary" : "opacity-20"} strokeWidth={0} />
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 opacity-70 max-w-sm">
                                    <span className="line-clamp-2 italic">"{r.comment}"</span>
                                </td>
                                <td className="px-6 py-4 opacity-50">{r.created_at}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => deleteReview(r.id)} className="text-red-500/50 hover:text-red-500 p-2 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {reviews.length === 0 && !loading && (
                    <div className="p-20 text-center opacity-40 font-mono uppercase text-[10px] tracking-[0.3em]">
                        Database_Empty: No_User_Reviews_Found
                    </div>
                )}
                <Pagination
                    currentPage={currentPage}
                    totalItems={reviews.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
};

// --- SETTINGS PANEL ---
const SettingsPanel = ({ settings, fetchSettings, setNotification }) => {
    const [formData, setFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const hasInitialized = useRef(false);

    useEffect(() => {
        const hasRealData = settings && Object.keys(settings).length > 3;
        if (hasRealData && !hasInitialized.current) {
            setFormData({
                ...settings,
                active_theme: settings.active_theme || 'devolt-punk',
                active_font_style: settings.active_font_style || 'style-a',
                heroSlogan: settings.heroSlogan || '',
                heroSubHeadline: settings.heroSubHeadline || '',
                heroVideoUrl: settings.heroVideoUrl || '',
                heroOverlayOpacity: settings.heroOverlayOpacity || '50',
                scrollingText: settings.scrollingText || '',
                featuredSectionTitle: settings.featuredSectionTitle || 'FEATURED DRIPS',
                featuredSectionSub: settings.featuredSectionSub || 'Top rated items',
                newArrivalsTitle: settings.newArrivalsTitle || 'LATEST DROPS',
                newArrivalsSub: settings.newArrivalsSub || 'Fresh from the lab',
                showNewArrivals: settings.showNewArrivals === '1' || settings.showNewArrivals === true,
                gallerySectionTitle: settings.gallerySectionTitle || 'INNOVATION GALLERY',
                gallerySectionSub: settings.gallerySectionSub || 'See what\'s new',
                galleryImages: settings.galleryImages || '',
                galleryLinks: settings.galleryLinks || '',
                showImageGallery: settings.showImageGallery === '1' || settings.showImageGallery === true,
                saleSectionTitle: settings.saleSectionTitle || 'THE VAULT',
                saleSectionSub: settings.saleSectionSub || 'Limited time offers',
                showSaleItems: settings.showSaleItems === '1' || settings.showSaleItems === true,
                processSectionTitle: settings.processSectionTitle || 'THE MOULDING PROCESS',
                processSubTitle: settings.processSubTitle || 'Behind the scenes engineering',
                bottomBannerImages: settings.bottomBannerImages || '',
                homeSlideshowImages: settings.homeSlideshowImages || '',
                rateUSD: settings.rateUSD || '1600',
                rateGBP: settings.rateGBP || '1850',
                bankName: settings.bankName || '',
                accountName: settings.accountName || '',
                accountNumber: settings.accountNumber || ''
            });
            hasInitialized.current = true;
        }
    }, [settings]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'active_theme') {
            document.documentElement.setAttribute('data-theme', value);
            if (THEMES[value]) document.body.style.backgroundColor = THEMES[value].bg;
        }
        if (name === 'active_font_style') document.documentElement.setAttribute('data-font', value);
    };

    const handleToggle = (key) => setFormData(prev => ({ ...prev, [key]: !prev[key] }));

    const handlePushUpdates = async () => {
        setIsSaving(true);
        const payload = { ...formData };
        ['showNewArrivals', 'showSaleItems', 'showImageGallery'].forEach(key => {
            payload[key] = payload[key] ? '1' : '0';
        });
        try {
            const response = await fetch(`${API_BASE_URL}/settings.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.error || "Update failed");
            setNotification({ message: "SYSTEM CONFIG DEPLOYED", type: 'success' });
            fetchSettings();
        } catch (err) {
            setNotification({ message: "DEPLOYMENT ERROR: " + err.message, type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleGlobalReset = async () => {
        if (window.confirm("CRITICAL: Reset all visual settings to factory defaults?")) {
            setIsSaving(true);
            try {
                await fetch(`${API_BASE_URL}/settings.php`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ active_theme: 'devolt-punk', active_font_style: 'style-a' })
                });
                window.location.reload();
            } catch (err) {
                setNotification({ message: "RESET FAILED", type: 'error' });
                setIsSaving(false);
            }
        }
    };

    const cardBaseClass = "rounded-2xl p-6 shadow-lg border border-white/10 transition-all duration-300 relative overflow-hidden";
    const headingClass = "text-xs font-black text-primary mb-6 flex items-center gap-2 uppercase tracking-[0.2em]";
    const labelClass = "block text-[10px] font-bold opacity-60 uppercase tracking-widest mb-2 ml-1";
    const inputClass = "w-full bg-black/10 border-2 border-transparent focus:border-primary/50 hover:border-white/10 rounded-xl p-3 text-current outline-none transition-all font-mono text-sm placeholder:opacity-30";

    const enforceThemeStyle = { backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' };

    return (
        <div className="max-w-7xl mx-auto pb-40 px-4 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10 sticky top-24 z-30 py-4 backdrop-blur-md rounded-2xl bg-background/80 border border-white/5 px-6">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic">System.Config</h2>
                    <p className="text-primary font-mono text-[10px] mt-1 uppercase tracking-widest opacity-80">
                        {formData.active_theme?.replace('-', ' ')} // {formData.active_font_style}
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    <button onClick={handleGlobalReset} className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-500 rounded-xl text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">
                        <RotateCcw size={12} /> Reset Defaults
                    </button>
                    <div className="flex items-center gap-6 bg-white/5 p-2 px-6 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-black/20 rounded-full text-green-500"><DollarSign size={18} /></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] opacity-60 font-black uppercase tracking-widest">USD Rate</span>
                                <input name="rateUSD" className="bg-transparent text-primary font-mono text-lg font-bold w-20 outline-none border-b border-white/20 focus:border-primary placeholder:text-white/20" value={formData.rateUSD || ''} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="w-[1px] h-8 bg-white/10" />
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-black/20 rounded-full text-blue-400"><PoundSterling size={18} /></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] opacity-60 font-black uppercase tracking-widest">GBP Rate</span>
                                <input name="rateGBP" className="bg-transparent text-primary font-mono text-lg font-bold w-20 outline-none border-b border-white/20 focus:border-primary placeholder:text-white/20" value={formData.rateGBP || ''} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual Identity Column */}
                <div className="space-y-6">
                    <div className={cardBaseClass} style={enforceThemeStyle}>
                        <h3 className={headingClass}><Palette size={14} /> Interface Skin</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {Object.entries(THEMES).map(([key, theme]) => {
                                const isActive = formData.active_theme === key;
                                return (
                                    <button key={key} onClick={() => handleChange({ target: { name: 'active_theme', value: key } })} className={`relative w-full text-left p-1 rounded-xl transition-all border-2 ${isActive ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-white/5 hover:border-white/10'}`}>
                                        <div className="flex items-center justify-between px-3 py-3">
                                            <span className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-primary' : 'text-current'}`}>{key.replace('-', ' ')}</span>
                                            {isActive && <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_var(--accent-color)]" />}
                                        </div>
                                        <div className="h-3 w-full flex rounded-b-lg overflow-hidden mt-1 opacity-80">
                                            <div style={{ background: theme.bg }} className="flex-1" />
                                            <div style={{ background: theme.card }} className="flex-1" />
                                            <div style={{ background: theme.headerBg }} className="flex-1" />
                                            <div style={{ background: theme.accent }} className="flex-1" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className={cardBaseClass} style={enforceThemeStyle}>
                        <h3 className={headingClass}><Type size={14} /> Typography</h3>
                        <div className="space-y-2">
                            {[{ id: 'style-a', l: 'Industrial Mono', d: 'Space Grotesk + JetBrains' }, { id: 'style-b', l: 'Modern Sans', d: 'Archivo + Plus Jakarta' }, { id: 'style-c', l: 'Luxury Serif', d: 'Cinzel + Inter' }].map(f => (
                                <button key={f.id} onClick={() => handleChange({ target: { name: 'active_font_style', value: f.id } })} className={`w-full p-4 text-left rounded-xl border transition-all ${formData.active_font_style === f.id ? 'bg-primary/10 border-primary text-primary' : 'bg-transparent border-white/5 hover:bg-white/5'}`}>
                                    <div className="text-[10px] font-black uppercase tracking-widest">{f.l}</div>
                                    <div className="text-[9px] opacity-50 font-mono mt-1">{f.d}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Hero & Media Column */}
                <div className="space-y-6">
                    <div className={cardBaseClass} style={enforceThemeStyle}>
                        <h3 className={headingClass}><Monitor size={14} /> Hero Configuration</h3>
                        <div className="space-y-5">
                            <div><label className={labelClass}>Scrolling Marquee</label><input name="scrollingText" className={inputClass} value={formData.scrollingText || ''} onChange={handleChange} /></div>
                            <div><label className={labelClass}>Main Headline</label><input name="heroSlogan" className={inputClass} value={formData.heroSlogan || ''} onChange={handleChange} /></div>
                            <div><label className={labelClass}>Sub-Headline</label><textarea name="heroSubHeadline" className={`${inputClass} h-24 resize-none`} value={formData.heroSubHeadline || ''} onChange={handleChange} /></div>
                        </div>
                    </div>
                    <div className={cardBaseClass} style={enforceThemeStyle}>
                        <h3 className={headingClass}><Layers size={14} /> Assets & Media</h3>
                        <div className="space-y-4">
                            <div>
                                <label className={labelClass}>Process Section</label>
                                <div className="grid gap-2 mb-2">
                                    <input name="processSectionTitle" placeholder="Title" className={inputClass} value={formData.processSectionTitle || ''} onChange={handleChange} />
                                    <input name="processSubTitle" placeholder="Subtitle" className={`${inputClass} opacity-80 text-xs`} value={formData.processSubTitle || ''} onChange={handleChange} />
                                </div>
                                <label className={labelClass}>Process Images (CSV)</label>
                                <textarea name="bottomBannerImages" className={`${inputClass} h-32`} value={formData.bottomBannerImages || ''} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Store Settings Column */}
                <div className="space-y-6">
                    <div className={cardBaseClass} style={enforceThemeStyle}>
                        <h3 className={headingClass}><Star size={14} /> Store Sections</h3>
                        <div className="space-y-4">
                            <input name="featuredSectionTitle" placeholder="Featured Title" className={inputClass} value={formData.featuredSectionTitle || ''} onChange={handleChange} />
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-[10px] font-bold uppercase tracking-wide">Show New Arrivals?</label>
                                    <button onClick={() => handleToggle('showNewArrivals')} className={`w-10 h-5 rounded-full relative transition-all ${formData.showNewArrivals ? 'bg-primary' : 'bg-gray-700'}`}>
                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${formData.showNewArrivals ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>
                                <input name="newArrivalsTitle" placeholder="Section Title..." className={inputClass} value={formData.newArrivalsTitle || ''} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                    <div className={cardBaseClass} style={enforceThemeStyle}>
                        <h3 className={headingClass}><Banknote size={14} /> Settlement Details</h3>
                        <div className="space-y-4">
                            <div><label className={labelClass}>Bank Name</label><input name="bankName" className={inputClass} value={formData.bankName || ''} onChange={handleChange} /></div>
                            <div><label className={labelClass}>Account Number</label><input name="accountNumber" className={`text-xl font-bold tracking-widest text-primary ${inputClass}`} value={formData.accountNumber || ''} onChange={handleChange} /></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
                <button onClick={handlePushUpdates} disabled={isSaving} className="flex items-center gap-3 bg-primary text-black px-12 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:scale-105 transition-all">
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />} Deploy Configuration
                </button>
            </div>
        </div>
    );
};

// --- Main AdminDashboard Component ---
export const AdminDashboard = ({
    products, loading, error, fetchProducts, settings, fetchSettings,
    isAdminLoggedIn, setIsAdminLoggedIn, setNotification
}) => {
    const navigate = useNavigate();

    // FIX: Persist Active Tab to LocalStorage (Solves the Back Button Issue)
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem('admin_active_tab') || 'dashboard';
    });

    useEffect(() => {
        localStorage.setItem('admin_active_tab', activeTab);
    }, [activeTab]);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'descending' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Pagination for Products
    const [prodPage, setProdPage] = useState(1);
    const itemsPerPage = 10;

    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [receipts, setReceipts] = useState([]);

    const currentCurrency = 'NGN';

    const handleLogout = () => {
        setIsAdminLoggedIn(false);
        setNotification({ message: "ARCHITECT SESSION TERMINATED", type: 'default' });
    };

    const confirmDeleteProduct = async () => {
        if (!productToDelete) return;
        setIsDeleteLoading(true);
        try {
            const deleteUrl = `${API_BASE_URL}/products.php?id=${productToDelete.id}`.replace(/([^:]\/)\/+/g, "$1");
            const response = await fetch(deleteUrl, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
            if (!response.ok) throw new Error("ERASURE FAILED");
            setNotification({ message: "PRODUCT ERASED FROM MOULD", type: 'success' });
            fetchProducts();
        } catch (error) { setNotification({ message: error.message, type: 'error' }); }
        finally { setIsModalOpen(false); setIsDeleteLoading(false); setProductToDelete(null); }
    };

    const fetchOrders = useCallback(async () => {
        if (!isAdminLoggedIn) return;
        try {
            const baseUrl = `${API_BASE_URL}/orders.php`.replace(/([^:]\/)\/+/g, "$1");
            const response = await fetch(`${baseUrl}?action=list`);
            const data = await response.json();
            setOrders(Array.isArray(data) ? data : (data.orders || []));
        } catch (e) { console.error(e); }
    }, [isAdminLoggedIn]);

    const fetchUsers = useCallback(async () => {
        if (!isAdminLoggedIn) return;
        try {
            const baseUrl = `${API_BASE_URL}/users.php`.replace(/([^:]\/)\/+/g, "$1");
            const res = await fetch(`${baseUrl}?action=list`);
            const data = await res.json();
            if (Array.isArray(data)) setUsers(data);
        } catch (e) { console.error(e); }
    }, [isAdminLoggedIn]);

    const fetchReceipts = useCallback(async () => {
        if (!isAdminLoggedIn) return;
        try {
            const baseUrl = `${API_BASE_URL}/receipts.php`.replace(/([^:]\/)\/+/g, "$1");
            const res = await fetch(`${baseUrl}?action=list`);
            const data = await res.json();
            if (Array.isArray(data)) setReceipts(data);
        } catch (e) { console.error(e); }
    }, [isAdminLoggedIn]);

    // NEW: Global Refresh Function
    const handleSystemRefresh = async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([
                fetchOrders(),
                fetchUsers(),
                fetchReceipts(),
                fetchProducts()
            ]);
            setNotification({ message: "SYSTEM DATA SYNCED", type: 'success' });
        } catch (e) {
            setNotification({ message: "SYNC FAILED", type: 'error' });
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        if (isAdminLoggedIn) { fetchOrders(); fetchUsers(); fetchReceipts(); }
    }, [isAdminLoggedIn, fetchOrders, fetchUsers, fetchReceipts]);

    const filteredAndSortedProducts = useMemo(() => {
        let items = [...products];
        if (searchTerm) items = items.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || String(p.id).includes(searchTerm));
        if (sortConfig.key) {
            items.sort((a, b) => {
                const aV = typeof a[sortConfig.key] === 'string' ? a[sortConfig.key].toLowerCase() : a[sortConfig.key];
                const bV = typeof b[sortConfig.key] === 'string' ? b[sortConfig.key].toLowerCase() : b[sortConfig.key];
                if (aV < bV) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aV > bV) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [products, searchTerm, sortConfig]);

    const paginatedProducts = useMemo(() => {
        const start = (prodPage - 1) * itemsPerPage;
        return filteredAndSortedProducts.slice(start, start + itemsPerPage);
    }, [filteredAndSortedProducts, prodPage]);

    const requestSort = (key) => setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === 'ascending' ? 'descending' : 'ascending' });
    const getSortIndicator = (key) => sortConfig.key === key ? (sortConfig.direction === 'ascending' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : null;

    return (
        <div className="max-w-[1600px] mx-auto pt-24 pb-12 px-4 md:px-8 min-h-screen bg-background text-current transition-colors duration-500">
            <header className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-white/10 pb-8 gap-6 relative overflow-hidden">
                <div className="flex flex-col group relative z-10">
                    <h1 className="font-display text-4xl font-black uppercase tracking-tighter italic group-hover:text-primary transition-colors">
                        <span className="text-primary mr-1">/</span>DEVOLT<span className="text-primary">.</span>ADMIN
                    </h1>
                    <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full w-fit">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--accent-color)]"></div>
                        <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">System_Architect_Node_01</span>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={handleSystemRefresh} className="group flex items-center gap-2 px-5 py-2 border border-white/10 rounded-xl hover:bg-white/5 transition-all">
                        <RefreshCw size={14} className={`text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-80 group-hover:opacity-100">Refresh System</span>
                    </button>
                    <button onClick={handleLogout} className="group flex items-center gap-2 px-5 py-2 border border-red-900/50 rounded-xl hover:bg-red-900/20 transition-all">
                        <LogOut size={14} className="text-red-500" />
                        <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Terminate</span>
                    </button>
                </div>
            </header>

            <nav className="mb-8 overflow-x-auto">
                <ul className="flex space-x-4 border-b border-white/10 whitespace-nowrap">
                    {[
                        { k: 'dashboard', n: 'Dashboard', i: LayoutDashboard },
                        { k: 'products', n: 'Products', i: Package },
                        { k: 'orders', n: 'Orders', i: ShoppingBag },
                        { k: 'reviews', n: 'User Reviews', i: Star },
                        { k: 'receipts', n: 'Payments', i: Receipt },
                        { k: 'settings', n: 'Settings', i: Settings },
                        { k: 'users', n: 'Users', i: UserIcon }
                    ].map(tab => (
                        <li key={tab.k}>
                            <button onClick={() => setActiveTab(tab.k)} className={`flex items-center gap-2 px-6 py-4 font-black text-[10px] uppercase tracking-[0.2em] transition-all relative ${activeTab === tab.k ? 'text-primary' : 'opacity-50 hover:opacity-100'}`}>
                                <tab.i size={14} /> {tab.n}
                                {activeTab === tab.k && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_var(--accent-color)]" />}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <main>
                {activeTab === 'dashboard' && <DashboardPanel products={products} orders={orders} users={users} receipts={receipts} currentCurrency={currentCurrency} navigate={navigate} setNotification={setNotification} onRefresh={handleSystemRefresh} isRefreshing={isRefreshing} />}
                {activeTab === 'products' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <header className="flex justify-between items-center">
                            <h2 className="font-display text-3xl uppercase italic tracking-tighter">Product Catalog <span className="text-primary ml-2 font-mono text-sm opacity-50">[{products.length}]</span></h2>
                            <div className="flex gap-4">
                                <button onClick={handleSystemRefresh} className="flex items-center gap-2 font-mono text-[10px] font-black uppercase opacity-60 hover:opacity-100 transition-colors bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                                    <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                                </button>
                                <button onClick={() => navigate('/add-product')} className="bg-primary text-black px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-3"><Plus size={18} /> New Entry</button>
                            </div>
                        </header>
                        <div className="relative max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" size={18} />
                            <input type="text" placeholder="Filter inventory..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setProdPage(1); }} className="w-full bg-white/5 border border-white/10 rounded-xl h-12 pl-12 pr-4 outline-none focus:border-primary transition-all font-mono text-sm text-current" />
                        </div>
                        <div className="bg-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl overflow-x-auto">
                            <table className="min-w-full divide-y divide-white/5">
                                <thead className="bg-white/5">
                                    <tr className="text-left text-[9px] font-black uppercase opacity-60 tracking-widest">
                                        <th className="px-6 py-4">#</th>
                                        <th className="px-6 py-4">Visual</th>
                                        {['id', 'name', 'category', 'price', 'stock'].map(k => (
                                            <th key={k} className="px-6 py-4 cursor-pointer hover:text-primary transition-colors" onClick={() => requestSort(k)}>
                                                <div className="flex items-center gap-1">{k} {getSortIndicator(k)}</div>
                                            </th>
                                        ))}
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {paginatedProducts.map((p, idx) => (
                                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4 opacity-40 font-mono text-[10px]">{(prodPage - 1) * itemsPerPage + idx + 1}</td>
                                            <td className="px-6 py-4"><div className="w-10 h-10 bg-background rounded border border-white/10 overflow-hidden">{p.images?.[0] ? <img src={p.images[0]} alt="" className="object-cover w-full h-full" /> : <ImageIcon size={18} className="m-2.5 opacity-50" />}</div></td>
                                            <td className="px-6 py-4 font-mono text-xs opacity-60">{p.id}</td>
                                            <td className="px-6 py-4 font-black uppercase text-[11px] tracking-wider">{p.name}</td>
                                            <td className="px-6 py-4 text-[10px] opacity-60 uppercase">{p.category}</td>
                                            <td className="px-6 py-4 font-mono text-xs">{formatCurrency(p.price, currentCurrency)}</td>
                                            <td className="px-6 py-4 font-mono text-xs"><span className={p.stock <= 5 ? 'text-red-500 font-bold' : ''}>{p.stock}</span></td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => navigate(`/edit-product/${p.id}`)} className="text-current hover:text-primary"><Edit size={16} /></button>
                                                    <button onClick={() => { setProductToDelete(p); setIsModalOpen(true); }} className="text-current hover:text-red-500"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Pagination currentPage={prodPage} totalItems={filteredAndSortedProducts.length} itemsPerPage={itemsPerPage} onPageChange={setProdPage} />
                        </div>
                    </div>
                )}
                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        <header className="flex justify-end">
                            <button onClick={handleSystemRefresh} className="flex items-center gap-2 font-mono text-[10px] font-black uppercase opacity-60 hover:opacity-100 transition-colors bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} /> Reload Orders
                            </button>
                        </header>
                        <AdminOrdersList currentCurrency={currentCurrency} setNotification={setNotification} navigateToOrderDetail={(id) => navigate(`/admin/order/${id}`)} paginated={true} />
                    </div>
                )}

                {/* FIX: Passed 'receipts' data and 'refreshData' specifically to ensure customer name/date display correctly */}
                {activeTab === 'receipts' && (
                    <div className="space-y-6">
                        <header className="flex justify-end">
                            <button onClick={handleSystemRefresh} className="flex items-center gap-2 font-mono text-[10px] font-black uppercase opacity-60 hover:opacity-100 transition-colors bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} /> Reload Payments
                            </button>
                        </header>
                        <AdminReceiptsView
                            receipts={receipts}
                            currentCurrency={currentCurrency}
                            setNotification={setNotification}
                            refreshData={fetchReceipts}
                        />
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <header className="flex justify-end">
                            <button onClick={handleSystemRefresh} className="flex items-center gap-2 font-mono text-[10px] font-black uppercase opacity-60 hover:opacity-100 transition-colors bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} /> Reload Users
                            </button>
                        </header>
                        <AdminUsersView users={users} />
                    </div>
                )}
                {activeTab === 'reviews' && <AdminReviewsPanel setNotification={setNotification} />}
                {activeTab === 'settings' && <SettingsPanel settings={settings} fetchSettings={fetchSettings} setNotification={setNotification} />}
            </main>

            <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={confirmDeleteProduct} productName={productToDelete?.name} loading={isDeleteLoading} />
        </div>
    );
};