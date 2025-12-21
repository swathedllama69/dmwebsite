import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, ArrowRight, Package, ArrowLeft, RefreshCw, Star } from 'lucide-react';
import { formatCurrency, getPrimaryImage } from '../utils/config.js';
import { useNavigate } from 'react-router-dom';

/**
 * Image Slideshow Component
 * Used for the 'Process' section at the bottom.
 */
const ImageSlideshow = ({ images, interval = 7000 }) => {
    // ... (No changes needed here, keep your existing code for ImageSlideshow)
    const [currentIndex, setCurrentIndex] = useState(0);
    const totalImages = images.length;
    const slidesPerView = 2;
    const maxIndex = totalImages > slidesPerView ? totalImages - slidesPerView + 1 : 1;
    const carouselItems = totalImages >= slidesPerView ? [...images, images[0]] : images;
    const isNavigationVisible = totalImages > slidesPerView;
    const isSlideshowRunning = totalImages > slidesPerView;
    const containerWidth = carouselItems.length * 50;
    const transformValue = `translateX(-${currentIndex * (100 / carouselItems.length)}%)`;

    useEffect(() => {
        if (!isSlideshowRunning) return;
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1);
                if (nextIndex >= maxIndex) {
                    setTimeout(() => setCurrentIndex(0), 1000);
                    return maxIndex;
                }
                return nextIndex;
            });
        }, interval);
        return () => clearInterval(timer);
    }, [isSlideshowRunning, maxIndex, interval, totalImages]);

    const goToPrev = () => {
        if (!isNavigationVisible) return;
        setCurrentIndex((prevIndex) => (prevIndex - 1 + maxIndex) % maxIndex);
    };

    const goToNext = () => {
        if (!isNavigationVisible) return;
        setCurrentIndex((prevIndex) => (prevIndex + 1) % maxIndex);
    };

    if (!images || totalImages < 2) return null;

    return (
        <div className="relative w-full overflow-hidden bg-card border-y border-black/10 dark:border-white/10 h-[400px] group">
            <div className="aspect-[4/1] w-full h-full">
                <div
                    className={`flex h-full`}
                    style={{
                        width: `${containerWidth}%`,
                        transform: transformValue,
                        transition: currentIndex === 0 && transformValue !== `translateX(0%)` && !isSlideshowRunning
                            ? 'none'
                            : 'transform 1000ms cubic-bezier(0.25, 1, 0.5, 1)'
                    }}
                >
                    {carouselItems.map((image, index) => (
                        <div key={index} className="h-full flex-shrink-0 relative border-r border-black/5 dark:border-white/5" style={{ width: `${100 / carouselItems.length}%` }}>
                            <img
                                src={image || null}
                                alt={`Process ${index + 1}`}
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 opacity-60 group-hover:opacity-100"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                        </div>
                    ))}
                </div>
            </div>

            {isNavigationVisible && (
                <>
                    <button onClick={goToPrev} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-md text-white hover:bg-primary hover:text-black transition-all rounded-full z-20 border border-white/10">
                        <ArrowLeft size={20} />
                    </button>
                    <button onClick={goToNext} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-md text-white hover:bg-primary hover:text-black transition-all rounded-full z-20 border border-white/10">
                        <ArrowRight size={20} />
                    </button>
                </>
            )}
        </div>
    );
};

// --- Helper: Calculate Discount ---
const getDiscountPercentage = (price, salePrice) => {
    if (!price || !salePrice || price <= salePrice) return null;
    return Math.round(((price - salePrice) / price) * 100);
};

// --- Vertical ProductCard ---
export const ProductCard = ({ product, currentCurrency, addToCart, setProductId, setNotification }) => {
    // ... (Keep existing ProductCard code exactly as is)
    const primaryImage = getPrimaryImage(product.images);
    const discount = getDiscountPercentage(product.price, product.sale_price);

    const displayPrice = product.pricing?.[currentCurrency] || 0;
    const displaySalePrice = product.sale_pricing?.[currentCurrency] || 0;

    const handleAddToCart = (e) => {
        e.stopPropagation();
        addToCart(product, 1);
        setNotification({ message: `${product.name.toUpperCase()} BAGGED`, type: 'success' });
    };

    return (
        <div
            onClick={() => setProductId(product.id)}
            className="group block bg-card border border-black/10 dark:border-white/5 rounded-xl overflow-hidden shadow-lg hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 cursor-pointer relative"
        >
            {product.on_sale && product.sale_price > 0 && (
                <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1">
                    <span className="bg-red-600 text-white text-[10px] font-heading font-bold px-3 py-1 uppercase tracking-widest rounded-sm shadow-md">
                        SALE
                    </span>
                    {discount && (
                        <span className="bg-white text-black text-[9px] font-heading font-bold px-2 py-0.5 rounded-sm">
                            -{discount}%
                        </span>
                    )}
                </div>
            )}

            <div className="aspect-[4/5] w-full bg-black overflow-hidden relative">
                {primaryImage ? (
                    <img
                        src={primaryImage}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-800"><Package size={48} /></div>
                )}
                {/* Dynamic Button Layer */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black via-black/80 to-transparent">
                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-primary text-black font-heading font-black uppercase text-xs py-3 rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2"
                    >
                        <Package size={14} /> Bag It
                    </button>
                </div>
            </div>

            <div className="p-5">
                <h3 className="text-current font-heading font-bold text-lg uppercase tracking-wide truncate group-hover:text-primary transition-colors">{product.name}</h3>
                <div className="flex justify-between items-center mt-3 border-t border-black/5 dark:border-white/5 pt-3">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-body">Price</span>
                        <div className="font-mono text-sm">
                            {product.on_sale && product.sale_price > 0 ? (
                                <>
                                    <span className="text-red-500 font-bold mr-2">{formatCurrency(displaySalePrice, currentCurrency)}</span>
                                    <span className="text-gray-400 line-through text-xs">{formatCurrency(displayPrice, currentCurrency)}</span>
                                </>
                            ) : (
                                <span className="text-current font-bold">{formatCurrency(displayPrice, currentCurrency)}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Horizontal Product Card ---
const HorizontalProductCard = ({ product, currentCurrency, addToCart, setProductId, setNotification }) => {
    // ... (Keep existing HorizontalProductCard code exactly as is)
    const primaryImage = getPrimaryImage(product.images);
    const discount = getDiscountPercentage(product.price, product.sale_price);

    const displayPrice = product.pricing?.[currentCurrency] || 0;
    const displaySalePrice = product.sale_pricing?.[currentCurrency] || 0;

    const handleAddToCart = (e) => {
        e.stopPropagation();
        addToCart(product, 1);
        setNotification({ message: `${product.name.toUpperCase()} BAGGED`, type: 'success' });
    };

    return (
        <div
            onClick={() => setProductId(product.id)}
            className="flex-shrink-0 w-[280px] md:w-[320px] bg-card border border-black/10 dark:border-white/5 rounded-xl overflow-hidden hover:border-primary/30 transition-all cursor-pointer group"
        >
            <div className="relative aspect-video overflow-hidden bg-black">
                <img src={primaryImage} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                {product.on_sale && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-heading font-bold px-2 py-0.5 rounded-sm uppercase shadow-sm">
                        Sale {discount ? `-${discount}%` : ''}
                    </span>
                )}
            </div>
            <div className="p-4 flex justify-between items-center">
                <div className="overflow-hidden mr-2">
                    <h3 className="text-sm font-heading font-bold text-current uppercase truncate">{product.name}</h3>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                        {formatCurrency(product.on_sale ? displaySalePrice : displayPrice, currentCurrency)}
                    </p>
                </div>
                <button onClick={handleAddToCart} className="bg-primary text-black p-2 rounded-full hover:bg-white dark:hover:bg-white transition-colors">
                    <Package size={16} />
                </button>
            </div>
        </div>
    );
};

// --- Hero Section ---
const HeroSection = ({ settings }) => {
    // ... (Keep existing HeroSection code exactly as is)
    const opacityVal = settings.heroOverlayOpacity ? parseInt(settings.heroOverlayOpacity) / 100 : 0.5;

    return (
        <div className="relative h-screen w-full flex items-center justify-center text-center overflow-hidden pt-[100px] md:pt-[120px]">
            {settings.heroVideoUrl && (
                <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" src={settings.heroVideoUrl} />
            )}
            <div className="absolute inset-0 z-10 transition-colors duration-700" style={{ backgroundColor: `rgba(0, 0, 0, ${opacityVal})` }} />

            <div className="relative z-20 p-4 max-w-5xl animate-fade-in-up">
                <div className="inline-flex items-center gap-2 border border-primary/30 rounded-full px-4 py-1.5 bg-black/40 backdrop-blur-md mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-primary text-[10px] font-body font-bold uppercase tracking-[0.25em]">Devolt Moulding</span>
                </div>
                <h1 className="font-heading text-5xl md:text-8xl lg:text-9xl font-bold text-white uppercase tracking-tighter leading-[0.9] drop-shadow-2xl italic">
                    {settings.heroSlogan || "Moulding the New Standard"}
                </h1>
                <p className="mt-8 text-lg md:text-xl text-gray-300 font-body max-w-2xl mx-auto tracking-wide leading-relaxed uppercase italic">
                    {settings.heroSubHeadline || "A fusion of high technology and durable design for the modern frontier."}
                </p>
                <button
                    onClick={() => {
                        const shop = document.getElementById('featured-grid');
                        if (shop) shop.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="mt-12 group relative bg-primary text-black px-10 py-4 rounded-full font-heading font-black text-xs uppercase tracking-[0.2em] overflow-hidden hover:scale-105 transition-all shadow-[0_0_40px_-10px_var(--accent-color)]"
                >
                    <span className="relative z-10 flex items-center gap-3">
                        Shop Collection <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay" />
                </button>
            </div>
        </div>
    );
};

// --- ScrollingBanner (Marquee) ---
const ScrollingBanner = ({ settings }) => {
    // ... (Keep existing ScrollingBanner code exactly as is)
    if (!settings.scrollingText) return null;
    return (
        <div className="bg-primary overflow-hidden py-4 whitespace-nowrap border-y border-black">
            <style jsx="true">{`
                @keyframes marquee {
                    0% { transform: translate3d(0, 0, 0); }
                    100% { transform: translate3d(-50%, 0, 0); }
                }
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                }
            `}</style>
            <div className="animate-marquee inline-block">
                {[...Array(6)].map((_, i) => (
                    <span key={i} className="text-black font-heading text-xl font-bold uppercase tracking-widest px-12 italic">
                        {settings.scrollingText}
                    </span>
                ))}
            </div>
        </div>
    );
};

// --- Image Gallery (With Links) ---
const ImageGallery = ({ settings }) => {
    if (settings.showImageGallery !== '1') return null;

    const navigate = useNavigate();
    const imagesString = settings.galleryImages;
    const linksString = settings.galleryLinks;
    const galleryTitle = settings.gallerySectionTitle || "Innovation Gallery";

    // <--- UPDATED: Fetch dynamic subtitle
    const gallerySub = settings.gallerySectionSub || "See what's new";

    const images = (imagesString || '').split(',').map(url => url.trim()).filter(url => url.length > 5);
    const links = (linksString || '').split(',').map(url => url.trim());

    if (images.length === 0) return null;

    return (
        <section id="image-gallery" className="my-24 px-4 md:px-8 max-w-[1600px] mx-auto">
            <div className="flex flex-col items-center mb-16">
                <Star className="text-primary mb-4" size={24} />
                <h2 className="font-heading text-4xl md:text-5xl uppercase text-current text-center tracking-tighter italic">
                    {galleryTitle}
                </h2>

                {/* <--- UPDATED: Display dynamic subtitle */}
                <p className="text-gray-500 font-body text-xs uppercase tracking-[0.2em] mt-2 italic">
                    {gallerySub}
                </p>

                <div className="w-24 h-1 bg-primary mt-6 rounded-full opacity-50" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((url, index) => {
                    const link = links[index];
                    const isExternal = link && link.startsWith('http');

                    const Content = (
                        <>
                            <img
                                src={url}
                                alt={`Gallery ${index + 1}`}
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                {link && (
                                    <div className="absolute bottom-6 left-6 text-primary flex items-center gap-2 uppercase font-heading font-black text-sm tracking-widest">
                                        View Page <ArrowRight size={16} />
                                    </div>
                                )}
                            </div>
                        </>
                    );

                    const containerClass = `relative rounded-2xl overflow-hidden border border-black/10 dark:border-white/5 shadow-2xl group ${index === 0 ? 'md:col-span-2 md:row-span-2 aspect-square md:aspect-auto' : 'aspect-square'}`;

                    if (link) {
                        return isExternal ? (
                            <a key={index} href={link} target="_blank" rel="noopener noreferrer" className={`${containerClass} cursor-pointer`}>
                                {Content}
                            </a>
                        ) : (
                            <div key={index} onClick={() => navigate(link)} className={`${containerClass} cursor-pointer`}>
                                {Content}
                            </div>
                        );
                    }
                    return <div key={index} className={containerClass}>{Content}</div>;
                })}
            </div>
        </section>
    );
};

// --- Main ShopView Component ---
export const ShopView = ({
    products,
    loading,
    error,
    currentCurrency,
    addToCart,
    setNotification,
    setProductId,
    settings = {}
}) => {
    const navigate = useNavigate();

    const memoizedProducts = useMemo(() => {
        return {
            featuredItems: products.filter(p => p.is_featured).slice(0, 4),
            newArrivalItems: products.slice(0, 8),
            saleItems: products.filter(p => p.on_sale && p.sale_price > 0).slice(0, 4),
        };
    }, [products]);

    const { featuredItems, newArrivalItems, saleItems } = memoizedProducts;

    const bottomBannerImages = settings.bottomBannerImages
        ? settings.bottomBannerImages.split(',').map(s => s.trim()).filter(Boolean)
        : [];

    const isNewArrivalsVisible = settings.showNewArrivals === '1';
    const isSaleItemsVisible = settings.showSaleItems === '1';

    // <--- UPDATED: Added `subtitle` argument to function signature
    const renderProductGrid = (items, title, subtitle, id, isHorizontalScroll = false) => {
        if (id === 'featured-grid' && loading) {
            return (
                <div className="text-center py-32 flex flex-col items-center">
                    <Loader2 className="animate-spin w-10 h-10 text-primary mb-4" />
                    <p className="font-body text-xs uppercase tracking-widest text-gray-500">Initializing Storefront...</p>
                </div>
            );
        }
        if (items.length === 0) return null;

        if (isHorizontalScroll) {
            return (
                <section id={id} className={`my-20 border-t border-black/5 dark:border-white/5 pt-16`}>
                    <div className="flex justify-between items-end px-4 md:px-8 mb-10 max-w-[1600px] mx-auto">
                        <div className="flex flex-col">
                            <h2 className="font-heading text-3xl md:text-4xl uppercase text-current tracking-tighter italic">
                                {title}
                            </h2>
                            {/* <--- UPDATED: Display subtitle for horizontal scroll too */}
                            {subtitle && <p className="text-gray-500 font-body text-xs uppercase tracking-[0.2em] mt-1 italic">{subtitle}</p>}
                        </div>
                        <div className="hidden md:flex items-center gap-2">
                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            <span className="text-[10px] font-body font-bold uppercase tracking-widest text-gray-400">Live Stock</span>
                        </div>
                    </div>
                    <div className="flex space-x-6 overflow-x-scroll pb-8 scrollbar-hide px-4 md:px-8">
                        {items.map((product) => (
                            <HorizontalProductCard
                                key={product.id}
                                product={product}
                                currentCurrency={currentCurrency}
                                addToCart={addToCart}
                                setProductId={setProductId}
                                setNotification={setNotification}
                            />
                        ))}
                    </div>
                </section>
            );
        }

        return (
            <section id={id} className={`pt-4 px-4 md:px-8 ${id === 'sale-grid' ? 'mt-20 mb-4' : 'my-20'}`}>
                <div className="flex flex-col items-center mb-12 text-center">
                    <h2 className="font-heading text-4xl md:text-5xl uppercase text-current tracking-tighter italic">
                        {title}
                    </h2>
                    {/* <--- UPDATED: Render the dynamic subtitle */}
                    {subtitle && (
                        <p className="text-gray-500 font-body text-xs uppercase tracking-[0.2em] mt-2 italic">
                            {subtitle}
                        </p>
                    )}
                    <div className="w-16 h-[2px] bg-primary mt-4" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1600px] mx-auto">
                    {items.map((product) => (
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
            </section>
        );
    };

    return (
        <div className="min-h-screen">
            {!settings.heroSlogan && loading ? (
                <div className="h-screen w-full flex items-center justify-center bg-black">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            ) : (
                <>
                    <HeroSection settings={settings} />
                    <ScrollingBanner settings={settings} />

                    <div className="pb-8">
                        {/* <--- UPDATED: Passing Titles AND Subtitles */}
                        {renderProductGrid(
                            featuredItems,
                            settings.featuredSectionTitle || 'FEATURED DRIPS',
                            settings.featuredSectionSub || 'Top rated items', // Default fallback
                            'featured-grid',
                            false
                        )}

                        {(featuredItems.length > 0 || (isNewArrivalsVisible && newArrivalItems.length > 0)) && (
                            <div className="text-center my-16">
                                <button
                                    onClick={() => navigate('/collections')}
                                    className="inline-flex items-center gap-4 font-heading text-lg uppercase tracking-widest border border-black/10 dark:border-white/20 text-current px-8 py-4 rounded-full font-bold hover:bg-primary hover:text-black hover:border-primary transition-all duration-300"
                                >
                                    Browse Full Catalog <ArrowRight size={18} />
                                </button>
                            </div>
                        )}

                        {/* <--- UPDATED: Passing Titles AND Subtitles for New Arrivals */}
                        {isNewArrivalsVisible && renderProductGrid(
                            newArrivalItems,
                            settings.newArrivalsTitle || 'LATEST DROPS',
                            settings.newArrivalsSub || 'Fresh from the lab',
                            'new-arrivals-row',
                            true
                        )}

                        <ImageGallery settings={settings} />

                        {/* <--- UPDATED: Passing Titles AND Subtitles for Sales */}
                        {isSaleItemsVisible && renderProductGrid(
                            saleItems,
                            settings.saleSectionTitle || 'THE VAULT',
                            settings.saleSectionSub || 'Exclusive Deals',
                            'sale-grid',
                            false
                        )}
                    </div>

                    {bottomBannerImages.length > 0 && (
                        <section className="mt-4 pt-12 border-t border-black/5 dark:border-white/10 bg-card">
                            <div className="flex flex-col items-center mb-10">
                                <RefreshCw className="text-primary mb-4 animate-spin-slow" size={32} />
                                <h2 className="font-heading text-4xl md:text-5xl uppercase text-current text-center tracking-tighter italic">
                                    {settings.processSectionTitle || 'THE MOULDING PROCESS'}
                                </h2>
                                <p className="text-gray-500 font-body text-xs uppercase tracking-[0.2em] mt-2 italic">
                                    {settings.processSubTitle || 'Behind the scenes engineering'}
                                </p>
                            </div>
                            <ImageSlideshow images={bottomBannerImages} interval={7000} />
                        </section>
                    )}
                </>
            )}
        </div>
    );
};