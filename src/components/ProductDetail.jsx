import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ShoppingCart, Star, ArrowLeft, Loader2, X, ChevronLeft, ChevronRight, Lock, Zap } from 'lucide-react';
import { formatCurrency } from '../utils/config.js';
import clsx from 'clsx';

const API_BASE_URL = "https://devoltmould.com.ng/api";
const REVIEWS_API_URL = `${API_BASE_URL}/reviews.php`;

/**
 * 1. Image Preview Modal
 */
const ImagePreviewModal = ({ images, initialIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4" onClick={onClose}>
            <button className="absolute top-6 right-6 text-white/40 hover:text-primary transition-colors"><X size={32} /></button>
            <div className="relative w-full max-w-5xl h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
                <button onClick={prev} className="absolute left-0 text-white hover:text-primary p-4 z-10"><ChevronLeft size={48} /></button>
                <img src={images[currentIndex]} className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded-lg" alt="preview" />
                <button onClick={next} className="absolute right-0 text-white hover:text-primary p-4 z-10"><ChevronRight size={48} /></button>
            </div>
        </div>
    );
};

/**
 * 2. STEEZE Rating Display
 */
const RatingDisplay = ({ rating, size = 16, showScore = true }) => {
    const normalizedRating = Math.max(0, Math.min(5, rating));
    const fullStars = Math.floor(normalizedRating);
    const hasHalfStar = normalizedRating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => (
                <Star key={`f-${i}`} size={size} className="text-primary fill-primary mr-0.5" strokeWidth={0} />
            ))}
            {hasHalfStar && (
                <span className="relative inline-block mr-0.5">
                    {/* The Background/Empty Star - Grey Fill + Border */}
                    <Star size={size} className="text-neutral-400/30 fill-neutral-400/20 border-black/10" strokeWidth={1.5} />
                    <div className="absolute top-0 left-0 overflow-hidden w-1/2">
                        <Star size={size} className="text-primary fill-primary" strokeWidth={0} />
                    </div>
                </span>
            )}
            {[...Array(emptyStars)].map((_, i) => (
                <Star key={`e-${i}`} size={size} className="text-neutral-400/40 fill-neutral-400/20 mr-0.5" strokeWidth={1.5} />
            ))}
            {showScore && (
                <span className="text-[9px] font-mono font-black text-primary ml-2 uppercase tracking-tighter">
                    {normalizedRating.toFixed(1)} STEEZE
                </span>
            )}
        </div>
    );
};

/**
 * 3. STEEZE Form
 */
const SteezeForm = ({ productId, reviews, user, onLoginClick, addReview, setNotification }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [formVisible, setFormVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const hasAlreadyRated = useMemo(() => {
        if (!user) return false;
        return reviews.some(r => r.user_name === user.username || r.user_name === user.name);
    }, [reviews, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return setNotification({ message: "RATE_LEVEL_REQUIRED", type: 'error' });

        setSubmitting(true);
        try {
            const response = await fetch(REVIEWS_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: parseInt(productId),
                    user_name: user.username || user.name,
                    rating: rating,
                    comment: comment.trim() || "Style Validated."
                }),
            });

            const rawText = await response.text(); // Get raw text first
            let data;

            try {
                data = JSON.parse(rawText);
            } catch (err) {
                // If it's not JSON, it's a PHP error. Log the actual HTML so we can read it.
                console.error("PHP Error Found:", rawText);
                throw new Error("SERVER_CRASHED_CHECK_CONSOLE");
            }

            if (!response.ok) throw new Error(data.error || "SAVE_FAILED");

            addReview({
                rating,
                comment: comment.trim() || "Style Validated.",
                user_name: user.username || user.name,
                created_at: 'JUST NOW'
            });

            setFormVisible(false);
            setNotification({ message: "STEEZE_LOGGED", type: 'success' });
        } catch (e) {
            console.error("SUBMIT_ERROR:", e);
            setNotification({ message: e.message, type: 'error' });
        } finally { setSubmitting(false); }
    };

    if (!user) return (
        <div className="p-4 border-2 border-dashed border-black/10 dark:border-white/10 rounded-3xl bg-card/50 flex flex-col items-center justify-center text-center group shadow-sm">
            <Lock className="text-gray-400 mb-2" size={18} />
            <button
                type="button"
                onClick={(e) => { e.preventDefault(); onLoginClick?.(); }}
                className="text-[10px] font-mono text-primary font-black uppercase tracking-[0.2em] hover:scale-105 transition-transform"
            >
                [ Authenticate Identity ]
            </button>
        </div>
    );

    if (hasAlreadyRated) return (
        <div className="p-4 border-2 border-primary/20 bg-primary/5 rounded-3xl text-center shadow-inner">
            <Zap className="mx-auto mb-1 text-primary animate-pulse" size={18} />
            <p className="text-[9px] font-mono text-primary uppercase tracking-widest font-black italic">Steeze Logged</p>
        </div>
    );

    return (
        <div>
            {!formVisible ? (
                <button onClick={() => setFormVisible(true)} className="w-full py-4 border-2 border-dashed border-primary/30 rounded-3xl text-[9px] font-mono text-primary hover:bg-primary/5 transition-all uppercase tracking-widest font-bold">
                    + Record Steeze
                </button>
            ) : (
                <form onSubmit={handleSubmit} className="bg-card p-4 rounded-3xl border-2 border-primary/20 space-y-3 shadow-xl animate-in fade-in zoom-in-95">
                    <div className="flex gap-2 justify-center py-2 bg-black/5 dark:bg-white/5 rounded-xl border border-black/8">
                        {[1, 2, 3, 4, 5].map(s => (
                            <Star
                                key={s}
                                size={24}
                                onClick={() => setRating(s)}
                                className={clsx(
                                    "cursor-pointer transition-all hover:scale-110",
                                    // If selected: Use Primary color
                                    // If not selected: Use Grey Fill + Border for visibility on white
                                    s <= rating
                                        ? "text-primary fill-primary"
                                        : "text-neutral-400 fill-neutral-200 dark:fill-white/10"
                                )}
                                strokeWidth={s <= rating ? 0 : 2}
                            />
                        ))}
                    </div>
                    <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="DROP_LOG..." className="w-full p-2 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl font-mono text-[9px] focus:border-primary outline-none" rows="1" />
                    <button type="submit" disabled={submitting} className="w-full bg-primary text-black py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">
                        {submitting ? <Loader2 className="animate-spin mx-auto" size={14} /> : "Transmit"}
                    </button>
                </form>
            )}
        </div>
    );
};

/**
 * 4. Main Export Component
 */
export const ProductDetail = ({
    product,
    user,
    onLoginClick,
    currentCurrency,
    navigateToShop,
    addToCart,
    setNotification,
    headerStyle = 'dark' // Added to track background state
}) => {
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalIndex, setModalIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);

    const images = useMemo(() => Array.isArray(product.images) ? product.images : String(product.images || '').split(',').map(u => u.trim()).filter(Boolean), [product.images]);
    const [currentImage, setCurrentImage] = useState(images[0] || null);

    const fetchReviews = useCallback(async () => {
        if (!product?.id) return;
        setReviewsLoading(true);
        try {
            const response = await fetch(`${REVIEWS_API_URL}?product_id=${product.id}&t=${Date.now()}`);
            const data = await response.json();
            setReviews(Array.isArray(data) ? data : []);
        } catch (e) { setReviews([]); } finally { setReviewsLoading(false); }
    }, [product.id]);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    const averageRating = useMemo(() => reviews.length ? reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length : 0, [reviews]);

    return (
        <div className="max-w-7xl mx-auto pt-24 md:pt-32 pb-20 px-4 md:px-8">
            <div className="flex items-center justify-between mb-8 md:mb-10 border-b-2 md:border-b-4 border-black/5 dark:border-white/5 pb-4 md:pb-6">
                <button onClick={navigateToShop} className="group flex items-center gap-3 text-[10px] font-mono font-bold text-primary hover:tracking-[0.2em] transition-all uppercase">
                    <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-2" />
                    Warehouse_Return
                </button>
                <div className="text-[9px] md:text-[11px] font-mono text-gray-500 bg-card px-4 py-1.5 border-2 border-black/5 dark:border-white/10 rounded-full">
                    UNIT_ID: <span className="text-primary font-black italic">{product.id}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-start">
                <div className="space-y-4 md:space-y-6">
                    <div className="relative aspect-square bg-card border-4 md:border-8 border-black/5 dark:border-white/10 rounded-[2.5rem] md:rounded-[4rem] overflow-hidden p-4 md:p-10 group shadow-2xl">
                        <div className="absolute top-0 left-0 w-12 md:w-24 h-12 md:h-24 border-t-8 md:border-t-[12px] border-l-8 md:border-l-[12px] border-primary rounded-tl-[2.5rem] md:rounded-tl-[4rem] z-10" />
                        <div className="absolute bottom-0 right-0 w-12 md:w-24 h-12 md:h-24 border-b-8 md:border-b-[12px] border-r-8 md:border-r-[12px] border-primary rounded-br-[2.5rem] md:rounded-br-[4rem] z-10" />
                        <div className="w-full h-full rounded-[1.5rem] md:rounded-[3rem] overflow-hidden bg-black/5 dark:bg-black/20 relative shadow-inner">
                            <img src={currentImage} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 cursor-zoom-in" onClick={() => { setModalIndex(images.indexOf(currentImage)); setIsModalOpen(true); }} />
                        </div>
                    </div>
                    <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {images.map((img, i) => (
                            <button key={i} onClick={() => setCurrentImage(img)} className={clsx("w-16 md:w-24 h-16 md:h-24 flex-shrink-0 rounded-[1.5rem] md:rounded-[2rem] border-4 transition-all shadow-sm", img === currentImage ? "border-primary bg-primary/10 scale-95" : "border-black/5 dark:border-white/10 opacity-50")}>
                                <img src={img} className="w-full h-full object-cover rounded-xl" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col">
                    <div className="mb-6 md:mb-10">
                        <div className="flex items-center gap-4 mb-4 md:mb-6">
                            <RatingDisplay rating={averageRating} size={20} />
                            <span className="text-[10px] md:text-[11px] font-mono text-primary font-black uppercase tracking-widest bg-primary/10 px-4 py-1 rounded-full border-2 border-primary/20">
                                {reviews.length} Validated Logs
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-heading font-black uppercase italic tracking-tighter text-current leading-tight">
                            {product.name}
                        </h1>
                    </div>

                    <div className="bg-card border-4 md:border-8 border-black/5 dark:border-white/10 p-6 md:p-10 rounded-[2rem] md:rounded-[4rem] mb-6 md:mb-8 shadow-xl relative overflow-hidden group">
                        <div className="flex items-baseline gap-4 md:gap-8 mb-6 md:mb-10">
                            <span className="text-3xl md:text-5xl font-heading font-black text-primary italic leading-none drop-shadow-sm">
                                {formatCurrency(product.on_sale ? product.sale_price : product.price, currentCurrency)}
                            </span>
                            {product.on_sale && <span className="text-sm md:text-2xl text-gray-400 line-through font-mono">{formatCurrency(product.price, currentCurrency)}</span>}
                        </div>
                        <p className="text-[11px] md:text-sm text-gray-500 dark:text-gray-400 uppercase tracking-tighter leading-relaxed border-l-[8px] md:border-l-[12px] border-primary pl-6 md:pl-10 py-1 md:py-3">
                            {product.description || "Experimental design series. Optimized for peak steeze threshold."}
                        </p>
                    </div>

                    {/* CORE CTA: BAG IT (Theme-Adaptive Background) */}
                    <div className="flex gap-4 md:gap-6 p-4 md:p-6 bg-card rounded-[2rem] md:rounded-[4rem] border-4 md:border-8 border-black/5 dark:border-white/10 shadow-2xl mb-8">
                        <input
                            type="number" min="1" value={quantity}
                            onChange={e => setQuantity(Math.max(1, parseInt(e.target.value)))}
                            className="w-16 md:w-32 h-14 md:h-20 bg-black/5 dark:bg-black/40 border-4 border-black/10 dark:border-white/10 rounded-2xl md:rounded-[2.5rem] text-center font-heading font-bold text-xl md:text-4xl outline-none focus:border-primary transition-all nav-text-dynamic"
                        />
                        <button
                            onClick={() => {
                                addToCart(product, quantity);
                                setNotification({ message: `${product.name.toUpperCase()} BAGGED`, type: 'success' });
                            }}
                            // Logic: If headerStyle is light (White BG), button becomes White with Black/Primary accents.
                            // If headerStyle is dark, button becomes Black with Primary accents.
                            className={clsx(
                                "flex-1 relative group overflow-hidden border-4 border-primary rounded-2xl md:rounded-[2.5rem] font-heading font-black uppercase text-base md:text-2xl tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_-5px_var(--accent-color)]",
                                headerStyle === 'light' ? "bg-white text-black" : "bg-neutral-950 text-white"
                            )}
                            style={{ '--accent-color': 'var(--accent-color)' }}
                        >
                            {/* Hover overlay that reacts to the theme */}
                            <span className={clsx(
                                "absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 pointer-events-none",
                                headerStyle === 'light' ? "bg-black/5" : "bg-white/10"
                            )} />

                            <span className="relative z-10 flex items-center justify-center gap-3 md:gap-5">
                                {/* The icon now strictly follows the Price color (Primary) */}
                                <ShoppingCart size={28} className="fill-primary/20 text-primary" />
                                {/* The text now strictly follows the Price color (Primary) */}
                                <span className="italic text-primary">Bag It</span>
                            </span>
                        </button>
                    </div>

                    {/* Steeze Quick Logic */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="bg-card border-4 border-black/5 dark:border-white/10 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] flex items-center justify-between shadow-lg relative overflow-hidden">
                            <div className="z-10">
                                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block mb-1 italic">Mean_Steeze</span>
                                <span className="text-4xl md:text-6xl font-heading italic font-black text-primary leading-none tracking-tighter drop-shadow-sm">{averageRating.toFixed(1)}</span>
                            </div>
                            <div className="z-10 flex flex-col items-end gap-1 md:gap-3">
                                <RatingDisplay rating={averageRating} size={18} showScore={false} />
                                <span className="text-[8px] md:text-[10px] font-mono text-gray-400 uppercase tracking-widest">Logs: {reviews.length}</span>
                            </div>
                            <div className="absolute -right-6 -bottom-6 opacity-[0.04] text-current scale-150"><Star size={120} fill="currentColor" /></div>
                        </div>
                        <SteezeForm
                            productId={product.id}
                            reviews={reviews}
                            user={user}
                            onLoginClick={onLoginClick}
                            addReview={r => setReviews(prev => [r, ...prev])}
                            setNotification={setNotification}
                        />
                    </div>
                </div>
            </div>

            {/* Steeze Logs */}
            <div className="mt-24 md:mt-32 pt-12 md:pt-16 border-t-8 border-black/5 dark:border-white/5">
                <h2 className="text-3xl md:text-5xl font-heading font-black uppercase italic text-current mb-8 md:mb-12">Steeze_Repository_Logs</h2>
                {reviewsLoading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={64} /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                        {reviews.map((r, i) => (
                            <div key={i} className="bg-card border-4 border-black/5 dark:border-white/10 p-6 md:p-10 rounded-[2rem] md:rounded-[4rem] relative shadow-md hover:shadow-xl transition-shadow duration-500">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-black/5 dark:border-white/5">
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <div className="w-10 md:w-16 h-10 md:h-16 rounded-[1rem] md:rounded-[2rem] bg-primary/10 border-4 border-primary/20 flex items-center justify-center text-primary font-black text-xl md:text-3xl font-display uppercase italic">
                                            {r.user_name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm md:text-xl font-black uppercase tracking-widest text-current italic leading-tight">{r.user_name}</span>
                                            <RatingDisplay rating={r.rating} size={10} showScore={false} />
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest bg-black/5 dark:bg-white/5 px-4 md:px-6 py-1.5 md:py-2 rounded-full border-2 border-black/5 dark:border-white/5">
                                        {r.created_at}
                                    </span>
                                </div>
                                <p className="text-[11px] md:text-sm text-gray-500 dark:text-gray-400 uppercase italic tracking-tighter leading-relaxed pl-6 md:pl-10 border-l-4 border-primary/30">
                                    "{r.comment}"
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isModalOpen && <ImagePreviewModal images={images} initialIndex={modalIndex} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};