// src/utils/config.js
const BASE = "/api";
export const API_URL = BASE;
export const API_BASE_URL = BASE;
export const REVIEWS_API_URL = `${API_BASE_URL}/reviews.php`;

// Just export the codes for the UI dropdown
export const SUPPORTED_CURRENCIES = ['NGN', 'USD', 'GBP'];

export const formatCurrency = (amount, currencyCode = 'NGN') => {
    const safeCurrency = currencyCode || 'NGN';
    let locale = 'en-NG';
    if (safeCurrency === 'USD') locale = 'en-US';
    if (safeCurrency === 'GBP') locale = 'en-GB';

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: safeCurrency,
        minimumFractionDigits: safeCurrency === 'NGN' ? 0 : 2,
        maximumFractionDigits: 2
    }).format(amount || 0);
};

export const getPrimaryImage = (imagesArray) => {
    if (Array.isArray(imagesArray) && imagesArray.length > 0) return imagesArray[0];
    return "https://devoltmould.com.ng/resources/placeholder.jpg";
};

export const formatCustomerId = (id) => {
    if (!id) return '';
    const baseOffset = 1500;
    const maskedId = parseInt(id) + baseOffset;
    return `MEM-${maskedId.toString().padStart(2, '0')}`;
};