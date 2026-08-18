import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  User, 
  Package, 
  ShoppingBag, 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Database, 
  ShieldAlert, 
  LogOut, 
  Activity,
  ArrowUpRight,
  Sparkles,
  Phone,
  Clock,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Product, Order, Category, OrderStatus } from '../types';
import { AdminProductModal } from './AdminProductModal';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDiagnostics: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  onOpenDiagnostics,
}) => {
  const { user, session, isAdmin, signInWithEmail, signOut, loading: authLoading } = useAuth();

  // Login form state - ALWAYS STARTS EMPTY
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin Dashboard state
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'database'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orderUpdatingId, setOrderUpdatingId] = useState<string | null>(null);
  const [adminActionMessage, setAdminActionMessage] = useState<string | null>(null);

  // Edit / Add product modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null);

  // Seed status
  const [isSeeding, setIsSeeding] = useState(false);

  const token = session?.access_token || '';

  // Fetch admin orders
  const fetchAdminOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setOrders(json.data || []);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    }
  };

  // Fetch admin products
  const fetchAdminProducts = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setProducts(json.data || []);
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const json = await res.json();
        setCategories(json.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const refreshAllAdminData = async () => {
    setLoadingData(true);
    await Promise.allSettled([
      fetchAdminOrders(),
      fetchAdminProducts(),
      fetchCategories(),
    ]);
    setLoadingData(false);
  };

  useEffect(() => {
    if (isOpen && isAdmin && token) {
      refreshAllAdminData();
    }
  }, [isOpen, isAdmin, token]);

  if (!isOpen) return null;

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const { error } = await signInWithEmail(email.trim(), password);
      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setLoginError(err.message || 'Invalid administrator credentials. Please verify your email and password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setOrderUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to update order status');
      }

      setAdminActionMessage(`Order status updated to ${newStatus}`);
      setTimeout(() => setAdminActionMessage(null), 3000);
      await fetchAdminOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setOrderUpdatingId(null);
    }
  };

  // Adjust product stock
  const handleQuickStockAdjust = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock_quantity + delta);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          stock_quantity: newStock,
          is_available: newStock > 0,
        }),
      });
      if (res.ok) {
        await fetchAdminProducts();
      }
    } catch (err) {
      console.error('Stock adjust error:', err);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from inventory?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        setAdminActionMessage(`Product "${name}" deleted`);
        setTimeout(() => setAdminActionMessage(null), 3000);
        await fetchAdminProducts();
      }
    } catch (err) {
      console.error('Delete product error:', err);
    }
  };

  // Trigger Database Seed
  const handleSeedDatabase = async () => {
    if (!confirm('This will insert initial standard Kenyan pharmacy categories and products if not present. Continue?')) return;
    setIsSeeding(true);
    try {
      const res = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Seed failed');
      alert('Database seeded successfully with Gods Favor Pharmacy catalog!');
      await refreshAllAdminData();
    } catch (err: any) {
      alert('Seeding error: ' + err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  const totalRevenueKes = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total_kes || 0), 0);

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Top Bar */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-900 font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold">Gods Favor Pharmacy — Admin Portal</h2>
                <span className="px-2 py-0.5 rounded-md bg-emerald-900 text-emerald-300 text-[10px] font-mono uppercase tracking-wider">
                  Production DB
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {user ? (
                  <span>Authenticated: <strong className="text-slate-200">{user.email}</strong></span>
                ) : (
                  <span>Restricted Access • Authorized Pharmacy Personnel Only</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <button
                onClick={() => signOut()}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-200 hover:text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close admin modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action message toast */}
        {adminActionMessage && (
          <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-4 text-center animate-in fade-in">
            {adminActionMessage}
          </div>
        )}

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          {!user || !isAdmin ? (
            /* Admin Sign In Screen */
            <div className="max-w-md mx-auto my-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Administrator Sign In</h3>
                <p className="text-xs text-slate-500">
                  Enter your administrator credentials to access the management portal.
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Authentication Failed:</span>
                    <span>{loginError}</span>
                  </div>
                </div>
              )}

              {user && !isAdmin && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Insufficient Permissions</span>
                  </div>
                  <p>
                    Your account ({user.email}) does not have administrator privileges. Please sign in with an authorized administrator account.
                  </p>
                  <button
                    onClick={() => signOut()}
                    className="px-3 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Sign Out & Switch Account
                  </button>
                </div>
              )}

              {(!user || isAdmin) && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter password..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    id="admin-login-submit-btn"
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>{isLoggingIn ? 'Authenticating with Supabase...' : 'Sign In as Administrator'}</span>
                  </button>
                </form>
              )}

              <div className="pt-2 text-center border-t border-slate-100">
                <button
                  onClick={onOpenDiagnostics}
                  className="text-xs text-emerald-700 hover:underline flex items-center gap-1 mx-auto cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Check Supabase Database Connection Status</span>
                </button>
              </div>
            </div>
          ) : (
            /* Authenticated Admin Dashboard */
            <div className="space-y-6">
              {/* Metrics Header Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Total Orders</span>
                  <div className="text-2xl font-black text-slate-900">{orders.length}</div>
                  <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                    {pendingOrdersCount} pending review
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Total Sales (KES)</span>
                  <div className="text-2xl font-black text-emerald-800">
                    KES {totalRevenueKes.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
                    Kitale Branch Total
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Active Catalog</span>
                  <div className="text-2xl font-black text-slate-900">{products.length}</div>
                  <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
                    {categories.length} Categories
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Low / Out of Stock</span>
                  <div className="text-2xl font-black text-rose-600">
                    {products.filter(p => p.stock_quantity <= 5).length}
                  </div>
                  <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
                    Need Restocking
                  </span>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
                <div className="flex rounded-xl bg-slate-200/80 p-1">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'orders' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Customer Orders ({orders.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('products')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'products' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Products Inventory ({products.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('database')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'database' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Supabase DB & Setup</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={refreshAllAdminData}
                    className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                    title="Refresh data"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
                  </button>

                  {activeTab === 'products' && (
                    <button
                      onClick={() => {
                        setSelectedProductForEdit(null);
                        setIsProductModalOpen(true);
                      }}
                      id="admin-add-product-btn"
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Medicine</span>
                    </button>
                  )}
                </div>
              </div>

              {/* TAB 1: ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {/* Status filter bar */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider shrink-0">Filter Status:</span>
                    {['all', 'pending', 'confirmed', 'processing', 'ready', 'completed', 'cancelled'].map(st => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1 rounded-full font-bold uppercase shrink-0 transition-colors cursor-pointer ${
                          statusFilter === st ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                      <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                      <h4 className="text-base font-bold text-slate-700">No orders found</h4>
                      <p className="text-xs text-slate-400">There are no customer orders matching the filter.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredOrders.map(order => (
                        <div
                          key={order.id}
                          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-500/30 transition-all space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-sm text-emerald-950">
                                  {order.order_number}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                  order.status === 'completed' ? 'bg-emerald-100 text-emerald-900' :
                                  order.status === 'cancelled' ? 'bg-rose-100 text-rose-900' :
                                  order.status === 'ready' ? 'bg-blue-100 text-blue-900' :
                                  'bg-amber-100 text-amber-900'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400">
                                Placed: {new Date(order.created_at).toLocaleString()}
                              </span>
                            </div>

                            <div className="text-right sm:text-right">
                              <span className="text-xs text-slate-400 uppercase font-semibold">Total:</span>
                              <div className="text-lg font-black text-slate-900">
                                KES {order.total_kes.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                              <span className="font-bold text-slate-500 block">Customer Information:</span>
                              <div className="font-semibold text-slate-900">{order.customer_name}</div>
                              <div className="text-emerald-700 font-mono">{order.customer_phone}</div>
                              <div className="text-slate-500">{order.customer_email}</div>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                              <span className="font-bold text-slate-500 block">Delivery / Pickup Location:</span>
                              <div className="font-semibold text-slate-900">{order.delivery_location}</div>
                              {order.notes && (
                                <p className="text-[11px] text-amber-900 font-medium italic mt-1">
                                  Notes: {order.notes}
                                </p>
                              )}
                            </div>

                            {/* Status Changer Buttons */}
                            <div className="p-3 rounded-xl bg-slate-50 space-y-2">
                              <span className="font-bold text-slate-500 block">Change Status:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {(['confirmed', 'processing', 'ready', 'completed', 'cancelled'] as OrderStatus[]).map(st => (
                                  <button
                                    key={st}
                                    onClick={() => handleUpdateOrderStatus(order.id, st)}
                                    disabled={orderUpdatingId === order.id || order.status === st}
                                    className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                      order.status === st
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-white border border-slate-300 hover:bg-emerald-50 text-slate-700'
                                    }`}
                                  >
                                    {st}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Line items */}
                          {order.items && order.items.length > 0 && (
                            <div className="pt-2">
                              <div className="text-xs font-bold text-slate-700 mb-1">Ordered Items:</div>
                              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs">
                                {order.items.map((it, idx) => (
                                  <div key={idx} className="flex justify-between p-2.5 bg-white">
                                    <span className="text-slate-800">
                                      <strong className="text-emerald-800">{it.quantity}x</strong> {it.product_name}
                                    </span>
                                    <span className="font-semibold text-slate-900">
                                      KES {it.subtotal_kes.toLocaleString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PRODUCTS INVENTORY */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold tracking-wider">
                          <tr>
                            <th className="p-3.5">Medicine</th>
                            <th className="p-3.5">Price (KES)</th>
                            <th className="p-3.5">Stock</th>
                            <th className="p-3.5">Classification</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {products.map(product => (
                            <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3.5">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={product.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&auto=format&fit=crop&q=80'}
                                    alt={product.name}
                                    className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div>
                                    <div className="font-bold text-slate-900 line-clamp-1">{product.name}</div>
                                    <div className="text-[11px] text-slate-400">{product.category?.name || 'General'}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="p-3.5 font-bold text-slate-900">
                                KES {product.price_kes.toLocaleString()}
                              </td>

                              <td className="p-3.5">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleQuickStockAdjust(product, -1)}
                                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                                    title="Decrease stock by 1"
                                  >
                                    -
                                  </button>
                                  <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                                    product.stock_quantity <= 0 ? 'bg-rose-100 text-rose-800' :
                                    product.stock_quantity <= 5 ? 'bg-amber-100 text-amber-800' :
                                    'bg-slate-100 text-slate-800'
                                  }`}>
                                    {product.stock_quantity}
                                  </span>
                                  <button
                                    onClick={() => handleQuickStockAdjust(product, +1)}
                                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                                    title="Increase stock by 1"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>

                              <td className="p-3.5">
                                {product.requires_prescription ? (
                                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                                    Rx Required
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                                    OTC
                                  </span>
                                )}
                              </td>

                              <td className="p-3.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  product.is_available && product.stock_quantity > 0
                                    ? 'bg-emerald-50 text-emerald-800'
                                    : 'bg-rose-50 text-rose-800'
                                }`}>
                                  {product.is_available && product.stock_quantity > 0 ? 'Available' : 'Unavailable'}
                                </span>
                              </td>

                              <td className="p-3.5 text-right space-x-1">
                                <button
                                  onClick={() => {
                                    setSelectedProductForEdit(product);
                                    setIsProductModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                                  title="Edit Product"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id, product.name)}
                                  className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DATABASE TOOLS & SEEDING */}
              {activeTab === 'database' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800">
                        <Database className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">Supabase Production Database Tools</h4>
                        <p className="text-xs text-slate-500">
                          Inspect tables, execute catalog seed, and audit RLS policies.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <span className="text-xs font-bold text-slate-900 block">
                          1-Click Catalog Seeder
                        </span>
                        <p className="text-xs text-slate-600">
                          Populates missing categories, certified medications, and clinical services in Supabase PostgreSQL tables.
                        </p>
                        <button
                          onClick={handleSeedDatabase}
                          disabled={isSeeding}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>{isSeeding ? 'Seeding Tables...' : 'Seed Initial Catalog Now'}</span>
                        </button>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <span className="text-xs font-bold text-slate-900 block">
                          Diagnostics & Schema Viewer
                        </span>
                        <p className="text-xs text-slate-600">
                          View full SQL migration script and run live health checks on Supabase tables.
                        </p>
                        <button
                          onClick={onOpenDiagnostics}
                          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer"
                        >
                          <Activity className="w-4 h-4" />
                          <span>Open Supabase Diagnostics</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Gods Favor Pharmacy • Along Kijana Wamalwa Road, Kitale, Kenya</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Edit / Add Product Modal */}
      {isProductModalOpen && (
        <AdminProductModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          product={selectedProductForEdit}
          categories={categories}
          token={token}
          onSaved={fetchAdminProducts}
        />
      )}
    </div>
  );
};
