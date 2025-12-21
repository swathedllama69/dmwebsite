import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, ChevronDown, Filter, X, Zap, Loader2, AlertCircle, Package, ArrowLeft, ArrowRight, Grid, ListFilter } from 'lucide-react';
import { formatCurrency, getPrimaryImage } from '../utils/config.js';
import { ProductCard } from './ShopView.jsx';

// --- Constants for Pagination ---
const PRODUCTS_PER_PAGE = 12;

// --- Component: Filter & Sort Controls ---
const FilterControls = ({ products, filters, setFilters }) => {
    // Determine unique categories
    const categories = useMemo(() => {
        const unique = [...new Set(products.map(p => p.category).filter(c => c))];
        return ['All Categories', ...unique];
    }, [products]);

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            currentPage: 1 // Reset pagination whenever filters change
        }));
    };

    const handleClearFilters = () => {
        setFilters({ search: '', category: '', sort: 'recent', onSale: false, currentPage: 1 });
    };

    const isFilterActive = filters.search || filters.category || filters.onSale;

    return (
        // CHANGED: bg-card/50 works, but added border-current/10 for dynamic visibility
        <div className="bg-card/50 backdrop-blur-md p-6 rounded-xl border border-current/10 shadow-2xl mb-12 relative overflow-hidden group transition-all duration-300 hover:border-primary/30">

            {/* Decoration Line */}
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/50 group-hover:bg-primary transition-colors"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h3 className="text-xl font-display text-primary uppercase flex items-center gap-3 tracking-wider">
                    <ListFilter size={20} />
                    Command Console
                </h3>

                {isFilterActive && (
                    <button
                        onClick={handleClearFilters}
                        className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 uppercase font-bold tracking-widest mt-2 md:mt-0 transition-all hover:scale-105"
                    >
                        <X size={14} /> Clear Active Filters
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-mono text-sm">

                {/* Search Input */}
                <div className="relative group/input">
                    <input
                        type="text"
                        name="search"
                        placeholder="SEARCH DATABASE..."
                        value={filters.search}
                        onChange={handleFilterChange}
                        // CHANGED: Dynamic background and text colors
                        className="w-full p-3 bg-black/5 dark:bg-black/40 border border-current/10 text-current rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none placeholder-current/30 transition-all uppercase tracking-wider text-xs"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-current/30 group-focus-within/input:text-primary transition-colors" size={16} />
                </div>

                {/* Category Dropdown */}
                <div className="relative group/select">
                    <select
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                        // CHANGED: Dynamic background and text colors
                        className="w-full p-3 bg-black/5 dark:bg-black/40 border border-current/10 text-current rounded-lg appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all uppercase tracking-wider text-xs cursor-pointer"
                    >
                        {categories.map(cat => (
                            // Use distinct colors for options as some browsers struggle with transparent option bgs
                            <option key={cat} value={cat === 'All Categories' ? '' : cat} className="bg-white dark:bg-black text-black dark:text-white">
                                {cat.toUpperCase()}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-primary group-hover/select:translate-y-0 transition-transform" />
                </div>

                {/* Sort Dropdown */}
                <div className="relative group/select">
                    <select
                        name="sort"
                        value={filters.sort}
                        onChange={handleFilterChange}
                        // CHANGED: Dynamic background and text colors
                        className="w-full p-3 bg-black/5 dark:bg-black/40 border border-current/10 text-current rounded-lg appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all uppercase tracking-wider text-xs cursor-pointer"
                    >
                        <option value="recent" className="bg-white dark:bg-black text-black dark:text-white">Newest Arrivals</option>
                        <option value="priceAsc" className="bg-white dark:bg-black text-black dark:text-white">Price: Low to High</option>
                        <option value="priceDesc" className="bg-white dark:bg-black text-black dark:text-white">Price: High to Low</option>
                        <option value="nameAsc" className="bg-white dark:bg-black text-black dark:text-white">Name: A-Z</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-primary group-hover/select:translate-y-0 transition-transform" />
                </div>

                {/* On Sale Checkbox */}
                <label className="flex items-center justify-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors group/check">
                    <input
                        type="checkbox"
                        name="onSale"
                        checked={filters.onSale}
                        onChange={handleFilterChange}
                        className="peer hidden"
                    />
                    <div className={`w-4 h-4 border border-primary rounded flex items-center justify-center transition-all ${filters.onSale ? 'bg-primary' : 'bg-transparent'}`}>
                        {filters.onSale && <div className="w-2 h-2 bg-black rounded-sm" />}
                    </div>
                    {/* CHANGED: Text color logic */}
                    <span className={`text-xs uppercase font-bold tracking-wider transition-colors ${filters.onSale ? 'text-current' : 'text-current/60'} group-hover/check:text-primary`}>
                        Show Sale Items
                    </span>
                    <Zap size={14} className={`${filters.onSale ? 'text-primary fill-primary' : 'text-current/20'}`} />
                </label>

            </div>
        </div>
    );
};

// --- Main Collections View ---
export const CollectionsView = ({ products, loading, error, currentCurrency, addToCart, setNotification, setProductId }) => {

    const [filters, setFilters] = useState({
        search: '',
        category: '',
        sort: 'recent',
        onSale: false,
        currentPage: 1
    });

    // Memoized filter and sort logic
    const allFilteredProducts = useMemo(() => {
        let items = [...products];
        const { search, category, sort, onSale } = filters;

        // Apply Sale Filter
        if (onSale) {
            items = items.filter(p => p.on_sale && p.on_sale !== '0');
        }

        // Apply Category Filter
        if (category) {
            items = items.filter(p => p.category === category);
        }

        // Apply Search Filter
        if (search) {
            const lowerSearch = search.toLowerCase();
            items = items.filter(p =>
                p.name.toLowerCase().includes(lowerSearch) ||
                (p.description && p.description.toLowerCase().includes(lowerSearch))
            );
        }

        // Apply Sorting
        items.sort((a, b) => {
            if (sort === 'priceAsc') return a.price - b.price;
            if (sort === 'priceDesc') return b.price - a.price;
            if (sort === 'nameAsc') return a.name.localeCompare(b.name);
            return b.id - a.id;
        });

        return items;
    }, [products, filters]);

    // Pagination Logic
    const totalPages = Math.ceil(allFilteredProducts.length / PRODUCTS_PER_PAGE);
    const startIndex = (filters.currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;

    const paginatedProducts = useMemo(() => {
        return allFilteredProducts.slice(startIndex, endIndex);
    }, [allFilteredProducts, startIndex, endIndex]);

    // Sale Products for dedicated section
    const saleProducts = useMemo(() => {
        return products.filter(p => (p.on_sale && p.on_sale !== '0') && p.stock > 0);
    }, [products]);

    // --- Loading/Error/Empty States ---
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                <Loader2 className="animate-spin text-primary mb-4" size={48} />
                <p className="text-current font-mono uppercase tracking-widest text-xs animate-pulse">Accessing Collections...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
                <AlertCircle className="text-red-500 mb-4" size={48} />
                <p className="text-red-400 font-mono text-center mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors uppercase font-mono text-xs rounded"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setFilters(prev => ({ ...prev, currentPage: page }));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const renderPaginationControls = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-center items-center gap-6 mt-16 font-mono text-sm">
                <button
                    onClick={() => handlePageChange(filters.currentPage - 1)}
                    disabled={filters.currentPage === 1}
                    // CHANGED: Border and text colors to be dynamic (border-current/20)
                    className="p-3 border border-current/20 text-current rounded-lg disabled:opacity-20 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-all active:scale-95"
                >
                    <ArrowLeft size={20} />
                </button>

                {/* CHANGED: Text colors to text-current/50 for muted effect */}
                <span className="text-current/50 tracking-widest text-xs">
                    PAGE <span className="text-current text-lg font-bold mx-2">{filters.currentPage}</span> OF <span className="text-current">{totalPages}</span>
                </span>

                <button
                    onClick={() => handlePageChange(filters.currentPage + 1)}
                    disabled={filters.currentPage === totalPages}
                    className="p-3 border border-current/20 text-current rounded-lg disabled:opacity-20 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-all active:scale-95"
                >
                    <ArrowRight size={20} />
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background text-current transition-colors duration-500">
            <div className="max-w-[1600px] mx-auto pt-32 pb-24 px-4 md:px-8">

                {/* Header Section */}
                {/* CHANGED: border-white/10 -> border-current/10 */}
                <div className="mb-12 text-center md:text-left border-b border-current/10 pb-8">
                    {/* CHANGED: text-white -> text-current */}
                    <h1 className="font-display text-4xl md:text-6xl uppercase text-current mb-2 tracking-tighter">
                        Collections <span className="text-primary">.idx</span>
                    </h1>
                    {/* CHANGED: text-white/50 -> text-current/50 */}
                    <p className="font-mono text-sm md:text-base text-current/50 max-w-2xl">
                        Browse our complete inventory. Use the command console below to filter by category or status.
                    </p>
                </div>

                {/* Filter Controls */}
                <FilterControls
                    products={products}
                    filters={filters}
                    setFilters={setFilters}
                />

                {/* --- Main Product Grid --- */}
                {paginatedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                        {paginatedProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                currentCurrency={currentCurrency}
                                addToCart={addToCart}
                                setProductId={setProductId}
                                setNotification={setNotification}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-card/20 rounded-xl border border-dashed border-current/10">
                        <Package size={64} className="text-current/10 mb-6" />
                        <h3 className="font-display text-2xl text-current uppercase mb-2">Null Result</h3>
                        <p className="font-mono text-current/40 mb-6">No artifacts found matching current parameters.</p>
                        <button
                            onClick={() => setFilters({ search: '', category: '', sort: 'recent', onSale: false, currentPage: 1 })}
                            className="px-6 py-2 bg-primary/10 text-primary border border-primary/30 rounded hover:bg-primary hover:text-black transition-all font-mono uppercase text-xs tracking-widest"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {renderPaginationControls()}

                {/* --- Dedicated Sale Items Section --- */}
                {saleProducts.length > 0 && (
                    <div className="mt-32 relative">
                        {/* Section Header with Gradient Border */}
                        {/* NOTE: We usually want the sale section to pop, so we often keep it dark or give it a strong accent background. 
                            However, to ensure text visibility, we will use text-current inside unless we force a dark background.
                            Let's force a 'dark-like' card look that uses the Theme's Card color but ensures contrast. */}
                        <div className="relative p-8 md:p-12 rounded-2xl border border-primary/30 bg-card/40 overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Zap size={120} className="text-primary" />
                            </div>

                            <div className="relative z-10 mb-10">
                                <h2 className="font-display text-3xl md:text-4xl uppercase text-current mb-4 flex items-center gap-4">
                                    <span className="bg-primary text-black px-3 py-1 text-lg font-bold rounded transform -skew-x-12">SALE</span>
                                    Limited Time Offers
                                </h2>
                                <p className="font-mono text-current/70 text-sm max-w-xl">
                                    Acquire premium artifacts at reduced credits. Quantities are strictly limited.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {saleProducts.slice(0, 4).map((product) => (
                                    <ProductCard
                                        key={`sale-${product.id}`}
                                        product={product}
                                        currentCurrency={currentCurrency}
                                        addToCart={addToCart}
                                        setProductId={setProductId}
                                        setNotification={setNotification}
                                    />
                                ))}
                            </div>

                            {saleProducts.length > 4 && (
                                <div className="mt-8 text-center">
                                    <button
                                        onClick={() => {
                                            setFilters(prev => ({ ...prev, onSale: true }));
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="text-primary hover:text-current font-mono text-xs uppercase tracking-widest border-b border-primary hover:border-current transition-colors pb-1"
                                    >
                                        View All Sale Items
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};