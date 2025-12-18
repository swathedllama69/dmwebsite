import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, ChevronDown, Filter, X, Zap, Loader2, AlertCircle, Package, ArrowLeft, ArrowRight } from 'lucide-react';
import { formatCurrency, getPrimaryImage } from '../utils/config.js';
import { ProductCard } from './ShopView.jsx';

// --- Constants for Pagination ---
const PRODUCTS_PER_PAGE = 12;

// --- Component: Filter & Sort Controls ---
const FilterControls = ({ products, filters, setFilters }) => {
    // Determine unique categories, excluding products with no category
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
        <div className="bg-[#111] p-4 rounded-lg border border-[#333] shadow-lg mb-8">
            <h3 className="text-xl font-display text-[#CCFF00] uppercase mb-4 flex items-center gap-2">
                <Filter size={20} /> Filter & Sort
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-sm">

                {/* Search Input */}
                <input
                    type="text"
                    name="search"
                    placeholder="Search by name or description..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="w-full p-2 bg-black border border-[#333] text-white rounded focus:border-[#CCFF00] placeholder-[#888]"
                />

                {/* Category Dropdown */}
                <div className="relative">
                    <select
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                        className="w-full p-2 bg-black border border-[#333] text-white rounded appearance-none focus:border-[#CCFF00]"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat === 'All Categories' ? '' : cat}>{cat}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-[#CCFF00]" />
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                    <select
                        name="sort"
                        value={filters.sort}
                        onChange={handleFilterChange}
                        className="w-full p-2 bg-black border border-[#333] text-white rounded appearance-none focus:border-[#CCFF00]"
                    >
                        <option value="recent">Newest Arrivals</option>
                        <option value="priceAsc">Price: Low to High</option>
                        <option value="priceDesc">Price: High to Low</option>
                        <option value="nameAsc">Name: A-Z</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-[#CCFF00]" />
                </div>

                {/* On Sale Checkbox (NEW) */}
                <div className="flex items-center space-x-2 p-2 bg-black border border-[#333] rounded">
                    <input
                        type="checkbox"
                        id="onSale"
                        name="onSale"
                        checked={filters.onSale}
                        onChange={handleFilterChange}
                        className="h-4 w-4 text-[#CCFF00] bg-[#111] border-[#333] rounded focus:ring-[#CCFF00]"
                    />
                    <label htmlFor="onSale" className="text-white flex items-center gap-1">
                        <Zap size={14} className="text-red-500" /> Show Only Sale Items
                    </label>
                </div>

            </div>

            {isFilterActive ? (
                <button
                    onClick={handleClearFilters}
                    className="mt-4 text-xs text-red-400 hover:text-red-300 flex items-center"
                >
                    <X size={14} className="mr-1" /> Clear Filters
                </button>
            ) : null}
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

        // Apply Sale Filter (LOOSER CHECK APPLIED HERE)
        if (onSale) {
            // Checks if p.on_sale exists AND is not the string '0' (covers '1', 1, true)
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
            // Default/recent sort is based on ID (assuming newest have highest ID)
            return b.id - a.id;
        });

        return items;
    }, [products, filters]);

    // Pagination Logic
    const totalPages = Math.ceil(allFilteredProducts.length / PRODUCTS_PER_PAGE);
    const startIndex = (filters.currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;

    // Products displayed on the current page
    const paginatedProducts = useMemo(() => {
        return allFilteredProducts.slice(startIndex, endIndex);
    }, [allFilteredProducts, startIndex, endIndex]);

    // Sale Products for the dedicated section (LOOSER CHECK APPLIED HERE)
    const saleProducts = useMemo(() => {
        // Find products that are on sale, truthy, not '0', and have stock
        return products.filter(p => (p.on_sale && p.on_sale !== '0') && p.stock > 0);
    }, [products]);

    // --- Loading/Error/Empty States ---
    if (loading) {
        return <div className="p-16 text-center pt-32"><Loader2 className="animate-spin w-10 h-10 mx-auto text-[#CCFF00]" /> <p className="mt-4 text-white">Loading collections...</p></div>;
    }

    if (error) {
        return <div className="p-16 text-center pt-32"><AlertCircle className="w-10 h-10 mx-auto text-red-500" /> <p className="mt-4 text-red-400">Error fetching products: {error}</p></div>;
    }

    if (products.length === 0) {
        return <div className="p-16 text-center pt-32"><Package className="w-10 h-10 mx-auto text-[#888]" /> <p className="mt-4 text-[#888]">No products available in the shop.</p></div>;
    }

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setFilters(prev => ({ ...prev, currentPage: page }));
            window.scrollTo(0, 0); // Scroll to top on page change for better UX
        }
    };

    const renderPaginationControls = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-center items-center space-x-4 mt-8 font-mono text-sm">
                <button
                    onClick={() => handlePageChange(filters.currentPage - 1)}
                    disabled={filters.currentPage === 1}
                    className="p-2 border border-[#CCFF00] text-[#CCFF00] rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#CCFF00] hover:text-black transition-colors"
                >
                    <ArrowLeft size={16} />
                </button>
                <span className="text-white">
                    Page {filters.currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => handlePageChange(filters.currentPage + 1)}
                    disabled={filters.currentPage === totalPages}
                    className="p-2 border border-[#CCFF00] text-[#CCFF00] rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#CCFF00] hover:text-black transition-colors"
                >
                    <ArrowRight size={16} />
                </button>
            </div>
        );
    };

    return (
        <div className="max-w-[1600px] mx-auto pt-32 pb-12 px-4 md:px-8">
            <h1 className="font-display text-5xl uppercase text-white mb-4 text-center">
                All Collections
            </h1>
            <p className="text-center font-mono text-lg text-[#CCFF00] mb-12">
                Browse our complete catalog of innovative products.
            </p>

            {/* Filter and Sort Controls */}
            <FilterControls
                products={products}
                filters={filters}
                setFilters={setFilters}
            />

            {/* --- Main Product Grid (Paginated) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {paginatedProducts.length > 0 ? (
                    paginatedProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            currentCurrency={currentCurrency}
                            addToCart={addToCart}
                            setProductId={setProductId}
                            setNotification={setNotification}
                        />
                    ))
                ) : (
                    <div className="md:col-span-4 text-center p-10 bg-[#111] rounded-lg border border-[#333]">
                        <Search size={32} className="text-[#888] mx-auto mb-3" />
                        <p className="font-mono text-white text-lg">
                            No products match your current filters.
                        </p>
                        <button
                            onClick={() => setFilters({ search: '', category: '', sort: 'recent', onSale: false, currentPage: 1 })}
                            className="mt-4 text-sm text-[#CCFF00] hover:text-white"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Pagination Controls (NEW) */}
            {renderPaginationControls()}

            {/* --- Dedicated Sale Items Section (NEW) --- */}
            {saleProducts.length > 0 && (
                <div className="mt-20 pt-12 border-t border-gray-700">
                    <h2 className="font-display text-4xl uppercase text-white mb-6 flex items-center gap-3">
                        <Zap size={28} className="text-red-500" />
                        Limited Time Offers
                    </h2>
                    <p className="font-mono text-gray-400 mb-8">
                        Don't miss out on these discounted products! Prices shown are sale prices.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {saleProducts.map((product) => (
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
                </div>
            )}
        </div>
    );
};