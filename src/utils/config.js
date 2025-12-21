// src/utils/config.js
const BASE = "https://devoltmould.com.ng/api";
export const API_URL = BASE;
export const API_BASE_URL = BASE;
export const REVIEWS_API_URL = `${API_BASE_URL}/reviews.php`;

// Just export the codes for the UI dropdown
export const SUPPORTED_CURRENCIES = ['NGN', 'USD', 'GBP'];

/**
 * Formats currency based on settings exchange rates.
 * @param {number|string} amount - The price in Naira (DB stores raw Naira value).
 * @param {string} currency - 'NGN', 'USD', or 'GBP'.
 * @param {object} settings - The site_config object containing rateUSD, rateGBP.
 */
export const formatCurrency = (amount, currency = 'NGN', settings = {}) => {
    // Handle invalid inputs gracefully
    if (amount === undefined || amount === null || isNaN(amount)) {
        return '0.00';
    }

    // 1. Base Value is Naira (No division by 100 per your instruction)
    let value = parseFloat(amount);

    // 2. Handle Conversions based on Settings
    // We use safe parsing to ensure we don't divide by zero
    if (currency === 'USD' && settings?.rateUSD) {
        const rate = parseFloat(settings.rateUSD);
        if (rate > 0) value = value / rate;
    }
    else if (currency === 'GBP' && settings?.rateGBP) {
        const rate = parseFloat(settings.rateGBP);
        if (rate > 0) value = value / rate;
    }

    // 3. Format with Locale
    let locale = 'en-NG';
    if (currency === 'USD') locale = 'en-US';
    if (currency === 'GBP') locale = 'en-GB';

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        // NGN: 0 decimals (e.g. ₦5,000), Others: 2 decimals (e.g. $12.50)
        minimumFractionDigits: currency === 'NGN' ? 0 : 2,
        maximumFractionDigits: 2
    }).format(value);
};

export const getPrimaryImage = (imagesString) => {
    if (!imagesString) return "https://devoltmould.com.ng/resources/placeholder.jpg";
    // Check if it's already an array (from JSON) or string (from CSV)
    const images = Array.isArray(imagesString) ? imagesString : imagesString.split(',');
    return images[0]?.trim() || "https://devoltmould.com.ng/resources/placeholder.jpg";
};

export const formatCustomerId = (id) => {
    if (!id) return '';
    const baseOffset = 1500;
    const maskedId = parseInt(id) + baseOffset;
    return `MEM-${maskedId.toString().padStart(2, '0')}`;
};