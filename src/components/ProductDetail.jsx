import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ShoppingCart, Package, Star, ArrowLeft, Send, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../utils/config.js';

// IMPORTANT: Assuming API_BASE_URL is available in config.js or defined here
const API_BASE_URL = "http://devoltmould.com.ng/api";
const REVIEWS_API_URL = `${API_BASE_URL}/reviews.php`;

// --- New Helper Function for Image Logic (using array now that data is fixed) ---
const getPrimaryImageUrl = (imagesArray) => {
    // If images is a non-empty array, return the first element. Otherwise, null.
    return (Array.isArray(imagesArray) && imagesArray.length > 0) ? imagesArray[0] : null;
};

// --- Helper Component: Star Rating Display ---
const RatingDisplay = ({ rating, size = 16, showScore = true }) => {
    const normalizedRating = Math.max(0, Math.min(5, rating));
    const fullStars = Math.floor(normalizedRating);
    const hasHalfStar = normalizedRating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center text-[#CCFF00]">
            {[...Array(fullStars)].map((_, i) => (
                <Star key={`full-${i}`} size={size} fill="#CCFF00" className="mr-0.5" />
            ))}
            {hasHalfStar && (
                <span className="relative inline-block mr-0.5">
                    <Star size={size} className="text-[#333]" />
                    <Star size={size} fill="#CCFF00" className="absolute top-0 left-0 overflow-hidden" style={{ width: '50%' }} />
                </span>
            )}
            {[...Array(emptyStars)].map((_, i) => (
                <Star key={`empty-${i}`} size={size} className="text-[#333] mr-0.5" />
            ))}
            {showScore && <span className="text-sm text-white ml-2">({normalizedRating.toFixed(1)})</span>}
        </div>
    );
};

// --- Component: Review Form ---
const ReviewForm = ({ productId, addReview, setNotification }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [user, setUser] = useState('Guest User');
    const [formVisible, setFormVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Comment is required for database consistency, even if not displayed
        if (rating === 0 || comment.trim() === '') {
            setNotification({ message: "Please provide a rating and a comment.", type: 'error' });
            return;
        }

        setSubmitting(true);
        const newReviewData = {
            product_id: productId,
            user_name: user,
            rating: rating,
            comment: comment.trim(),
        };

        try {
            const response = await fetch(REVIEWS_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newReviewData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to submit review. Server responded: ${errorText}`);
            }

            const result = await response.json();

            const reviewToDisplay = {
                id: result.review_id || Date.now(),
                user_name: user,
                rating: rating,
                comment: comment.trim(),
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            };

            addReview(reviewToDisplay);
            setRating(0);
            setComment('');
            setFormVisible(false);
            setNotification({ message: "Rating submitted successfully!", type: 'success' });

        } catch (error) {
            console.error("Review submission error:", error);
            setNotification({ message: `Error submitting review: ${error.message}`, type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    if (!formVisible) {
        return (
            <button
                onClick={() => setFormVisible(true)}
                className="inline-flex items-center gap-2 font-mono text-sm text-[#CCFF00] hover:text-white transition-colors"
            >
                <Star size={16} /> Write a Rating
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-[#1a1a1a] p-6 rounded-lg border border-[#333] space-y-4">
            <h4 className="font-mono text-lg uppercase text-[#CCFF00]">Submit Your Rating</h4>

            {/* Rating Input */}
            <div className="flex items-center">
                <label className="text-sm mr-4 text-white">Your Rating:</label>
                <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((starValue) => (
                        <Star
                            key={starValue}
                            size={24}
                            className={`cursor-pointer transition-colors ${starValue <= rating ? 'text-[#CCFF00] fill-[#CCFF00]' : 'text-[#555] fill-transparent hover:text-[#CCFF00]'
                                }`}
                            onClick={() => setRating(starValue)}
                        />
                    ))}
                </div>
            </div>

            {/* Comment Input (Hidden but required for valid API submission) */}
            <div>
                <textarea
                    rows="1"
                    placeholder="Enter a brief comment (required, but hidden from public view)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-2 bg-black border border-[#333] text-white rounded font-mono focus:outline-none focus:ring-1 focus:ring-[#CCFF00] text-xs"
                    required
                />
            </div>

            <div className='flex justify-end space-x-4'>
                <button
                    type="button"
                    onClick={() => setFormVisible(false)}
                    className="text-sm text-[#888] hover:text-white transition-colors"
                    disabled={submitting}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 bg-[#CCFF00] text-black px-4 py-1.5 rounded font-bold uppercase hover:bg-white transition-colors text-sm disabled:opacity-50"
                >
                    {submitting ? <Loader2 size={16} className='animate-spin' /> : <Send size={16} />}
                    {submitting ? 'Submitting...' : 'Submit'}
                </button>
            </div>
        </form>
    );
};

// --- Component: Image Preview Modal (Lightbox) ---
const ImagePreviewModal = ({ images, initialIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const nextImage = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, [images.length]);

    const prevImage = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }, [images.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'ArrowRight') {
                nextImage();
            } else if (event.key === 'ArrowLeft') {
                prevImage();
            } else if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [nextImage, prevImage, onClose]);


    if (!images || images.length === 0) return null;
    const currentImageUrl = images[currentIndex];
    const isScrollable = images.length > 1;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative max-w-5xl max-h-screen p-8"
                onClick={(e) => e.stopPropagation()} // Stop propagation to prevent modal close on image click
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white hover:text-[#CCFF00] transition-colors z-50 bg-black/50 p-2 rounded-full"
                >
                    <X size={24} />
                </button>

                {/* Main Image */}
                <img
                    src={currentImageUrl}
                    alt="Product Preview"
                    className="max-w-full max-h-[90vh] object-contain mx-auto rounded-lg shadow-2xl"
                />

                {/* Navigation Buttons */}
                {isScrollable && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                        >
                            <ChevronLeft size={32} />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                        >
                            <ChevronRight size={32} />
                        </button>
                    </>
                )}

                {/* Image Count Indicator */}
                {isScrollable && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full font-mono">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}
            </div>
        </div>
    );
};


// --- MAIN Product Detail Component ---
export const ProductDetail = ({ product, currentCurrency, navigateToShop, addToCart, setNotification }) => {

    // State for Reviews and Loading
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    // State for Image Preview Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalIndex, setModalIndex] = useState(0);

    // --- Image Handling FIX ---
    const rawImageString = String(product.images || '');
    const images = Array.isArray(product.images) ? product.images : (
        String(product.images || '').split(',').map(url => url.trim()).filter(url => url)
    );

    const [currentImage, setCurrentImage] = useState(getPrimaryImageUrl(images));
    // -------------------------------------------------------------------

    const [quantity, setQuantity] = useState(1);

    // --- API Fetch Reviews ---
    const fetchReviews = async (productId) => {
        setReviewsLoading(true);
        try {
            const response = await fetch(`${REVIEWS_API_URL}?product_id=${productId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch reviews. Status: ${response.status}`);
            }
            const data = await response.json();
            setReviews(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching reviews:", error);
            setReviews([]);
        } finally {
            setReviewsLoading(false);
        }
    };

    useEffect(() => {
        if (product.id) {
            fetchReviews(product.id);
        }
    }, [product.id]);


    // Calculate average rating
    const averageRating = useMemo(() => {
        if (reviews.length === 0) return 0;
        const total = reviews.reduce((sum, review) => sum + Number(review.rating), 0);
        return total / reviews.length;
    }, [reviews]);

    const addReview = (newReview) => {
        setReviews(prev => [newReview, ...prev]);
    };

    // Handlers
    const handleAddToCart = () => {
        addToCart(product, quantity);
        setNotification({ message: `${product.name} (x${quantity}) added to cart!`, type: 'success' });
    };

    const handleOpenModal = (index) => {
        if (images.length === 0) return;
        setModalIndex(index);
        setIsModalOpen(true);
    };

    const priceToDisplay = product.on_sale && product.sale_price > 0 ? product.sale_price : product.price;

    return (
        <div className="max-w-7xl mx-auto pt-32 pb-12 px-4 md:px-8 font-mono">

            {/* Image Preview Modal */}
            {isModalOpen && (
                <ImagePreviewModal
                    images={images}
                    initialIndex={modalIndex}
                    onClose={() => setIsModalOpen(false)}
                />
            )}

            {/* Back Button */}
            <button
                onClick={navigateToShop}
                className="mb-8 flex items-center gap-2 text-[#888] hover:text-[#CCFF00] transition-colors uppercase text-sm"
            >
                <ArrowLeft size={16} /> Back to Shop
            </button>

            {/* Product Grid (Image & Info) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* 1. Image Gallery */}
                <div>
                    <div
                        className="aspect-square bg-black border border-[#333] rounded-lg overflow-hidden shadow-xl mb-4 cursor-zoom-in"
                        onClick={() => handleOpenModal(images.indexOf(currentImage) !== -1 ? images.indexOf(currentImage) : 0)}
                    >
                        {currentImage ? (
                            <img
                                src={currentImage}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                                onError={() => setCurrentImage(null)}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#888]"><Package size={64} /></div>
                        )}
                    </div>

                    {/* Thumbnail Selector */}
                    {images.length > 1 && (
                        <div className="flex space-x-2 overflow-x-auto pb-2">
                            {images.map((imgUrl, index) => (
                                <img
                                    key={index}
                                    src={imgUrl}
                                    alt={`Thumbnail ${index + 1}`}
                                    className={`w-20 h-20 object-cover rounded cursor-pointer border-2 transition-all ${imgUrl === currentImage ? 'border-[#CCFF00]' : 'border-[#333] hover:border-[#888]'
                                        }`}
                                    onClick={() => setCurrentImage(imgUrl)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. Details & CTA (UNCHANGED) */}
                <div className="space-y-6">
                    <h1 className="font-display text-4xl uppercase text-white">{product.name}</h1>
                    <p className="text-md text-[#888]">{product.category}</p>

                    {/* Display Rating Summary and Link to Reviews */}
                    {reviewsLoading ? (
                        <div className="flex items-center gap-2 border-b border-[#333] pb-3 text-[#888]">
                            <Loader2 size={16} className='animate-spin' /> Loading ratings...
                        </div>
                    ) : (
                        reviews.length > 0 && (
                            <div className="flex items-center gap-2 border-b border-[#333] pb-3">
                                <RatingDisplay rating={averageRating} size={20} showScore={false} />
                                <span className="text-sm text-white">
                                    ({reviews.length} ratings)
                                </span>
                            </div>
                        )
                    )}

                    {/* Price and Sale */}
                    <div>
                        {product.on_sale && product.sale_price > 0 ? (
                            <div className="flex items-baseline space-x-4">
                                <span className="text-3xl font-bold text-[#CCFF00]">
                                    {formatCurrency(product.sale_price, currentCurrency)}
                                </span>
                                <span className="text-lg text-[#888] line-through">
                                    {formatCurrency(product.price, currentCurrency)}
                                </span>
                                <span className="text-sm text-red-500 font-bold uppercase">Sale!</span>
                            </div>
                        ) : (
                            <span className="text-3xl font-bold text-white">
                                {formatCurrency(product.price, currentCurrency)}
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    <div className='border-t border-b border-[#333] py-4'>
                        <p className="text-white whitespace-pre-wrap">{product.description || "No detailed description available."}</p>
                    </div>

                    {/* Quantity Selector & Add to Cart */}
                    <div className="flex items-center space-x-4">
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-20 p-2 bg-black border border-[#333] text-white text-center rounded focus:ring-1 focus:ring-[#CCFF00]"
                        />
                        <button
                            onClick={handleAddToCart}
                            className="flex items-center gap-2 bg-[#CCFF00] text-black px-8 py-3 rounded font-bold uppercase hover:bg-white transition-colors"
                        >
                            <ShoppingCart size={20} /> Add to Cart
                        </button>
                    </div>
                </div>
            </div>

            {/* --- REVIEWS Section (Minimal Display) --- */}
            <div id="reviews" className="mt-16 border-t border-[#333] pt-12">
                <h2 className="font-display text-3xl uppercase text-white mb-8">Customer Rating</h2>

                {/* Using a single column layout now */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* 1. Overall Summary (Minimal) */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333] text-center">
                            <h4 className="font-mono text-xl uppercase text-white mb-2">Overall Score</h4>
                            <div className='flex justify-center items-center flex-col'>

                                {/* Creative Rating Display: Big Score + Stars */}
                                <span className="text-5xl font-bold text-[#CCFF00]">{averageRating.toFixed(1)}</span>
                                <RatingDisplay rating={averageRating} size={24} showScore={false} />
                                <span className="text-sm text-[#888] mt-2">
                                    {reviewsLoading ? 'Loading...' : `Total ratings: ${reviews.length}`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Review Form (Takes up 2 columns on larger screens) */}
                    <div className="lg:col-span-2 space-y-4">
                        <ReviewForm
                            productId={product.id}
                            addReview={addReview}
                            setNotification={setNotification}
                        />
                        {reviews.length > 0 && (
                            <div className='p-4 text-[#888] border border-dashed border-[#333] rounded'>
                                <p className='text-sm font-mono text-center'>
                                    Thank you for your feedback! Your rating contributes to the overall score.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* End of REVIEWS Section */}

        </div>
    );
};