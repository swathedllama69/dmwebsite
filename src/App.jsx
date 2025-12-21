import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation, Navigate, Link } from 'react-router-dom';
import {
  LogIn, Menu, X, ShoppingCart as ShoppingCartIcon,
  Package, User, LogOut, LayoutDashboard, Loader2, UserCircle, ChevronRight, ShieldCheck,
  ChevronDown, Globe
} from 'lucide-react';

// Import components and utilities
import { API_URL, API_BASE_URL } from './utils/config.js';
import { applyTheme } from './utils/themeEngine.js';

// CORE APPLICATION COMPONENTS
import { ShopView } from './components/ShopView.jsx';
import { CollectionsView } from './components/CollectionsView.jsx';
import { AdminDashboard } from './components/Admin.jsx';
import { CheckoutProcess } from './components/CheckoutProcess.jsx';
import { ProductDetail } from './components/ProductDetail.jsx';
import AdminOrderDetail from './components/AdminOrderDetail.jsx';
import { CustomerOrderDetail } from './components/CustomerOrderDetail.jsx';
import { AdminLogin } from './components/AdminLogin.jsx';

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

/**
 * PRODUCT LOOKUP HELPER
 */
const ProductLookup = ({ products, currentCurrency, addToCart, setNotification, settings, setShowLoginModal, user, headerStyle }) => {
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
      user={user}
      onLoginClick={() => setShowLoginModal(true)}
      currentCurrency={currentCurrency}
      navigateToShop={() => navigate('/')}
      addToCart={addToCart}
      setNotification={setNotification}
      settings={settings}
      headerStyle={headerStyle}
    />
  );
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialCart = JSON.parse(localStorage.getItem('devoltCart')) || [];
  const RESOURCE_URL = "http://devoltmould.com.ng/resources";

  // --- 1. SESSION STATE ---
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => localStorage.getItem('admin_session') === 'true');
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(() => localStorage.getItem('isCustomerLoggedIn') === 'true');
  const [customerData, setCustomerData] = useState(() => {
    const saved = localStorage.getItem('customer_user');
    return saved ? JSON.parse(saved) : null;
  });

  // --- 2. APP STATE ---
  const [currentCurrency, setCurrentCurrency] = useState('NGN');
  const [notification, setNotification] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cart, setCart] = useState(initialCart);
  const [headerStyle, setHeaderStyle] = useState('dark');
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Initialize settings with defaults (prevent divide by zero)
  const [settings, setSettings] = useState({
    active_theme: 'devolt-punk',
    active_font_style: 'style-a',
    rateUSD: '1600',
    rateGBP: '1850'
  });

  // --- 3. PERSISTENCE ---
  useEffect(() => { localStorage.setItem('devoltCart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('admin_session', isAdminLoggedIn); }, [isAdminLoggedIn]);
  useEffect(() => {
    localStorage.setItem('isCustomerLoggedIn', isCustomerLoggedIn);
    if (customerData) localStorage.setItem('customer_user', JSON.stringify(customerData));
  }, [isCustomerLoggedIn, customerData]);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // --- 4. DATA FETCHING ---
  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings.php`);
      const data = await response.json();
      setSettings(prev => ({ ...prev, ...data }));
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
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchProducts, fetchSettings]);

  // --- 5. UTILITIES ---
  const handleLogOut = () => {
    setIsAdminLoggedIn(false);
    setIsCustomerLoggedIn(false);
    setCustomerData(null);
    localStorage.clear();
    setNotification({ message: "SECURELY_LOGGED_OUT", type: 'default' });
    navigate('/');
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
  };

  const updateCartQuantity = (id, newQuantity) => {
    setCart(prevCart => newQuantity <= 0 ? prevCart.filter(item => item.product.id !== id) : prevCart.map(item => item.product.id === id ? { ...item, quantity: newQuantity } : item));
  };

  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== id));
  };

  // Helper to check if dashboard link is active (Admin or Customer)
  const dashboardPath = isAdminLoggedIn ? "/admin" : "/account";
  // Strict check: Is the exact path OR does it start with path/ (to handle sub-routes like /admin/orders)
  const isDashboardActive = location.pathname === dashboardPath || location.pathname.startsWith(`${dashboardPath}/`);

  return (
    <div className="min-h-screen font-body overflow-x-hidden transition-colors duration-500 bg-background text-current">
      <GlobalStyles />
      <ScrollToTop />

      {/* HEADER */}
      <nav className={`fixed w-full z-50 top-0 left-0 px-4 md:px-8 flex justify-center items-center transition-all duration-300 pt-2 
        ${(isScrolled || headerStyle === 'light') ? 'bg-header pb-2 shadow-xl' : 'bg-transparent pb-4'}`}>

        <div className="w-full max-w-7xl flex justify-between items-center h-16 relative">

          {/* LOGO & BRANDING */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="group flex items-center gap-3">
              <img
                src={headerStyle === 'light' ? `${RESOURCE_URL}/devolt_logo.png` : `${RESOURCE_URL}/devolt_logo2.png`}
                alt="Devolt Logo"
                className="h-16 md:h-20 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span
                className="text-xl md:text-2xl tracking-tighter uppercase nav-text-dynamic font-black leading-none"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                - DEVOLT -
              </span>
            </Link>
          </div>

          {/* CENTER LINKS */}
          <div className="hidden md:flex items-center font-heading text-[14px] uppercase tracking-[0.2em] font-black">

            <Link to="/" className={`flex items-center gap-2 px-4 transition-all hover:text-primary ${location.pathname === '/' ? 'text-primary' : 'nav-text-dynamic'}`}>
              <Package size={22} /> Home
            </Link>

            <div className="h-4 w-[1px] bg-white/10" />

            <Link to="/collections" className={`flex items-center gap-2 px-4 transition-all hover:text-primary ${location.pathname === '/collections' ? 'text-primary' : 'nav-text-dynamic'}`}>
              <LayoutDashboard size={14} /> Collections
            </Link>

            {/* DYNAMIC DASHBOARD LINK (Fixed Active State) */}
            {(isAdminLoggedIn || isCustomerLoggedIn) && (
              <>
                <div className="h-4 w-[1px] bg-white/10" />
                <Link
                  to={dashboardPath}
                  className={`flex items-center gap-2 px-5 py-2 mx-2 transition-all rounded-full border ${isDashboardActive
                    ? 'bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]'
                    : 'bg-transparent border-transparent nav-text-dynamic hover:bg-white/5'}`}
                >
                  <ShieldCheck size={14} /> Dashboard
                </Link>
              </>
            )}
          </div>

          {/* ACTIONS AREA */}
          <div className="flex items-center gap-3 md:gap-5">

            {/* CURRENCY CONVERTER */}
            <div className="hidden md:flex relative group">
              <button className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-white/5 nav-text-dynamic transition-all text-[10px] font-black">
                <Globe size={14} /> {currentCurrency} <ChevronDown size={10} />
              </button>
              <div className="absolute top-full right-0 mt-2 w-24 bg-card border border-white/10 rounded-xl overflow-hidden shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {['NGN', 'USD', 'GBP'].map(curr => (
                  <button
                    key={curr}
                    onClick={() => setCurrentCurrency(curr)}
                    className={`w-full text-left px-4 py-3 text-[10px] font-black hover:bg-white/5 transition-colors ${currentCurrency === curr ? 'text-primary' : 'text-current'}`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden md:flex items-center">
              {(!isAdminLoggedIn && !isCustomerLoggedIn) ? (
                <button onClick={() => navigate('/login')} className="flex flex-col items-center group nav-text-dynamic px-4">
                  <User size={18} className="group-hover:text-primary transition-colors" />
                  <span className="text-[7px] font-mono font-black uppercase mt-1 tracking-tighter">Login</span>
                </button>
              ) : (
                <button onClick={handleLogOut} className="flex flex-col items-center group text-red-500 px-4">
                  <LogOut size={18} />
                  <span className="text-[7px] font-mono font-black uppercase mt-1 tracking-tighter">Exit</span>
                </button>
              )}
            </div>

            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border-2 active:scale-95 
              ${location.pathname === '/cart' ? 'bg-primary border-primary text-black' : 'bg-card border-white/5 nav-text-dynamic hover:border-primary'}`}
              onClick={() => navigate('/cart')}
            >
              <ShoppingCartIcon size={18} className={location.pathname === '/cart' ? 'text-black' : 'text-primary'} />
              <span className="font-black text-xs">{cartItemCount}</span>
            </button>

            <button className="md:hidden text-primary" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`fixed inset-0 bg-black/98 backdrop-blur-3xl z-[60] md:hidden transition-all duration-500 flex flex-col items-center justify-center p-8 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <button className="absolute top-6 right-6 text-white" onClick={() => setIsMobileMenuOpen(false)}><X size={32} /></button>
        <div className="flex flex-col items-center space-y-8 font-heading text-2xl uppercase font-black w-full text-center text-white italic tracking-tighter">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Warehouse</Link>
          <Link to="/collections" onClick={() => setIsMobileMenuOpen(false)}>Collections</Link>

          {/* Mobile Currency Switcher */}
          <div className="flex gap-4 items-center justify-center py-4">
            {['NGN', 'USD', 'GBP'].map(curr => (
              <button
                key={curr}
                onClick={() => setCurrentCurrency(curr)}
                className={`text-sm px-4 py-2 rounded-full border ${currentCurrency === curr ? 'bg-primary text-black border-primary' : 'border-white/20 text-white'}`}
              >
                {curr}
              </button>
            ))}
          </div>

          {(isAdminLoggedIn || isCustomerLoggedIn) && (
            <Link
              to={isAdminLoggedIn ? "/admin" : "/account"}
              className="text-primary flex items-center gap-3"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard <ChevronRight size={24} />
            </Link>
          )}

          <Link
            to={isCustomerLoggedIn ? '/account' : '/login'}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {isCustomerLoggedIn ? 'My Account' : 'Login'}
          </Link>

          <Link to="/cart" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
            Cart <span className="text-primary">({cartItemCount})</span>
          </Link>

          {(isCustomerLoggedIn || isAdminLoggedIn) && (
            <button className="text-red-500 pt-10" onClick={handleLogOut}>Disconnect Session</button>
          )}
        </div>
      </div>

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowLoginModal(false)} />
          <div className="relative animate-in fade-in zoom-in duration-300 w-full max-w-[420px]">
            <LoginView
              isModal={true}
              onClose={() => setShowLoginModal(false)}
              setIsCustomerLoggedIn={setIsCustomerLoggedIn}
              setCustomerData={setCustomerData}
              setNotification={setNotification}
              navigateToAccount={() => { setShowLoginModal(false); navigate('/account'); }}
            />
          </div>
        </div>
      )}

      {/* ROUTING ENGINE */}
      <main>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<ShopView products={products} loading={loading} error={error} fetchProducts={fetchProducts} currentCurrency={currentCurrency} addToCart={addToCart} setNotification={setNotification} setProductId={(id) => navigate(`/product/${id}`)} settings={settings} />} />
          <Route path="/collections" element={<CollectionsView products={products} loading={loading} error={error} currentCurrency={currentCurrency} addToCart={addToCart} setNotification={setNotification} setProductId={(id) => navigate(`/product/${id}`)} settings={settings} />} />
          <Route path="/product/:id" element={<ProductLookup products={products} user={customerData} currentCurrency={currentCurrency} addToCart={addToCart} setNotification={setNotification} settings={settings} setShowLoginModal={setShowLoginModal} headerStyle={headerStyle} />} />

          {/* CHECKOUT ROUTE WITH DATA PASSING */}
          <Route
            path="/cart"
            element={
              <CheckoutProcess
                cart={cart}
                currentCurrency={currentCurrency}
                updateCartQuantity={updateCartQuantity}
                removeFromCart={removeFromCart}
                clearCart={() => setCart([])}
                setNotification={setNotification}
                userId={customerData?.id || customerData?.user_id || null}
                customerEmail={customerData?.email || null}
                customerName={customerData?.name || null}
                // --- PASS NEW FIELDS HERE ---
                userFirstName={customerData?.first_name || ''}
                userLastName={customerData?.last_name || ''}
                userPhone={customerData?.phone || ''} // Ensure your auth.php returns 'phone' key for 'Phone Number' DB column
                // ---------------------------
                settings={settings}
                navigateToShop={() => navigate('/')}
              />
            }
          />

          {/* CUSTOMER ACCOUNT ROUTES */}
          <Route path="/login" element={isCustomerLoggedIn ? <Navigate to="/account" /> : <LoginView setIsCustomerLoggedIn={setIsCustomerLoggedIn} setCustomerData={setCustomerData} setNotification={setNotification} navigateToAccount={() => navigate('/account')} />} />
          <Route path="/reset-password" element={<ResetPassword setNotification={setNotification} />} />
          <Route path="/account" element={isCustomerLoggedIn ? <CustomerAccount customer={customerData} handleCustomerLogOut={handleLogOut} currentCurrency={currentCurrency} setNotification={setNotification} settings={settings} /> : <Navigate to="/login" />} />
          <Route path="/account/orders/:id" element={<CustomerOrderDetail setNotification={setNotification} currentCurrency={currentCurrency} settings={settings} />} />

          {/* INFO PAGES */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/shipping" element={<ShippingPolicy />} />
          <Route path="/returns" element={<ReturnsPolicy />} />

          {/* ADMIN ROUTES (Protected) */}
          <Route
            path="/admin"
            element={
              isAdminLoggedIn ? (
                <AdminDashboard
                  products={products}
                  loading={loading}
                  error={error}
                  fetchProducts={fetchProducts}
                  setNotification={setNotification}
                  isAdminLoggedIn={isAdminLoggedIn}
                  setIsAdminLoggedIn={setIsAdminLoggedIn}
                  settings={settings}
                  fetchSettings={fetchSettings}
                  currentCurrency={currentCurrency} // Admin can view in different currencies too
                />
              ) : (
                <AdminLogin
                  setIsAdminLoggedIn={setIsAdminLoggedIn}
                  setNotification={setNotification}
                />
              )
            }
          />

          <Route
            path="/admin/order/:id"
            element={
              isAdminLoggedIn ? (
                <AdminOrderDetail setNotification={setNotification} currentCurrency={currentCurrency} settings={settings} />
              ) : (
                <Navigate to="/admin" />
              )
            }
          />

          <Route
            path="/add-product"
            element={
              isAdminLoggedIn ? (
                <AddProduct setNotification={setNotification} />
              ) : (
                <Navigate to="/admin" />
              )
            }
          />

          <Route
            path="/edit-product/:id"
            element={
              isAdminLoggedIn ? (
                <EditProduct setNotification={setNotification} />
              ) : (
                <Navigate to="/admin" />
              )
            }
          />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <NotificationToast notification={notification} setNotification={setNotification} />
      <Footer
        handleAdminToggle={() => navigate('/admin')}
        isAdminLoggedIn={isAdminLoggedIn}
        themeMode={headerStyle}
      />
    </div>
  );
}