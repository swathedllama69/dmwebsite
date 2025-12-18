import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation, Navigate } from 'react-router-dom';
import {
  LogIn, Menu, X, ChevronDown, ShoppingCart as ShoppingCartIcon,
  Package, User, Settings as SettingsIcon, LogOut, LayoutDashboard, Loader2
} from 'lucide-react';

// Import components and utilities
// UPDATED: Removed CURRENCY_RATES, added SUPPORTED_CURRENCIES
import { API_URL, SUPPORTED_CURRENCIES, API_BASE_URL } from './utils/config.js';

// CORE APPLICATION COMPONENTS
import { ShopView } from './components/ShopView.jsx';
import { CollectionsView } from './components/CollectionsView.jsx';
import { AdminDashboard } from './components/Admin.jsx';
import { CheckoutProcess } from './components/CheckoutProcess.jsx';
import { ProductDetail } from './components/ProductDetail.jsx';
import { OrderDetail } from './components/OrderDetail.jsx';
import AdminOrderDetail from './components/AdminOrderDetail.jsx';
import { CustomerOrderDetail } from './components/CustomerOrderDetail.jsx';

import { GlobalStyles, NotificationToast } from './components/UI.jsx';
import { Footer } from './components/Footer.jsx';
import { AddProduct } from './components/AddProduct.jsx';
import { EditProduct } from './components/EditProduct.jsx';

// FOOTER IMPORTS
import { AboutUs } from './components/AboutUs.jsx';
import { ContactPage } from './components/ContactPage.jsx';
import { ShippingPolicy } from './components/ShippingPolicy.jsx';
import { ReturnsPolicy } from './components/ReturnsPolicy.jsx';

// CUSTOMER ACCOUNT IMPORTS
import { LoginView } from './components/RegisterView.jsx';
import { CustomerAccount } from './components/CustomerAccount.jsx';
import { ResetPassword } from './components/ResetPassword.jsx';

/**
 * SCROLL UTILITY
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- Helper Component for Product Details ---
const ProductLookup = ({ products, currentCurrency, addToCart, setNotification }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => String(p.id) === String(id));

  if (!product) return (
    <div className="p-20 text-center flex flex-col items-center justify-center bg-black min-h-screen">
      <Loader2 className="animate-spin text-[#CCFF00] mb-4" size={40} />
      <p className="text-white font-mono uppercase tracking-widest text-xs">Locating Product...</p>
    </div>
  );

  function App() {
    useEffect(() => {
      // 1. Fetch theme from the PHP API
      fetch('/api/theme.php')
        .then(res => res.json())
        .then(data => {
          // 2. Apply it to the HTML tag
          document.documentElement.setAttribute('data-theme', data.theme);
        })
        .catch(err => console.error("Theme fetch failed", err));
    }, []);
  }

  return (
    <ProductDetail
      product={product}
      currentCurrency={currentCurrency}
      navigateToShop={() => navigate('/')}
      addToCart={addToCart}
      setNotification={setNotification}
      GlobalStyles settings={settings}
    />
  );
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialCart = JSON.parse(localStorage.getItem('devoltCart')) || [];

  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: 'Guest User', email: '', user_id: null, ordersCount: 0,
  });

  const [currentCurrency, setCurrentCurrency] = useState('NGN');
  const [notification, setNotification] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => localStorage.getItem('admin_session') === 'true');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cart, setCart] = useState(initialCart);

  const [settings, setSettings] = useState({
    heroVideoUrl: 'http://devoltmould.com.ng/resources/default_hero.mp4',
    heroSlogan: 'Moulding the New Standard',
    scrollingText: 'WORLDWIDE SHIPPING AVAILABLE • LIMITED EDITION DROPS • ',
    bottomBannerImages: '',
    galleryImages: 'http://devoltmould.com.ng/resources/gallery1.jpg, http://devoltmould.com.ng/resources/gallery2.jpg',
    galleryText: 'INNOVATION GALLERY: NEW VISION.',
    showNewArrivals: '1', showSaleItems: '1', showImageGallery: '1', showCollectionsLink: '0',
  });

  const LOGO_URL = "http://devoltmould.com.ng/resources/devolt_logo2.png";


  useEffect(() => { localStorage.setItem('devoltCart', JSON.stringify(cart)); }, [cart]);
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const storedUser = localStorage.getItem('customer_user');
    if (storedUser) {
      setCustomerData(JSON.parse(storedUser));
      setIsCustomerLoggedIn(true);
    }
  }, []);

  const handleCustomerLogOut = () => {
    setIsCustomerLoggedIn(false);
    setCustomerData({ name: 'Guest User', email: '', user_id: null, ordersCount: 0 });
    localStorage.removeItem('customer_user');
    setNotification({ message: "Logged out safely.", type: 'default' });
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings.php`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setSettings(prev => ({ ...prev, ...data }));
    } catch (e) { console.error("Settings error:", e); }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/products.php`);
      const data = await response.json();
      setProducts(data.sort((a, b) => b.id - a.id));
    } catch (err) { setError(`Connection failed: ${err.message}`); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchSettings();
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchProducts, fetchSettings]);

  //Theme
  useEffect(() => {
    const applyTheme = () => {
      const theme = settings?.active_theme || 'devolt-punk';
      document.documentElement.setAttribute('data-theme', theme);
      // This ensures the body also gets the attribute in case your CSS targets body[data-theme]
      document.body.setAttribute('data-theme', theme);
      console.log("Theme Engine: Applying ->", theme);
    };

    applyTheme();
  }, [settings]);


  const handleAdminToggle = () => {
    if (isAdminLoggedIn) {
      setIsAdminLoggedIn(false);
      localStorage.removeItem('admin_session');
      navigate('/');
    } else { navigate('/admin'); }
    setIsMobileMenuOpen(false);
  };

  const addToCart = (product, quantity) => {
    setCart(prevCart => {
      const itemIndex = prevCart.findIndex(item => item.product.id === product.id);
      if (itemIndex > -1) {
        return prevCart.map((item, index) => index === itemIndex ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prevCart, { product, quantity }];
    });
    setNotification({ message: `Added to cart`, type: 'success' });
  };

  const updateCartQuantity = (id, newQuantity) => {
    setCart(prevCart => newQuantity <= 0 ? prevCart.filter(item => item.product.id !== id) : prevCart.map(item => item.product.id === id ? { ...item, quantity: newQuantity } : item));
  };

  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== id));
    setNotification({ message: "Item removed.", type: 'default' });
  };

  const clearCart = () => setCart([]);
  const handleCartToggle = () => location.pathname === '/cart' ? navigate('/') : navigate('/cart');

  return (
    <div className="bg-[#080808] text-[#EAEAEA] min-h-screen font-sans overflow-x-hidden">
      <GlobalStyles />
      <ScrollToTop />

      {/* NAVIGATION */}
      <nav className={`fixed w-full z-50 top-0 left-0 px-4 md:px-8 flex justify-center items-center transition-all duration-300 pt-4 ${isScrolled ? 'bg-[#080808]/95 backdrop-blur-md pb-4 shadow-xl' : 'pb-6'}`}>
        <div className="w-full max-w-7xl flex justify-between items-center h-12 relative">

          {/* LOGO AREA */}
          <div className="flex items-center flex-shrink-0 relative">
            <button onClick={() => navigate('/')} className="hover:opacity-80 transition-opacity flex items-center group relative h-12">
              <img
                src={LOGO_URL}
                alt="Logo"
                className="h-20 md:h-24 w-auto absolute -top-2 md:-top-6 pt-1 left-0 transition-transform group-hover:scale-105" />
              <span
                className="text-2xl md:text-3xl tracking-widest uppercase text-white ml-20 md:ml-28"
                style={{ fontFamily: "'Cinzel', serif", fontWeight: 700 }}
              >
                - DEVOLT -
              </span>
            </button>
          </div>

          {/* MAIN LINKS */}
          <div className="flex items-center gap-12 font-mono text-xl uppercase tracking-[0.2em] h-full hidden md:flex font-black">
            <button
              onClick={() => navigate('/')}
              className={`transition-all hover:text-[#CCFF00] ${location.pathname === '/' ? 'text-[#CCFF00] border-b-4 border-[#CCFF00] pb-1' : 'text-white'}`}
            >
              Shop
            </button>

            {settings.showCollectionsLink === '1' && (
              <button
                onClick={() => navigate('/collections')}
                className={`transition-all hover:text-[#CCFF00] ${location.pathname === '/collections' ? 'text-[#CCFF00] border-b-4 border-[#CCFF00] pb-1' : 'text-white'}`}
              >
                Collections
              </button>
            )}

            {isAdminLoggedIn && (
              <button
                onClick={() => navigate('/admin')}
                className={`flex items-center gap-2 transition-colors border-l-2 border-white/10 pl-10 ${location.pathname.startsWith('/admin') ? 'text-[#CCFF00]' : 'text-red-500 hover:text-red-400'}`}
              >
                <SettingsIcon size={20} /> ADMIN
              </button>
            )}
          </div>

          {/* ACTIONS AREA */}
          <div className="flex items-center gap-4 md:gap-6 font-mono h-full">
            {isCustomerLoggedIn ? (
              <div className="hidden lg:flex items-center gap-6">
                <button onClick={() => navigate('/account')} className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors ${location.pathname.startsWith('/account') ? 'text-[#CCFF00]' : 'text-white'}`}>
                  <LayoutDashboard size={20} /> Account
                </button>
                <button onClick={handleCustomerLogOut} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors">
                  <LogOut size={18} /> Logout
                </button>
              </div>
            ) : (
              <button onClick={() => navigate('/login')} className={`hidden lg:flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors ${location.pathname === '/login' ? 'text-[#CCFF00]' : 'text-white'}`}>
                <LogIn size={20} /> Login
              </button>
            )}

            {/* CURRENCY SELECTOR - UPDATED TO USE SUPPORTED_CURRENCIES */}
            <div className="relative hidden md:block">
              <select
                value={currentCurrency}
                onChange={(e) => setCurrentCurrency(e.target.value)}
                className="appearance-none bg-[#111] border-2 border-white/10 text-white font-mono text-xs font-black uppercase px-4 py-2 pr-8 focus:outline-none focus:border-[#CCFF00] rounded-xl cursor-pointer"
              >
                {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#CCFF00]" />
            </div>

            <button
              className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl transition-all border-2 active:scale-90 ${location.pathname === '/cart' ? 'bg-[#CCFF00] border-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/30' : 'bg-white/5 border-white/10 text-white hover:border-[#CCFF00]'}`}
              onClick={handleCartToggle}
            >
              <ShoppingCartIcon size={22} className={location.pathname === '/cart' ? 'text-black' : 'text-[#CCFF00]'} />
              <span className="font-black text-lg">{cartItemCount}</span>
            </button>

            <button className="md:hidden text-[#CCFF00]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`fixed inset-0 bg-black/98 backdrop-blur-3xl z-[60] md:hidden transition-all duration-500 flex flex-col items-center justify-center p-8 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <button className="absolute top-8 right-8 text-white p-2" onClick={() => setIsMobileMenuOpen(false)}><X size={40} /></button>
        <div className="flex flex-col items-center space-y-8 font-mono text-3xl uppercase font-black w-full text-center">
          <button className={`w-full py-5 rounded-2xl ${location.pathname === '/' ? 'bg-[#CCFF00] text-black shadow-xl shadow-[#CCFF00]/20' : 'text-white border border-white/10'}`} onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }}>Shop</button>

          {settings.showCollectionsLink === '1' && (
            <button className={`w-full py-5 rounded-2xl ${location.pathname === '/collections' ? 'bg-[#CCFF00] text-black shadow-xl shadow-[#CCFF00]/20' : 'text-white border border-white/10'}`} onClick={() => { navigate('/collections'); setIsMobileMenuOpen(false); }}>Collections</button>
          )}

          <button
            className={`w-full py-5 border border-white/10 rounded-2xl text-white font-black flex items-center justify-center gap-3 ${isCustomerLoggedIn ? 'bg-white/5' : ''}`}
            onClick={() => { navigate(isCustomerLoggedIn ? '/account' : '/login'); setIsMobileMenuOpen(false); }}
          >
            {isCustomerLoggedIn ? <LayoutDashboard size={24} /> : <LogIn size={24} />}
            {isCustomerLoggedIn ? 'Account' : 'Login'}
          </button>

          {isCustomerLoggedIn && (
            <button className="w-full py-5 border border-red-500/20 rounded-2xl text-red-500 font-black flex items-center justify-center gap-3" onClick={handleCustomerLogOut}>
              <LogOut size={24} /> Logout
            </button>
          )}

          <button className="w-full py-5 border border-white/10 rounded-2xl text-white flex items-center justify-center gap-4" onClick={() => { navigate('/cart'); setIsMobileMenuOpen(false); }}>
            <ShoppingCartIcon size={24} className="text-[#CCFF00]" /> Cart ({cartItemCount})
          </button>

          {isAdminLoggedIn && (
            <button className="text-red-500 text-xl font-bold pt-8 border-t border-white/10 w-full flex items-center justify-center gap-2" onClick={handleAdminToggle}>
              <SettingsIcon size={20} /> Admin Logout
            </button>
          )}
        </div>
      </div>

      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<ShopView products={products} loading={loading} error={error} fetchProducts={fetchProducts} currentCurrency={currentCurrency} addToCart={addToCart} setNotification={setNotification} setProductId={(id) => navigate(`/product/${id}`)} settings={settings} />} />
          <Route path="/collections" element={<CollectionsView products={products} loading={loading} error={error} currentCurrency={currentCurrency} addToCart={addToCart} setNotification={setNotification} setProductId={(id) => navigate(`/product/${id}`)} />} />
          <Route path="/product/:id" element={<ProductLookup products={products} currentCurrency={currentCurrency} addToCart={addToCart} setNotification={setNotification} />} />
          <Route path="/cart" element={<CheckoutProcess cart={cart} currentCurrency={currentCurrency} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} clearCart={clearCart} setNotification={setNotification} userId={customerData?.user_id || null} customerEmail={customerData?.email || null} customerName={customerData?.name || null} navigateToShop={() => navigate('/')} />} />
          <Route path="/reset-password" element={<ResetPassword setNotification={setNotification} />} />
          <Route path="/login" element={isCustomerLoggedIn ? <CustomerAccount customer={customerData} handleCustomerLogOut={handleCustomerLogOut} currentCurrency={currentCurrency} setNotification={setNotification} /> : <LoginView setIsCustomerLoggedIn={setIsCustomerLoggedIn} setCustomerData={setCustomerData} setNotification={setNotification} navigateToAccount={() => navigate('/account')} />} />
          <Route path="/account" element={isCustomerLoggedIn ? <CustomerAccount customer={customerData} handleCustomerLogOut={handleCustomerLogOut} currentCurrency={currentCurrency} setNotification={setNotification} /> : <LoginView setIsCustomerLoggedIn={setIsCustomerLoggedIn} setCustomerData={setCustomerData} setNotification={setNotification} navigateToAccount={() => navigate('/account')} />} />
          <Route path="/account/orders/:id" element={<CustomerOrderDetail setNotification={setNotification} currentCurrency={currentCurrency} />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/shipping" element={<ShippingPolicy />} />
          <Route path="/returns" element={<ReturnsPolicy />} />
          <Route path="/admin" element={<AdminDashboard products={products} loading={loading} error={error} fetchProducts={fetchProducts} setNotification={setNotification} isAdminLoggedIn={isAdminLoggedIn} setIsAdminLoggedIn={setIsAdminLoggedIn} settings={settings} fetchSettings={fetchSettings} currentCurrency={currentCurrency} />} />
          <Route path="/admin/order/:id" element={<AdminOrderDetail setNotification={setNotification} currentCurrency={currentCurrency} />} />
          <Route path="/add-product" element={<AddProduct setNotification={setNotification} />} />
          <Route path="/edit-product/:id" element={<EditProduct setNotification={setNotification} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <NotificationToast notification={notification} setNotification={setNotification} />
      <Footer handleAdminToggle={handleAdminToggle} isAdminLoggedIn={isAdminLoggedIn} />
    </div>
  );
}