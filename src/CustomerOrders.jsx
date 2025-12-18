import React, { useState, useEffect, useCallback } from 'react';
import { Package, RefreshCw, Loader2, AlertCircle, ShoppingCart as ShoppingCartIcon, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../utils/config'; // Assume API_BASE_URL is here

const StatusBadge = ({ status }) => {
    let color = 'text-gray-400 bg-gray-900';
    let icon = Package;
    // (Status logic copied from AdminOrderDetail for consistency)
    switch (status) {
        case 'Pending': color = 'text-yellow-400 bg-yellow-900/20'; icon = RefreshCw; break;
        case 'Processing': color = 'text-blue-400 bg-blue-900/20'; icon = Package; break;
        case 'Shipped': color = 'text-purple-400 bg-purple-900/20'; icon = Package; break;
        case 'Completed': color = 'text-green-400 bg-green-900/20'; icon = AlertCircle; break;
        case 'Cancelled': color = 'text-red-400 bg-red-900/20'; icon = AlertCircle; break;
        default: break;
    }
    const IconComponent = icon;
    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
            <IconComponent size={14} />
            {status}
        </span>
    );
};

const formatPrice = (cents) => {
    const amount = (cents / 100).toFixed(2);
    return `₦${amount}`; // Adjust currency symbol as needed
};

// --- MAIN COMPONENT ---
export const CustomerOrders = ({ currentCurrency, navigateToOrderDetails }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // MOCK USER ID: In a real application, this would come from the authentication context.
    // We assume the customer is logged in, so we provide a mock ID for testing.
    // If you are testing, make sure this user_id exists in your orders table.
    const mockUserId = 1;

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);

        // Fetch orders specific to the mock user ID
        const url = `${API_BASE_URL}/orders.php?user_id=${mockUserId}`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                const rawResponse = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}. Response: ${rawResponse}`);
            }

            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setError(err.message);
            console.error("Customer Fetch Orders Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="animate-spin text-[#CCFF00]" size={32} />
                    <p className="ml-3 text-lg text-gray-400">Loading your orders...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center p-8 bg-red-900/20 border border-red-700 rounded-lg">
                    <AlertCircle className="text-red-500 mb-4" size={32} />
                    <h3 className="text-xl font-bold text-red-400">Failed to load orders</h3>
                    <p className="text-red-600 font-mono text-sm mt-2">{error}</p>
                    <button onClick={fetchOrders} className="mt-4 px-4 py-2 bg-[#CCFF00] text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors">
                        <RefreshCw size={18} className="inline mr-1" /> Retry
                    </button>
                </div>
            );
        }

        if (orders.length === 0) {
            return (
                <div className="text-center p-10 bg-[#1f1f1f] rounded-lg">
                    <ShoppingCartIcon className="mx-auto text-gray-600" size={48} />
                    <h3 className="text-xl font-bold text-gray-300 mt-4">No orders found</h3>
                    <p className="text-gray-500 mt-2">Time to explore our latest molds!</p>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Order ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Items</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Total</th>
                            <th scope="col" className="relative px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-[#151515] divide-y divide-gray-700">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-[#1f1f1f] transition-colors cursor-pointer" onClick={() => navigateToOrderDetails(order.id)}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">{order.order_number_display || `#${order.id}`}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <StatusBadge status={order.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-300">{order.item_count}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-[#CCFF00]">
                                    {formatPrice(order.total_cents)} {currentCurrency}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => navigateToOrderDetails(order.id)} className="text-[#CCFF00] hover:text-white transition-colors">
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold text-[#CCFF00] mb-8 border-b border-gray-700 pb-4">
                <button onClick={() => navigateToOrderDetails('/account')} className="mr-4 text-gray-400 hover:text-[#CCFF00] transition-colors">
                    <ArrowLeft size={24} className="inline" />
                </button>
                Your Order History
            </h1>

            {renderContent()}

        </div>
    );
};