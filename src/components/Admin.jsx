import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Package, Plus, Trash2, Edit, LogOut, LayoutDashboard, Sun, Moon, Banknote, Monitor,
    LayoutGrid, ShoppingBag, Settings, Search, Lock, ChevronUp, ChevronDown, RefreshCw,
    Loader2, Save, Zap, AlertCircle, ArrowLeft, X, Star, ToggleLeft, ToggleRight,
    Video, Type, DollarSign, Image as ImageIcon, Receipt, CheckCircle, User as UserIcon,
    Globe, Percent, ShieldCheck, Link, Eye, EyeOff, Terminal, Layers, Sliders, Palette
} from 'lucide-react';

import { API_BASE_URL, formatCurrency } from '../utils/config.js';
import { AdminOrdersList } from './AdminOrdersList.jsx';
import { AdminReceiptsView } from './AdminReceiptsView.jsx';
import { AdminUsersView } from './AdminUsersView.jsx';

// --- Reusable Components ---

const StatsBar = ({ orders, users, receipts, products, currentCurrency }) => {
    // Calculate Revenue (Completed orders only)
    const totalRevenue = orders
        .filter(o => o.status !== 'Cancelled' && o.status !== 'Pending')
        .reduce((sum, o) => sum + parseInt(o.total_cents || 0), 0);

    const pendingPayments = receipts.filter(r => r.verification_status === 'Pending').length;
    const totalProducts = products.length;

    const stats = [
        { label: 'Total Revenue', value: formatCurrency(totalRevenue, currentCurrency), icon: <DollarSign className="text-green-500" /> },
        { label: 'Total Products', value: totalProducts, icon: <Package className="text-blue-500" /> },
        { label: 'Pending Payments', value: pendingPayments, icon: <Receipt className="text-yellow-500" /> },
        { label: 'Total Orders', value: orders.length, icon: <ShoppingBag className="text-[#CCFF00]" /> },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
                <div key={i} className="bg-[#111] border border-[#333] p-6 rounded-2xl hover:border-[#CCFF00] transition-all group relative overflow-hidden">
                    <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        {React.cloneElement(stat.icon, { size: 80 })}
                    </div>
                    <div className="p-2 bg-black rounded-lg border border-[#222] w-fit mb-4">{stat.icon}</div>
                    <p className="text-[10px] uppercase font-mono text-gray-500 tracking-widest">{stat.label}</p>
                    <h4 className="text-2xl font-black text-white">{stat.value}</h4>
                </div>
            ))}
        </div>
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, productName, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
            <div className="bg-[#111] p-8 rounded-lg shadow-2xl border border-red-700 max-w-sm w-full relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-[#888] hover:text-white transition-colors">
                    <X size={20} />
                </button>
                <AlertCircle className="text-red-500 mx-auto mb-4" size={32} />
                <h3 className="font-display text-2xl text-white uppercase mb-4 text-center">Confirm Deletion</h3>
                <p className="font-mono text-sm text-[#888] text-center mb-6">
                    Are you sure you want to permanently delete the product: <span className="text-white font-bold block mt-1">{productName}</span>?
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="font-mono text-sm px-4 py-2 rounded text-[#888] hover:text-white transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700 transition-colors uppercase tracking-wide font-mono ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (<><Loader2 className="animate-spin" size={18} /> Deleting...</>) : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Dashboard Content (CLEANED UP) ---
const DashboardPanel = ({ products, orders, users, receipts, currentCurrency }) => {
    return (
        <div className="space-y-8">
            <header>
                <h2 className="font-display text-3xl uppercase text-white mb-2">Store Analytics</h2>
                <p className="font-mono text-sm text-[#888]">Real-time overview of your store's performance.</p>
            </header>

            {/* MERGED STATS BAR (Single Source of Truth) */}
            <StatsBar
                orders={orders}
                users={users}
                receipts={receipts}
                products={products}
                currentCurrency={currentCurrency}
            />

            {/* You can add a graph or recent activity list here later if desired */}
        </div>
    );
};


// --- Orders Table Component ---
const OrdersTable = ({ currentCurrency, navigate, setNotification }) => {
    const navigateToOrderDetail = (id) => navigate(`/admin/order/${id}`);

    return (
        <AdminOrdersList
            currentCurrency={currentCurrency}
            setNotification={setNotification}
            navigateToOrderDetail={navigateToOrderDetail}
        //orders={orders}
        //refreshOrders={refreshOrders}
        />
    );
};

// --- UPGRADED & COMPREHENSIVE SETTINGS PANEL ---
const SettingsPanel = ({ settings, fetchSettings, setNotification }) => {
    const [formData, setFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (settings && Object.keys(settings).length > 0 && !hasInitialized.current) {
            setFormData({
                ...settings,
                active_theme: settings.active_theme || 'devolt-punk',
                heroSlogan: settings.heroSlogan || '',
                heroSubHeadline: settings.heroSubHeadline || '',
                heroVideoUrl: settings.heroVideoUrl || '',
                heroOverlayOpacity: settings.heroOverlayOpacity || '50',
                scrollingText: settings.scrollingText || '',
                featuredSectionTitle: settings.featuredSectionTitle || 'FEATURED DRIPS',
                newArrivalsTitle: settings.newArrivalsTitle || 'LATEST DROPS',
                showNewArrivals: settings.showNewArrivals === '1' || settings.showNewArrivals === true,
                gallerySectionTitle: settings.gallerySectionTitle || 'INNOVATION GALLERY',
                galleryImages: settings.galleryImages || '',
                galleryLinks: settings.galleryLinks || '',
                showImageGallery: settings.showImageGallery === '1' || settings.showImageGallery === true,
                saleSectionTitle: settings.saleSectionTitle || 'THE VAULT',
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
        // Immediate local preview
        if (name === 'active_theme') {
            document.documentElement.setAttribute('data-theme', value);
        }
    };

    const handleToggle = (key) => {
        setFormData(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handlePushUpdates = async () => {
        setIsSaving(true);
        const payload = { ...formData };
        ['showNewArrivals', 'showSaleItems', 'showImageGallery'].forEach(key => {
            payload[key] = payload[key] ? '1' : '0';
        });

        try {
            await Promise.all(Object.keys(payload).map(key =>
                fetch(`${API_BASE_URL}/settings.php`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ setting_key: key, setting_value: String(payload[key]) })
                })
            ));
            setNotification({ message: "SYSTEM DEPLOYED", type: 'success' });
            fetchSettings();
        } catch (err) {
            setNotification({ message: "DEPLOYMENT FAILED", type: 'error' });
        } finally { setIsSaving(false); }
    };

    // --- STYLING MACROS ---
    const sectionTitleStyle = "text-[10px] font-black text-[#CCFF00] mb-6 flex items-center gap-2 uppercase tracking-[0.3em] drop-shadow-[0_0_10px_rgba(204,255,0,0.6)]";
    const cardStyle = "bg-[#111] border border-white/5 rounded-2xl p-6 shadow-2xl transition-all hover:border-[#CCFF00]/30 hover:shadow-[0_0_40px_rgba(204,255,0,0.05)] relative overflow-hidden";
    const labelStyle = "block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1";
    const inputStyle = "w-full bg-[#080808] border border-white/5 rounded-xl p-3 text-white focus:border-[#CCFF00] focus:shadow-[0_0_10px_rgba(204,255,0,0.15)] outline-none transition-all font-mono text-sm";
    const textAreaCSV = `${inputStyle} h-56 leading-relaxed text-blue-400 font-medium`;
    const themeBtnStyle = (active) => `flex-1 py-3 px-2 rounded-xl border text-[9px] font-black uppercase tracking-tighter transition-all ${active ? 'bg-[#CCFF00] text-black border-[#CCFF00] shadow-[0_0_20px_rgba(204,255,0,0.4)]' : 'bg-[#080808] text-gray-500 border-white/5 hover:border-white/20'}`;

    return (
        <div className="max-w-7xl mx-auto pb-40 px-4 relative">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">System.Config</h2>
                    <p className="text-[#CCFF00] font-mono text-[10px] mt-1 uppercase tracking-widest opacity-80 animate-pulse drop-shadow-[0_0_5px_#CCFF00]">Master Controller Active</p>
                </div>

                <div className="flex items-center gap-3 bg-[#111] p-1 rounded-2xl border border-white/5 shadow-xl">
                    <div className="flex items-center gap-4 px-4 py-2">
                        <div className="flex flex-col">
                            <span className="text-[8px] text-gray-500 font-black uppercase">USD Rate</span>
                            <input name="rateUSD" className="bg-transparent text-[#CCFF00] font-mono text-xs w-14 outline-none border-b border-white/10 focus:border-[#CCFF00]" value={formData.rateUSD || ''} onChange={handleChange} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] text-gray-500 font-black uppercase">GBP Rate</span>
                            <input name="rateGBP" className="bg-transparent text-[#CCFF00] font-mono text-xs w-14 outline-none border-b border-white/10 focus:border-[#CCFF00]" value={formData.rateGBP || ''} onChange={handleChange} />
                        </div>
                        <Globe size={14} className="text-[#CCFF00] drop-shadow-[0_0_8px_#CCFF00]" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* COLUMN 1: Visual Identity */}
                <div className="space-y-6">
                    <div className={cardStyle}>
                        <h3 className={sectionTitleStyle}><Palette size={14} className="text-[#CCFF00]" /> 00. Interface Skin</h3>
                        <label className={labelStyle}>Active System Theme</label>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            {['devolt-punk', 'noor', 'trumpsucks', 'royal-volt'].map(t => (
                                <button key={t} onClick={() => handleChange({ target: { name: 'active_theme', value: t } })} className={themeBtnStyle(formData.active_theme === t)}>
                                    {t.replace('-', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={cardStyle}>
                        <h3 className={sectionTitleStyle}><Monitor size={14} className="text-[#CCFF00]" /> 01. Hero & Marquee</h3>
                        <div className="space-y-4">
                            <div>
                                <label className={labelStyle}>Marquee Announcement</label>
                                <input name="scrollingText" className={inputStyle} value={formData.scrollingText || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label className={labelStyle}>Headline</label>
                                <input name="heroSlogan" className={inputStyle} value={formData.heroSlogan || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label className={labelStyle}>Sub-Headline</label>
                                <textarea name="heroSubHeadline" className={`${inputStyle} h-24`} value={formData.heroSubHeadline || ''} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className={cardStyle}>
                        <h3 className={sectionTitleStyle}><Layers size={14} className="text-[#CCFF00]" /> 02. Home Slideshow</h3>
                        <div className="space-y-4">
                            <label className={labelStyle}>Slideshow Images (CSV)</label>
                            <textarea name="homeSlideshowImages" className={textAreaCSV} value={formData.homeSlideshowImages || ''} onChange={handleChange} placeholder="Comma separated URLs..." />
                        </div>
                    </div>
                </div>

                {/* COLUMN 2: Store Logic & Gallery */}
                <div className="space-y-6">
                    <div className={cardStyle}>
                        <h3 className={sectionTitleStyle}><Star size={14} className="text-[#CCFF00]" /> 03. Collections</h3>
                        <div className="space-y-5">
                            <div>
                                <label className={labelStyle}>Featured Drips Title</label>
                                <input name="featuredSectionTitle" className={inputStyle} value={formData.featuredSectionTitle || ''} onChange={handleChange} />
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <label className={labelStyle}>New Arrivals</label>
                                    <button onClick={() => handleToggle('showNewArrivals')} className={`w-8 h-4 rounded-full relative transition-all ${formData.showNewArrivals ? 'bg-[#CCFF00] shadow-[0_0_15px_#CCFF00]' : 'bg-white/10'}`}>
                                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-black transition-all ${formData.showNewArrivals ? 'left-4.5' : 'left-0.5'}`} />
                                    </button>
                                </div>
                                <input name="newArrivalsTitle" className={inputStyle} value={formData.newArrivalsTitle || ''} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className={cardStyle}>
                        <h3 className={sectionTitleStyle}><ImageIcon size={14} className="text-[#CCFF00]" /> 04. Innovation Gallery</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className={labelStyle}>Gallery Visibility</label>
                                <button onClick={() => handleToggle('showImageGallery')} className={`w-8 h-4 rounded-full relative transition-all ${formData.showImageGallery ? 'bg-[#CCFF00] shadow-[0_0_15px_#CCFF00]' : 'bg-white/10'}`}>
                                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-black transition-all ${formData.showImageGallery ? 'left-4.5' : 'left-0.5'}`} />
                                </button>
                            </div>
                            <input name="gallerySectionTitle" className={inputStyle} value={formData.gallerySectionTitle || ''} onChange={handleChange} />

                            <label className={labelStyle}>Gallery Images (CSV)</label>
                            <textarea name="galleryImages" className={textAreaCSV} value={formData.galleryImages || ''} onChange={handleChange} placeholder="img1.jpg, img2.jpg..." />

                            <label className={labelStyle}>Gallery Target Links (CSV)</label>
                            <textarea name="galleryLinks" className={textAreaCSV} value={formData.galleryLinks || ''} onChange={handleChange} placeholder="/product1, /product2..." />
                        </div>
                    </div>
                </div>

                {/* COLUMN 3: Infrastructure */}
                <div className="space-y-6">
                    <div className={cardStyle}>
                        <h3 className={sectionTitleStyle}><RefreshCw size={14} className="text-[#CCFF00]" /> 05. The Process</h3>
                        <div className="space-y-4">
                            <div>
                                <label className={labelStyle}>Section Heading</label>
                                <input name="processSectionTitle" className={inputStyle} value={formData.processSectionTitle || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label className={labelStyle}>Section Sub-Heading</label>
                                <input name="processSubTitle" className={inputStyle} value={formData.processSubTitle || ''} onChange={handleChange} />
                            </div>
                            <label className={labelStyle}>Process Images (CSV)</label>
                            <textarea name="bottomBannerImages" className={textAreaCSV} value={formData.bottomBannerImages || ''} onChange={handleChange} />
                        </div>
                    </div>

                    <div className={cardStyle}>
                        <h3 className={sectionTitleStyle}><Banknote size={14} className="text-[#CCFF00]" /> 06. Settlement</h3>
                        <div className="space-y-4">
                            <input name="bankName" placeholder="BANK NAME" className={inputStyle} value={formData.bankName || ''} onChange={handleChange} />
                            <input name="accountName" placeholder="ACCOUNT NAME" className={inputStyle} value={formData.accountName || ''} onChange={handleChange} />
                            <input name="accountNumber" placeholder="ACCOUNT NUMBER" className={inputStyle} value={formData.accountNumber || ''} onChange={handleChange} />
                        </div>
                    </div>
                </div>
            </div>

            {/* FLOATING ACTION BUTTON */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={handlePushUpdates}
                    disabled={isSaving}
                    className="flex items-center gap-3 bg-[#CCFF00] text-black px-10 py-5 rounded-full font-black text-[11px] uppercase tracking-widest shadow-[0_0_40px_rgba(204,255,0,0.5)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                    Deploy System Update
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
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [isLoginLoading, setIsLoginLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'descending' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);

    // --- STATE FOR ORDERS, USERS, AND RECEIPTS ---
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState(null);
    const [users, setUsers] = useState([]);
    const [receipts, setReceipts] = useState([]);

    const currentCurrency = 'NGN';
    const DEVOLT_LOGO_URL = "/resources/devolt_logo2.png";

    const handleLogout = () => {
        setIsAdminLoggedIn(false);
        setLoginPassword('');
        setNotification({ message: "ARCHITECT SESSION TERMINATED", type: 'default' });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoginLoading(true);
        try {
            // Ensure API_BASE_URL is clean and action is passed
            const loginUrl = `${API_BASE_URL}/auth.php?action=login`.replace(/([^:]\/)\/+/g, "$1");
            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPassword })
            });
            const data = await response.json();

            if (data.success && data.user.role === 'admin') {
                setIsAdminLoggedIn(true);
                setNotification({ message: `SYSTEM ACCESS GRANTED: WELCOME ${data.user.name.toUpperCase()}`, type: 'success' });
                fetchProducts();
                fetchSettings();
                setActiveTab('dashboard');
                // Trigger initial fetches
                fetchOrders();
                fetchUsers();
                fetchReceipts();
            } else {
                setNotification({ message: data.error || "ACCESS DENIED: INVALID CREDENTIALS", type: 'error' });
            }
        } catch (err) {
            setNotification({ message: "CONNECTION ERROR: CORE OFFLINE", type: 'error' });
        } finally {
            setIsLoginLoading(false);
        }
    };

    const confirmDeleteProduct = async () => {
        if (!productToDelete) return;
        setIsDeleteLoading(true);
        try {
            const deleteUrl = `${API_BASE_URL}/products.php?id=${productToDelete.id}`.replace(/([^:]\/)\/+/g, "$1");
            const response = await fetch(deleteUrl, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error("ERASURE FAILED");
            setNotification({ message: "PRODUCT ERASED FROM MOULD", type: 'success' });
            fetchProducts();
        } catch (error) {
            setNotification({ message: error.message, type: 'error' });
        } finally {
            setIsModalOpen(false);
            setIsDeleteLoading(false);
            setProductToDelete(null);
        }
    };

    // FIXED: Robust URL cleaning to prevent double slashes and missing param errors
    const fetchOrders = useCallback(async () => {
        if (!isAdminLoggedIn) return;
        setOrdersLoading(true);
        try {
            const baseUrl = `${API_BASE_URL}/orders.php`.replace(/([^:]\/)\/+/g, "$1");
            const response = await fetch(`${baseUrl}?action=list`);
            const data = await response.json();

            if (data.success === false) throw new Error(data.error || "Missing parameters");
            setOrders(Array.isArray(data) ? data : (data.orders || []));
        } catch (e) {
            console.error("Orders Fetch Error:", e);
            setOrdersError("LOGISTICS SYNC FAILED");
        } finally {
            setOrdersLoading(false);
        }
    }, [isAdminLoggedIn]);

    const fetchUsers = useCallback(async () => {
        if (!isAdminLoggedIn) return;
        try {
            const baseUrl = `${API_BASE_URL}/users.php`.replace(/([^:]\/)\/+/g, "$1");
            const res = await fetch(`${baseUrl}?action=list`);
            const data = await res.json();
            if (Array.isArray(data)) setUsers(data);
        } catch (e) { console.error("Users Fetch Error:", e); }
    }, [isAdminLoggedIn]);

    const fetchReceipts = useCallback(async () => {
        if (!isAdminLoggedIn) return;
        try {
            const baseUrl = `${API_BASE_URL}/receipts.php`.replace(/([^:]\/)\/+/g, "$1");
            const res = await fetch(`${baseUrl}?action=list`);
            const data = await res.json();
            if (Array.isArray(data)) setReceipts(data);
        } catch (e) { console.error("Receipts Fetch Error:", e); }
    }, [isAdminLoggedIn]);

    useEffect(() => {
        if (isAdminLoggedIn && (activeTab === 'dashboard' || activeTab === 'orders' || activeTab === 'receipts' || activeTab === 'users')) {
            fetchOrders();
            fetchUsers();
            fetchReceipts();
        }
    }, [isAdminLoggedIn, activeTab, fetchOrders, fetchUsers, fetchReceipts]);

    const sortedProducts = useMemo(() => {
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

    const requestSort = (key) => setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === 'ascending' ? 'descending' : 'ascending' });
    const getSortIndicator = (key) => sortConfig.key === key ? (sortConfig.direction === 'ascending' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : null;

    // --- REVAMPED LOGIN PAGE (OLD FORMAT RESTORED) ---
    if (!isAdminLoggedIn) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#050505] p-6 relative overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#CCFF00] opacity-[0.03] blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#CCFF00] opacity-[0.02] blur-[120px] rounded-full"></div>

                <div className="w-full max-w-md relative">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-black border border-white/10 mb-6 shadow-2xl relative group">
                            <div className="absolute inset-0 bg-[#CCFF00] opacity-0 group-hover:opacity-10 blur-xl transition-all"></div>
                            <img src={DEVOLT_LOGO_URL} alt="Devolt" className="w-12 h-12 relative z-10 object-contain" />
                        </div>
                        <h2 className="text-white font-black text-4xl uppercase tracking-tighter italic">
                            ARCHITECT<span className="text-[#CCFF00]">.</span>LOGIN
                        </h2>
                        <p className="text-gray-500 font-mono text-[10px] mt-2 uppercase tracking-[0.3em]">Authorized Personnel Only</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#CCFF00] transition-colors">
                                <UserIcon size={18} />
                            </div>
                            <input
                                type="email"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                className="w-full bg-black border border-white/5 group-hover:border-white/10 focus:border-[#CCFF00] p-4 pl-12 rounded-2xl text-white outline-none transition-all font-mono text-sm"
                                placeholder="Admin Identifier"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#CCFF00] transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                className="w-full bg-black border border-white/5 group-hover:border-white/10 focus:border-[#CCFF00] p-4 pl-12 pr-12 rounded-2xl text-white outline-none transition-all font-mono text-sm"
                                placeholder="Security Key"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoginLoading}
                            className="w-full bg-[#CCFF00] text-black h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-[0_20px_40px_-10px_rgba(204,255,0,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-8"
                        >
                            {isLoginLoading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                            {isLoginLoading ? "Initializing..." : "Establish Connection"}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto pt-24 pb-12 px-4 md:px-8 min-h-screen text-white bg-[#080808]">
            {/* --- UNIQUE BRANDED HEADER --- */}
            <header className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-white/5 pb-8 gap-6 relative overflow-hidden">
                <div className="absolute -left-2 -top-6 opacity-[0.02] text-[120px] font-black italic pointer-events-none select-none tracking-tighter uppercase">ARCHITECT</div>
                <button onClick={() => navigate('/admin')} className="flex items-center gap-5 group transition-all relative z-10">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#CCFF00] blur-2xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                        <div className="w-14 h-14 bg-black border border-white/10 flex items-center justify-center rounded-2xl group-hover:border-[#CCFF00]/50 transition-all shadow-2xl overflow-hidden">
                            <img src={DEVOLT_LOGO_URL} alt="Devolt" className="w-10 h-10 relative z-10 object-contain" onError={(e) => {
                                e.target.style.display = 'none';
                                const fb = document.createElement('div');
                                fb.className = "text-[#CCFF00] font-black text-2xl italic";
                                fb.innerText = "D.M";
                                e.target.parentNode.appendChild(fb);
                            }} />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <div className="relative">
                            <span className="absolute -top-4 -left-2 text-[40px] font-black text-white/[0.03] select-none tracking-tighter uppercase italic">MOULD</span>
                            <h1 className="relative z-10 font-display text-3xl font-black uppercase tracking-tighter italic text-white group-hover:text-[#CCFF00] transition-colors">
                                <span className="text-[#CCFF00] mr-1">/</span>DEVOLT<span className="text-[#CCFF00]">.</span>ADMIN
                            </h1>
                        </div>
                        <div className="flex items-center gap-2 mt-1 px-3 py-0.5 bg-[#CCFF00]/5 border border-[#CCFF00]/10 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse shadow-[0_0_8px_#CCFF00]"></div>
                            <span className="text-[8px] font-black text-[#CCFF00] uppercase tracking-[0.2em]">System Architect Active</span>
                        </div>
                    </div>
                </button>

                <div className="flex items-center gap-8 relative z-10">
                    <div className="hidden lg:block text-right border-r border-white/10 pr-6">
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1">Control Node</p>
                        <p className="text-xs font-mono text-[#CCFF00] opacity-80 uppercase">Station_01_Active</p>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-3 bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 px-6 py-3.5 rounded-2xl transition-all group">
                        <LogOut size={16} className="text-gray-500 group-hover:text-red-500 transition-colors" />
                        <span className="font-black text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">Logout</span>
                    </button>
                </div>
            </header>

            <nav className="mb-8 overflow-x-auto">
                <ul className="flex space-x-4 border-b border-white/5 whitespace-nowrap">
                    {[
                        { key: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
                        { key: 'products', name: 'Products', icon: Package },
                        { key: 'orders', name: 'Orders', icon: ShoppingBag },
                        { key: 'receipts', name: 'Payments Review', icon: Receipt },
                        { key: 'settings', name: 'Settings', icon: Settings },
                        { key: 'users', name: 'Users Directory', icon: UserIcon }
                    ].map(tab => (
                        <li key={tab.key}>
                            <button onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-6 py-4 font-black text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === tab.key ? 'text-[#CCFF00] border-b-2 border-[#CCFF00]' : 'text-[#888] hover:text-white'}`}>
                                <tab.icon size={16} /> {tab.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <main>
                {activeTab === 'dashboard' && <DashboardPanel products={products} orders={orders} users={users} receipts={receipts} currentCurrency={currentCurrency} />}
                {activeTab === 'products' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <header className="flex justify-between items-center">
                            <h2 className="font-display text-3xl uppercase italic tracking-tighter">Product Catalog <span className="text-[#CCFF00] ml-2 font-mono text-sm not-italic opacity-50">[{products.length}]</span></h2>
                            <div className="flex gap-4">
                                <button onClick={fetchProducts} className="flex items-center gap-2 font-mono text-xs uppercase text-[#888] hover:text-white transition-colors"><RefreshCw size={14} /> Refresh</button>
                                <button onClick={() => navigate('/add-product')} className="bg-[#CCFF00] text-black px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all flex items-center gap-3"><Plus size={18} /> New Entry</button>
                            </div>
                        </header>
                        <div className="relative max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input type="text" placeholder="Filter inventory..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#111] border border-white/5 rounded-xl h-12 pl-12 pr-4 text-white outline-none focus:border-[#CCFF00] transition-all font-mono text-sm" />
                        </div>
                        <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl overflow-hidden shadow-2xl overflow-x-auto">
                            <table className="min-w-full divide-y divide-white/5">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[9px] font-black uppercase text-gray-500 tracking-widest">Visual</th>
                                        {['id', 'name', 'category', 'price', 'stock'].map(k => (
                                            <th key={k} className="px-6 py-4 text-left text-[9px] font-black uppercase text-gray-500 tracking-widest cursor-pointer hover:text-white" onClick={() => requestSort(k)}>
                                                <div className="flex items-center gap-1">{k} {getSortIndicator(k)}</div>
                                            </th>
                                        ))}
                                        <th className="px-6 py-4 text-right text-[9px] font-black uppercase text-gray-500 tracking-widest">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {sortedProducts.map((p) => (
                                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4"><div className="w-10 h-10 bg-black rounded border border-white/10 overflow-hidden">{p.images?.[0] ? <img src={p.images[0]} alt="" className="object-cover w-full h-full" /> : <ImageIcon size={18} className="m-2.5 text-gray-800" />}</div></td>
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">{p.id}</td>
                                            <td className="px-6 py-4 font-black uppercase text-[11px] tracking-wider">{p.name}</td>
                                            <td className="px-6 py-4 text-[10px] text-gray-500 uppercase">{p.category}</td>
                                            <td className="px-6 py-4 font-mono text-xs">{formatCurrency(p.price, currentCurrency)}</td>
                                            <td className="px-6 py-4 font-mono text-xs"><span className={p.stock <= 5 ? 'text-red-500 font-bold' : ''}>{p.stock}</span></td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => navigate(`/edit-product/${p.id}`)} className="text-white hover:text-[#CCFF00]"><Edit size={16} /></button>
                                                    <button onClick={() => { setProductToDelete(p); setIsModalOpen(true); }} className="text-white hover:text-red-500"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {activeTab === 'orders' && <OrdersTable currentCurrency={currentCurrency} navigate={navigate} setNotification={setNotification} />}
                {activeTab === 'receipts' && <AdminReceiptsView currentCurrency={currentCurrency} setNotification={setNotification} />}
                {activeTab === 'users' && <AdminUsersView />}
                {activeTab === 'settings' && <SettingsPanel settings={settings} fetchSettings={fetchSettings} setNotification={setNotification} />}
            </main>

            <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={confirmDeleteProduct} productName={productToDelete?.name} loading={isDeleteLoading} />
        </div>
    );
};