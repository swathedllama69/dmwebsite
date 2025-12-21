import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Save, ArrowLeft, Loader2 as Loader, Upload, Trash2,
    Image as ImageIcon, Plus, Star, AlertTriangle, X,
    ChevronRight, Info, Tag, DollarSign, Link as LinkIcon
} from 'lucide-react';
import { API_BASE_URL } from '../utils/config.js';

// --- Custom Dynamic Warning Modal ---
const WarningModal = ({ isOpen, onClose, onConfirm, title, message, type = 'warning' }) => {
    if (!isOpen) return null;
    const isError = type === 'error';

    return (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-md">
            <div className="bg-card/90 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-current/10 max-w-sm w-full relative text-current animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 opacity-40 hover:opacity-100 transition-colors">
                    <X size={20} />
                </button>
                <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 ${isError ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'} rounded-full flex items-center justify-center mb-6`}>
                        {isError ? <X size={32} /> : <AlertTriangle size={32} />}
                    </div>
                    <h3 className="font-display text-2xl uppercase mb-2 tracking-tighter">{title}</h3>
                    <p className="font-mono text-[10px] opacity-60 mb-8 leading-relaxed uppercase tracking-wider">{message}</p>
                    <div className="flex w-full gap-3">
                        <button onClick={onClose} className="flex-1 font-mono text-[10px] font-black uppercase py-3 rounded-xl bg-current/5 hover:bg-current/10 border border-current/10 transition-all">Cancel</button>
                        {!isError && (
                            <button onClick={onConfirm} className="flex-1 font-mono text-[10px] font-black uppercase py-3 rounded-xl bg-primary text-black hover:opacity-90 transition-all shadow-lg">Confirm</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const AddProduct = ({ setNotification }) => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [modalConfig, setModalConfig] = useState({ open: false, title: '', message: '', type: 'warning' });

    const [previews, setPreviews] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [externalUrls, setExternalUrls] = useState([]);

    const [formData, setFormData] = useState({
        name: '', price: '', stock: 1, description: '',
        category: 'Men', subCategory: '', on_sale: false,
        sale_price: '', is_featured: false
    });

    const handleFileSelect = (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                if (!file.type.startsWith('image/')) return;
                setSelectedFiles(prev => [...prev, file]);
                const reader = new FileReader();
                reader.onload = (e) => setPreviews(prev => [...prev, e.target.result]);
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index, type) => {
        if (type === 'file') {
            setSelectedFiles(prev => prev.filter((_, i) => i !== index));
            setPreviews(prev => prev.filter((_, i) => i !== index));
        } else {
            setExternalUrls(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const executeSave = async () => {
        const actualPrice = parseFloat(formData.price || 0);
        const discountPrice = parseFloat(formData.sale_price || 0);

        if (formData.on_sale && discountPrice >= actualPrice) {
            setModalConfig({
                open: true,
                title: "Pricing Protocol Error",
                message: "Offer discount must be strictly lower than the base price.",
                type: "error"
            });
            return;
        }

        setSaving(true);
        setModalConfig({ ...modalConfig, open: false });
        const uploadData = new FormData();

        uploadData.append('name', formData.name);
        uploadData.append('category', formData.category);
        uploadData.append('sub_category', formData.subCategory);
        uploadData.append('description', formData.description);
        uploadData.append('price', formData.price);
        uploadData.append('stock', formData.stock);
        uploadData.append('on_sale', formData.on_sale ? 1 : 0);
        uploadData.append('sale_price', formData.on_sale ? formData.sale_price : 0);
        uploadData.append('featured', formData.is_featured ? 1 : 0);
        uploadData.append('external_images', externalUrls.join(','));
        selectedFiles.forEach((file, i) => uploadData.append(`image_file_${i}`, file));
        uploadData.append('file_count', selectedFiles.length);

        try {
            const response = await fetch(`${API_BASE_URL}/products.php`, { method: 'POST', body: uploadData });
            const data = await response.json();
            if (data.success) {
                setNotification({ message: "PRODUCT MOULDED SUCCESSFULLY", type: 'success' });
                navigate('/admin');
            } else throw new Error(data.error);
        } catch (err) {
            setNotification({ message: err.message || "SYNC ERROR", type: 'error' });
        } finally { setSaving(false); }
    };

    const inputStyle = "w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 outline-none focus:border-primary transition-all font-mono text-xs text-current placeholder:opacity-40";

    return (
        <div className="min-h-screen bg-background text-current transition-colors duration-500 pb-20 pt-28">
            {/* --- RESTORED BREADCRUMB NAVIGATION --- */}
            <div className="fixed top-[64px] left-0 w-full z-40 bg-card/90 backdrop-blur-md border-b border-current/10 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest">
                        <span className="opacity-40">Admin</span>
                        <ChevronRight size={12} className="opacity-20" />
                        <span className="text-primary font-black italic">Mould_New_Product</span>
                    </div>
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]"
                    >
                        <ArrowLeft size={14} /> Back to Dashboard
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 mt-16">
                <form onSubmit={(e) => { e.preventDefault(); (!selectedFiles.length && !externalUrls.length) ? setModalConfig({ open: true, title: "Media Missing", message: "No visual assets provided. Continue?", type: "warning" }) : executeSave(); }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-card border border-white/10 p-8 rounded-2xl shadow-xl">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2 text-primary">
                                <Info size={16} /> Identity_Protocol
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[9px] font-black uppercase opacity-40 mb-2 ml-1 tracking-widest">Product Name</p>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputStyle} placeholder="UNIT_IDENTIFIER..." />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase opacity-40 mb-2 ml-1 tracking-widest">Specifications</p>
                                    <textarea rows="5" name="description" value={formData.description} onChange={handleChange} required className={`${inputStyle} h-auto py-4 resize-none`} placeholder="DATA_DESCRIPTION..." />
                                </div>
                            </div>
                        </div>

                        <div className="bg-card border border-white/10 p-8 rounded-2xl shadow-xl">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2 text-primary">
                                <ImageIcon size={16} /> Visual_Buffer
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                {previews.map((src, i) => (
                                    <div key={i} className="relative aspect-square bg-white/5 rounded-xl overflow-hidden border border-white/10 group">
                                        <img src={src} alt="" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeImage(i, 'file')} className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><Trash2 size={24} /></button>
                                    </div>
                                ))}
                                <div onClick={() => document.getElementById('file-upload').click()} className="aspect-square border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-primary transition-all text-current/20 hover:text-primary">
                                    <Plus size={32} />
                                    <input id="file-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <input type="text" placeholder="EXTERNAL_URL..." value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} className={`${inputStyle} flex-1`} />
                                <button type="button" onClick={(e) => { e.preventDefault(); if (newImageUrl) { setExternalUrls(p => [...p, newImageUrl]); setNewImageUrl(''); } }} className="bg-white/5 border border-white/10 px-6 rounded-xl text-[10px] font-black uppercase hover:bg-primary hover:text-black transition-all">Link_Asset</button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 text-current">
                        <div className="bg-card border border-white/10 p-8 rounded-2xl shadow-xl">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2 text-primary">
                                <DollarSign size={16} /> Pricing_Module
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[9px] font-black uppercase opacity-40 mb-2 ml-1 tracking-widest">Base Price (₦)</p>
                                    <input type="number" name="price" value={formData.price} onChange={handleChange} required className={`${inputStyle} text-lg font-black`} />
                                </div>
                                <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[9px] font-black uppercase opacity-60 tracking-tighter">Offer Discount</span>
                                        <button type="button" onClick={() => setFormData(p => ({ ...p, on_sale: !p.on_sale }))} className={`w-12 h-6 rounded-full relative transition-all duration-300 ${formData.on_sale ? 'bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]' : 'bg-white/10'}`}>
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.on_sale ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                    <input type="number" name="sale_price" value={formData.sale_price} onChange={handleChange} disabled={!formData.on_sale} className={`${inputStyle} h-10 disabled:opacity-20`} placeholder="DISCOUNTED_PRICE..." />
                                </div>
                            </div>
                        </div>

                        <div className="bg-card border border-white/10 p-8 rounded-2xl shadow-xl">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2 text-primary">
                                <Tag size={16} /> Logistics_Data
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[9px] font-black uppercase opacity-40 mb-2 ml-1 tracking-widest">Inventory Stock</p>
                                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} required className={inputStyle} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase opacity-40 mb-2 ml-1 tracking-widest">Category</p>
                                    <input type="text" name="category" value={formData.category} onChange={handleChange} className={inputStyle} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase opacity-40 mb-2 ml-1 tracking-widest">Sub-Category</p>
                                    <input type="text" name="subCategory" value={formData.subCategory} onChange={handleChange} className={inputStyle} />
                                </div>
                                <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer group">
                                    <div className={`w-4 h-4 rounded border border-primary flex items-center justify-center transition-all ${formData.is_featured ? 'bg-primary' : ''}`}>
                                        {formData.is_featured && <X size={10} className="text-black" />}
                                    </div>
                                    <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="hidden" />
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Featured Product</span>
                                </label>
                            </div>
                        </div>

                        <button type="submit" disabled={saving} className="w-full bg-primary text-black py-5 rounded-2xl font-black uppercase tracking-[0.4em] text-xs shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                            {saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />} Mould Product
                        </button>
                    </div>
                </form>
            </div>
            <WarningModal isOpen={modalConfig.open} onClose={() => setModalConfig({ ...modalConfig, open: false })} onConfirm={executeSave} title={modalConfig.title} message={modalConfig.message} type={modalConfig.type} />
        </div>
    );
};