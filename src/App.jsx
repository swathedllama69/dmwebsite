import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation, Navigate } from 'react-router-dom';
import {
  LogIn, Menu, X, ChevronDown, ShoppingCart as ShoppingCartIcon,
  Package, User, Settings as SettingsIcon, LogOut, LayoutDashboard, Loader2
} from 'lucide-react';

// Import components and utilities
import { API_URL, SUPPORTED_CURRENCIES, API_BASE_URL } from './utils/config.js';
import { applyTheme } from './utils/themeEngine.js';

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
const ProductLookup = ({ products, currentCurrency, addToCart, setNotification, settings }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => String(p.id) === String(id));

  if (!product) return (
    <div className="p-20 text-center flex flex-col items-center justify-center bg-black min-h-screen">
      <Loader2 className="animate-spin text-primary mb-4" size={40} />
      <p className="text-white font-mono uppercase tracking-widest text-xs">Locating Product...</p>
    </div>
  );

  return (
    <ProductDetail
      product={product}
      currentCurrency={currentCurrency}
      navigateToShop={() => navigate('/')}
      addToCart={addToCart}
      setNotification={setNotification}
      settings={settings}
    />
  );
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialCart = JSON.parse(localStorage.getItem('devoltCart')) || [];

  // --- BASE PATH FOR RESOURCES ---
  const RESOURCE_URL = "http://devoltmould.com.ng/resources";

  // --- PERSISTENT SESSION STATE ---
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('admin_session') === 'true';
  });

  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(() => {
    return localStorage.getItem('isCustomerLoggedIn') === 'true';
  });

  const [customerData, setCustomerData] = useState(() => {
    const saved = localStorage.getItem('customer_user');
    return saved ? JSON.parse(saved) : { name: 'Guest User', email: '', user_id: null, ordersCount: 0 };
  });

  // --- OTHER STATES ---
  const [currentCurrency, setCurrentCurrency] = useState('NGN');
  const [notification, setNotification] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cart, setCart] = useState(initialCart);
  const [headerStyle, setHeaderStyle] = useState('dark');

  const [settings, setSettings] = useState({
    heroVideoUrl: `${RESOURCE_URL}/default_hero.mp4`,
    heroSlogan: 'Moulding the New Standard',
    scrollingText: 'WORLDWIDE SHIPPING AVAILABLE • LIMITED EDITION DROPS • ',
    bottomBannerImages: '',
    galleryImages: `${RESOURCE_URL}/gallery1.jpg, ${RESOURCE_URL}/gallery2.jpg`,
    galleryText: 'INNOVATION GALLERY: NEW VISION.',
    showNewArrivals: '1', showSaleItems: '1', showImageGallery: '1', showCollectionsLink: '0',
    active_theme: 'devolt-punk',
    active_font_style: 'style-a'
  });

  // --- SYNC STATE TO LOCALSTORAGE ---
  useEffect(() => { localStorage.setItem('devoltCart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('admin_session', isAdminLoggedIn); }, [isAdminLoggedIn]);
  useEffect(() => {
    localStorage.setItem('isCustomerLoggedIn', isCustomerLoggedIn);
    localStorage.setItem('customer_user', JSON.stringify(customerData));
  }, [isCustomerLoggedIn, customerData]);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // --- AUTH & SESSION UTILITIES ---
  const verifySession = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/verify_session.php`);
      const data = await response.json();
      if (!data.authenticated) {
        setIsAdminLoggedIn(false);
        setIsCustomerLoggedIn(false);
      }
    } catch (e) { console.error("Session sync failed"); }
  }, []);

  const handleCustomerLogOut = () => {
    setIsCustomerLoggedIn(false);
    setCustomerData({ name: 'Guest User', email: '', user_id: null, ordersCount: 0 });
    setNotification({ message: "Logged out safely.", type: 'default' });
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const handleAdminToggle = () => {
    if (isAdminLoggedIn) {
      setIsAdminLoggedIn(false);
      navigate('/');
    } else { navigate('/admin'); }
    setIsMobileMenuOpen(false);
  };

  // --- DATA FETCHING ---
  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings.php`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setSettings(prev => ({ ...prev, ...data }));

      // APPLY THEME ENGINE (Colors & Fonts)
      const currentHeaderStyle = applyTheme(data.active_theme || 'devolt-punk', data.active_font_style || 'style-a');
      setHeaderStyle(currentHeaderStyle);
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
    verifySession();
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchProducts, fetchSettings, verifySession]);

  // --- CART LOGIC ---
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
    <div className="min-h-screen font-body overflow-x-hidden transition-colors duration-500">
      <GlobalStyles />
      <ScrollToTop />

      {/* NAVIGATION - Dynamic Background and Text Color */}
      <nav className={`fixed w-full z-50 top-0 left-0 px-4 md:px-8 flex justify-center items-center transition-all duration-300 pt-4 ${isScrolled ? 'bg-header/95 backdrop-blur-md pb-4 shadow-xl' : 'pb-6'}`}>
        <div className="w-full max-w-7xl flex justify-between items-center h-12 relative">

          {/* LOGO AREA - Dynamic Logo and Brand Text */}
          <div className="flex items-center flex-shrink-0 relative">
            <button onClick={() => navigate('/')} className="hover:opacity-80 transition-opacity flex items-center group relative h-12">
              <img
                src={headerStyle === 'light' ? `${RESOURCE_URL}/devolt_logo.png` : `${RESOURCE_URL}/devolt_logo2.png`}
                alt="Logo"
                className="h-20 md:h-24 w-auto absolute -top-2 md:-top-6 pt-1 left-0 transition-transform group-hover:scale-105" />
              <span
                className="text-2xl md:text-3xl tracking-widest uppercase ml-20 md:ml-28 nav-text-dynamic"
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
              className={`transition-all hover:text-primary ${location.pathname === '/' ? 'text-primary border-b-4 border-primary pb-1' : 'nav-text-dynamic'}`}
            >
              Shop
            </button>

            {settings.showCollectionsLink === '1' && (
              <button
                onClick={() => navigate('/collections')}
                className={`transition-all hover:text-primary ${location.pathname === '/collections' ? 'text-primary border-b-4 border-primary pb-1' : 'nav-text-dynamic'}`}
              >
                Collections
              </button>
            )}

            {isAdminLoggedIn && (
              <button
                onClick={() => navigate('/admin')}
                className={`flex items-center gap-2 transition-colors border-l-2 border-white/10 pl-10 ${location.pathname.startsWith('/admin') ? 'text-primary' : 'text-red-500 hover:text-red-400'}`}
              >
                <SettingsIcon size={20} /> ADMIN
              </button>
            )}
          </div>

          {/* ACTIONS AREA */}
          <div className="flex items-center gap-4 md:gap-6 font-mono h-full">
            {isCustomerLoggedIn ? (
              <div className="hidden lg:flex items-center gap-6">
                <button onClick={() => navigate('/account')} className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors ${location.pathname.startsWith('/account') ? 'text-primary' : 'nav-text-dynamic'}`}>
                  <LayoutDashboard size={20} /> Account
                </button>
                <button onClick={handleCustomerLogOut} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors">
                  <LogOut size={18} /> Logout
                </button>
              </div>
            ) : (
              <button onClick={() => navigate('/login')} className={`hidden lg:flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors ${location.pathname === '/login' ? 'text-primary' : 'nav-text-dynamic'}`}>
                <LogIn size={20} /> Login
              </button>
            )}

            <div className="relative hidden md:block">
              <select
                value={currentCurrency}
                onChange={(e) => setCurrentCurrency(e.target.value)}
                className="appearance-none bg-card border-2 border-white/10 text-white font-mono text-xs font-black uppercase px-4 py-2 pr-8 focus:outline-none focus:border-primary rounded-xl cursor-pointer"
              >
                {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary" />
            </div>

            <button
              className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl transition-all border-2 active:scale-90 ${location.pathname === '/cart' ? 'bg-primary border-primary text-black shadow-lg shadow-primary/30' : 'bg-white/5 border-white/10 text-white hover:border-primary'}`}
              onClick={handleCartToggle}
            >
              <ShoppingCartIcon size={22} className={location.pathname === '/cart' ? 'text-black' : 'text-primary'} />
              <span className="font-black text-lg">{cartItemCount}</span>
            </button>

            <button className="md:hidden text-primary" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`fixed inset-0 bg-black/98 backdrop-blur-3xl z-[60] md:hidden transition-all duration-500 flex flex-col items-center justify-center p-8 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <button className="absolute top-8 right-8 text-white p-2" onClick={() => setIsMobileMenuOpen(false)}><X size={40} /></button>
        <div className="flex flex-col items-center space-y-8 font-mono text-3xl uppercase font-black w-full text-center">
          <button className={`w-full py-5 rounded-2xl ${location.pathname === '/' ? 'bg-primary text-black shadow-xl shadow-primary/20' : 'text-white border border-white/10'}`} onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }}>Shop</button>

          {settings.showCollectionsLink === '1' && (
            <button className={`w-full py-5 rounded-2xl ${location.pathname === '/collections' ? 'bg-primary text-black shadow-xl shadow-primary/20' : 'text-white border border-white/10'}`} onClick={() => { navigate('/collections'); setIsMobileMenuOpen(false); }}>Collections</button>
          )}

          <button
            className="w-full py-5 border border-white/10 rounded-2xl text-white font-black flex items-center justify-center gap-3"
            onClick={() => { navigate(isCustomerLoggedIn ? '/account' : '/login'); setIsMobileMenuOpen(false); }}
          >
            {isCustomerLoggedIn ? 'Account' : 'Login'}
          </button>

          <button className="w-full py-5 border border-white/10 rounded-2xl text-white flex items-center justify-center gap-4" onClick={() => { navigate('/cart'); setIsMobileMenuOpen(false); }}>
            <ShoppingCartIcon size={24} className="text-primary" /> Cart ({cartItemCount})
          </button>
        </div>
      </div>

      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<ShopView products={products} loading={loading} error={error} fetchProducts={fetchProducts} currentCurrency={currentCurrency} addToCart={addToCart} setNotification={setNotification} setProductId={(id) => navigate(`/product/${id}`)} settings={settings} />} />
          <Route path="/collections" element={<CollectionsView products={products} loading={loading} error={error} currentCurrency={currentCurrency} addToCart={addToCart} setNotification={setNotification} setProductId={(id) => navigate(`/product/${id}`)} />} />
          <Route path="/product/:id" element={<ProductLookup products={products} currentCurrency={currentCurrency} addToCart={addToCart} setNotification={setNotification} settings={settings} />} />
          <Route path="/cart" element={<CheckoutProcess cart={cart} currentCurrency={currentCurrency} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} clearCart={clearCart} setNotification={setNotification} userId={customerData?.user_id || null} customerEmail={customerData?.email || null} customerName={customerData?.name || null} navigateToShop={() => navigate('/')} />} />
          <Route path="/reset-password" element={<ResetPassword setNotification={setNotification} />} />

          {/* LOGIC: Redirect to account if logged in, else show login */}
          <Route path="/login" element={isCustomerLoggedIn ? <Navigate to="/account" /> : <LoginView setIsCustomerLoggedIn={setIsCustomerLoggedIn} setCustomerData={setCustomerData} setNotification={setNotification} navigateToAccount={() => navigate('/account')} />} />
          <Route path="/account" element={isCustomerLoggedIn ? <CustomerAccount customer={customerData} handleCustomerLogOut={handleCustomerLogOut} currentCurrency={currentCurrency} setNotification={setNotification} /> : <Navigate to="/login" />} />

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


/*// --- LOGO BASE URL ---
  const RESOURCE_URL = "http://devoltmould.com.ng/resources";


  const [settings, setSettings] = useState({
    heroVideoUrl: 'http://devoltmould.com.ng/resources/default_hero.mp4',
  
    galleryImages: 'http://devoltmould.com.ng/resources/gallery1.jpg, http://devoltmould.com.ng/resources/gallery2.jpg',*/
