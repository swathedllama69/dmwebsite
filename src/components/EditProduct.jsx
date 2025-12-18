import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader2 as Loader, Upload, Trash2, Image as ImageIcon, Star, AlertTriangle, X } from 'lucide-react';
import { API_BASE_URL } from '../utils/config.js';

// --- Custom Warning Modal Component (for No Image Check) ---
const WarningModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
            <div className="bg-[#111] p-8 rounded-lg shadow-2xl border border-yellow-700 max-w-sm w-full relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-[#888] hover:text-white transition-colors">
                    <X size={20} />
                </button>
                <AlertTriangle className="text-yellow-500 mx-auto mb-4" size={32} />
                <h3 className="font-display text-2xl text-white uppercase mb-4 text-center">No Image Warning</h3>
                <p className="font-mono text-sm text-[#888] text-center mb-6">
                    You have not provided any valid external image URLs. Do you wish to save changes without a primary image?
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onClose}
                        className="font-mono text-sm px-4 py-2 rounded text-[#888] hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex items-center gap-2 bg-yellow-600 text-black px-6 py-2 rounded font-bold hover:bg-yellow-700 transition-colors uppercase tracking-wide font-mono`}
                    >
                        Yes, Save Anyway
                    </button>
                </div>
            </div>
        </div>
    );
};

// Utility function to check if a URL is a valid external HTTP/HTTPS link
const isValidHttpUrl = (string) => {
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}

export const EditProduct = ({ setNotification }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Core State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [product, setProduct] = useState(null);

    // UI/Image State
    const [dragActive, setDragActive] = useState(false);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false); // NEW: Modal state
    const [pendingPayload, setPendingPayload] = useState(null); // NEW: Pending payload state

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        description: '',
        category: 'Men',
        subCategory: '',
        on_sale: false,
        sale_price: '',
        is_featured: false,
        images: ''
    });

    // --- 1. FETCH PRODUCT DATA BY ID ---
    const fetchProduct = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/products.php?id=${id}`);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}. ${errorText.substring(0, 100)}...`);
            }
            const data = await response.json();

            if (data && data.length > 0) {
                setProduct(data[0]);
            } else {
                setError("Product not found. Check if ID exists or API endpoint is correct.");
                setLoading(false);
            }
        } catch (e) {
            setError(`Failed to fetch product: ${e.message}`);
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);


    // --- 2. LOAD FETCHED DATA INTO FORM ---
    useEffect(() => {
        if (product) {
            const imagesString = Array.isArray(product.images)
                ? product.images.join(', ')
                : product.images || '';

            setFormData({
                id: product.id || '',
                name: product.name || '',
                description: product.description || '',
                category: product.category || 'Men',
                subCategory: product.sub_category || '',
                price: product.price ? (product.price / 100).toFixed(2) : '',
                on_sale: product.on_sale,
                sale_price: product.sale_price ? (product.sale_price / 100).toFixed(2) : '',
                stock: product.stock || 0,
                is_featured: product.is_featured,
                images: imagesString,
            });
            setLoading(false);
        }
    }, [product]);

    // --- 3. IMAGE HANDLING HELPERS (omitted for brevity) ---
    const getImageArray = useCallback(() => {
        if (!formData.images) return [];
        const cleanImages = formData.images
            .replace(/(\r\n|\n|\r)/gm, "")
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
        return cleanImages;
    }, [formData.images]);

    const updateImages = (newImageArray) => {
        setFormData(prev => ({ ...prev, images: newImageArray.map(s => s.trim()).join(',') }));
    };

    // --- 4. UI HANDLERS (omitted for brevity) ---
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const processFile = (file) => {
        if (!file.type.startsWith('image/')) {
            setNotification({ message: "Please upload a valid image file (PNG, JPEG, GIF).", type: 'warning' });
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result.trim();
            updateImages([...getImageArray(), dataUrl]);
            setNotification({ message: "Image added for preview (Base64). Only external URLs will be saved.", type: 'warning' });
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
    };

    const handleRemoveImage = (indexToRemove) => {
        const newImages = getImageArray().filter((_, index) => index !== indexToRemove);
        updateImages(newImages);
    };

    const handleUrlAdd = (e) => {
        e.preventDefault();
        if (newImageUrl.trim()) {
            updateImages([...getImageArray(), newImageUrl.trim()]);
            setNewImageUrl('');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // --- 5. CORE SAVE FUNCTION ---
    const executeSave = async (payload) => {
        setSaving(true);
        setIsWarningModalOpen(false);
        try {
            const response = await fetch(`${API_BASE_URL}/products.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (err) {
                console.error("Server response was not JSON:", text);
                throw new Error(`Server returned status ${response.status}. Raw response: ${text.substring(0, 50)}...`);
            }

            if (response.ok) {
                if (data.error) {
                    setNotification({ message: `Error: ${data.error}`, type: 'error' });
                } else {
                    setNotification({ message: "Product updated successfully!", type: 'success' });
                    setFormData(prev => ({ ...prev, images: payload.images }));
                    navigate('/admin');
                }
            } else {
                setNotification({ message: `Failed to update: ${data.error || 'Server error'}`, type: 'error' });
            }
        } catch (err) {
            console.error(err);
            setNotification({ message: `Network/CORS Error: ${err.message}`, type: 'error' });
        } finally {
            setSaving(false);
            setPendingPayload(null);
        }
    };

    // --- 6. FORM SUBMISSION (Initial Check) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const currentImages = getImageArray();
        const cleanImageUrls = currentImages.filter(url => isValidHttpUrl(url)).join(',');

        const { images: _, ...formDataWithoutImages } = formData;

        // Ensure boolean values are explicitly cast to 1 or 0 for the PHP backend
        const payload = {
            ...formDataWithoutImages,
            id: parseInt(id, 10),
            price: Math.round(parseFloat(formData.price) * 100),
            sale_price: formData.on_sale && formData.sale_price ? Math.round(parseFloat(formData.sale_price) * 100) : 0,
            on_sale: formData.on_sale ? 1 : 0,
            is_featured: formData.is_featured ? 1 : 0,
            sub_category: formData.subCategory || '',
            images: cleanImageUrls,
        };

        if (currentImages.some(url => url.startsWith('data:'))) {
            setNotification({
                message: "Warning: Base64 images were removed before saving. Only external URLs are saved by the API.",
                type: 'warning'
            });
        }

        // CHECK: If no image is present, show modal
        if (!cleanImageUrls) {
            setPendingPayload(payload);
            setIsWarningModalOpen(true);
        } else {
            // If image is present, save immediately
            executeSave(payload);
        }
    };

    // Handler for modal confirmation
    const handleModalConfirm = () => {
        if (pendingPayload) {
            executeSave(pendingPayload);
        }
    };

    // --- 7. RENDER ---
    if (loading) return (
        <div className="min-h-screen bg-[#080808] flex items-center justify-center text-[#CCFF00]">
            <Loader className="animate-spin mr-2" /> Loading Product...
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center text-red-500">
            <p className="text-xl mb-4">{error}</p>
            <button onClick={() => navigate('/admin')} className="text-[#CCFF00] hover:underline">Return to Dashboard</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#080808] text-white p-6 md:p-12 font-sans pt-24">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-2 text-[#888] hover:text-[#CCFF00] mb-6 transition-colors font-mono text-sm uppercase"
                >
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>

                <div className="bg-[#111] border border-[#1a1a1a] rounded-lg shadow-2xl overflow-hidden">
                    <div className="p-6 border-b border-[#333] bg-[#0f0f0f] flex justify-between items-center">
                        <h1 className="font-display text-3xl text-white uppercase flex items-center gap-2">
                            <Save size={28} className="text-[#CCFF00]" /> Edit Product <span className="text-gray-500 text-base font-mono">#{id}</span>
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                        {/* --- BASIC INFO --- */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-[#CCFF00] text-sm font-mono mb-2 uppercase tracking-wider">Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-black border border-[#333] text-white p-3 rounded-lg focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] focus:outline-none transition-colors font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-[#CCFF00] text-sm font-mono mb-2 uppercase tracking-wider">Main Category</label>
                                <input
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., Men, Women, Outerwear"
                                    className="w-full bg-black border border-[#333] text-white p-3 rounded-lg focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] focus:outline-none transition-colors font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-[#CCFF00] text-sm font-mono mb-2 uppercase tracking-wider">Sub-Category</label>
                                <input
                                    type="text"
                                    name="subCategory"
                                    value={formData.subCategory}
                                    onChange={handleChange}
                                    placeholder="e.g., T-shirts, Hoodies, Rings"
                                    className="w-full bg-black border border-[#333] text-white p-3 rounded-lg focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] focus:outline-none transition-colors font-mono"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[#CCFF00] text-sm font-mono mb-2 uppercase tracking-wider">Price (₦)</label>
                                <input
                                    type="number"
                                    name="price"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-black border border-[#333] text-white p-3 rounded-lg focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] focus:outline-none transition-colors font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-[#CCFF00] text-sm font-mono mb-2 uppercase tracking-wider">Stock Quantity</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-black border border-[#333] text-white p-3 rounded-lg focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] focus:outline-none transition-colors font-mono"
                                />
                            </div>
                        </div>

                        {/* Sale and Featured Checkboxes */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end border-b border-[#222] pb-6">
                            <div className='flex items-center gap-3'>
                                <input
                                    id="on_sale_checkbox"
                                    type="checkbox"
                                    name="on_sale"
                                    checked={formData.on_sale}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-[#CCFF00] bg-gray-700 border-gray-600 rounded focus:ring-[#CCFF00] accent-[#CCFF00]"
                                />
                                <label htmlFor="on_sale_checkbox" className="text-white text-sm font-mono uppercase">Product On Sale?</label>
                            </div>
                            <div className='flex items-center gap-3'>
                                <input
                                    id="is_featured_checkbox"
                                    type="checkbox"
                                    name="is_featured"
                                    checked={formData.is_featured}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-[#CCFF00] bg-gray-700 border-gray-600 rounded focus:ring-[#CCFF00] accent-[#CCFF00]"
                                />
                                <label htmlFor="is_featured_checkbox" className="text-white text-sm font-mono uppercase flex items-center gap-2">
                                    <Star size={16} className="text-[#CCFF00]" /> Feature on Homepage?
                                </label>
                            </div>

                            <div className='md:col-span-1'>
                                <label className="block text-[#CCFF00] text-sm font-mono mb-2 uppercase tracking-wider">Sale Price (₦)</label>
                                <input
                                    type="number"
                                    name="sale_price"
                                    step="0.01"
                                    value={formData.sale_price}
                                    onChange={handleChange}
                                    disabled={!formData.on_sale}
                                    className={`w-full bg-black border border-[#333] text-white p-3 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-colors font-mono ${!formData.on_sale ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[#CCFF00] text-sm font-mono mb-2 uppercase tracking-wider">Description</label>
                            <textarea
                                rows="4"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                className="w-full bg-black border border-[#333] text-white p-3 rounded-lg focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] focus:outline-none transition-colors resize-none font-mono"
                            />
                        </div>

                        {/* --- IMAGE MANAGER --- */}
                        <div className="border-t border-[#222] pt-6 mt-2">
                            <label className="block text-[#CCFF00] text-sm font-mono mb-4 uppercase tracking-wider">Product Images</label>

                            <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                                {/* Existing Images List */}
                                {getImageArray().map((url, idx) => (
                                    <div key={idx} className="relative group aspect-square bg-[#080808] border border-[#333] rounded overflow-hidden">
                                        {url.startsWith('data:') || !isValidHttpUrl(url) ? (
                                            <div className="w-full h-full flex items-center justify-center text-[#888]">
                                                <ImageIcon size={32} />
                                            </div>
                                        ) : (
                                            <img
                                                src={url}
                                                alt={`Product ${idx}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(idx)}
                                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-500"
                                        >
                                            <Trash2 size={24} />
                                        </button>
                                    </div>
                                ))}

                                {/* Drop Zone */}
                                <div
                                    className={`relative aspect-square border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer transition-colors
                                ${dragActive ? 'border-[#CCFF00] bg-[#CCFF00]/10' : 'border-[#333] hover:border-gray-500 bg-[#0a0a0a]'}`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => document.getElementById('file-upload').click()}
                                >
                                    <Upload size={24} className={dragActive ? 'text-[#CCFF00]' : 'text-[#888]'} />
                                    <span className="text-[10px] text-[#888] mt-2 font-mono uppercase">Click or Drop</span>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />
                                </div>
                            </div>

                            <p className="text-xs text-red-400 font-mono mb-2">Note: Drag & Drop uploads files as temporary Base64 for preview. Only fully qualified HTTP/HTTPS URLs are saved to the database.</p>

                            {/* Add URL Fallback */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Or paste image URL..."
                                    value={newImageUrl}
                                    onChange={e => setNewImageUrl(e.target.value)}
                                    className="flex-1 bg-black border border-[#333] px-3 py-2 text-sm text-white rounded-lg focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] outline-none font-mono"
                                    onKeyDown={e => e.key === 'Enter' && handleUrlAdd(e)}
                                />
                                <button
                                    type="button"
                                    onClick={handleUrlAdd}
                                    className="bg-[#222] hover:bg-[#333] text-white px-4 py-2 rounded-lg text-xs font-mono uppercase"
                                >
                                    Add URL
                                </button>
                            </div>
                        </div>

                        {/* --- ACTION BUTTONS --- */}
                        <div className="pt-6 border-t border-[#333] flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/admin')}
                                className="px-6 py-3 text-[#888] hover:text-white font-mono uppercase text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className={`flex items-center gap-2 bg-[#CCFF00] text-black px-8 py-3 rounded-lg font-bold hover:bg-[#b3ff00] transition-colors uppercase tracking-wide font-mono ${saving || isWarningModalOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {saving ? (
                                    <><Loader className="animate-spin" size={18} /> Saving...</>
                                ) : (
                                    <><Save size={18} /> Save Changes</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <WarningModal
                isOpen={isWarningModalOpen}
                onClose={() => {
                    setIsWarningModalOpen(false);
                    setNotification({ message: "Saving cancelled.", type: 'default' });
                }}
                onConfirm={handleModalConfirm}
            />
        </div>
    );
};