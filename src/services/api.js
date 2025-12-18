// src/services/api.js

// Change this to your actual domain when deploying
// For local testing with PHP, you might use 'http://localhost/devolt/api'
export const API_BASE = 'https://devoltmould.com.ng/api';

export const api = {
    // Fetch all products
    getProducts: async () => {
        try {
            const res = await fetch(`${API_BASE}/products.php`);
            return await res.json();
        } catch (err) {
            console.error("API Error:", err);
            return [];
        }
    },

    // Add a new product
    addProduct: async (productData) => {
        const res = await fetch(`${API_BASE}/products.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        return await res.json();
    },

    // Place an order (We will build orders.php in Part 2)
    placeOrder: async (orderData) => {
        const res = await fetch(`${API_BASE}/orders.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        return await res.json();
    }
};