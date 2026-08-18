import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  FileText
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Order } from '../types';

export const CartDrawer: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, totalItems, totalKes, isCartOpen, setIsCartOpen } = useCart();
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('Kitale Town Center (Pickup)');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    setIsSubmitting(true);

    try {
      if (cart.length === 0) {
        throw new Error('Your cart is empty.');
      }
      if (!customerName.trim()) {
        throw new Error('Please enter your full name.');
      }
      if (!customerPhone.trim() || customerPhone.trim().length < 6) {
        throw new Error('Please enter a valid Kenyan phone number (e.g. 0712 345 678).');
      }

      // Order items payload for server validation
      const itemsPayload = cart.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price_kes: item.product.price_kes,
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          customer_email: customerEmail.trim() || `${customerPhone.replace(/\s+/g, '')}@customer.local`,
          delivery_location: deliveryLocation.trim(),
          notes: orderNotes.trim() || null,
          items: itemsPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server failed to process order.');
      }

      // Success: server validated and created order
      setCompletedOrder(data.order);
      clearCart();
      setIsCheckingOut(false);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setCheckoutError(err.message || 'An error occurred while placing your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAllAndClose = () => {
    setCompletedOrder(null);
    setIsCheckingOut(false);
    setCheckoutError(null);
    setIsCartOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base font-bold text-slate-900">
                {completedOrder ? 'Order Confirmation' : isCheckingOut ? 'Express Checkout' : `Shopping Cart (${totalItems})`}
              </h2>
            </div>

            <button
              onClick={resetAllAndClose}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            
            {/* Completed Order State */}
            {completedOrder ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    Order Placed Successfully!
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Gods Favor Pharmacy, Kitale has received your order for processing.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-left space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-emerald-100">
                    <span className="text-slate-600">Order Number:</span>
                    <span className="font-mono font-bold text-emerald-950">{completedOrder.order_number}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-100">
                    <span className="text-slate-600">Customer:</span>
                    <span className="font-semibold text-slate-900">{completedOrder.customer_name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-100">
                    <span className="text-slate-600">Phone Contact:</span>
                    <span className="font-semibold text-slate-900">{completedOrder.customer_phone}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-100">
                    <span className="text-slate-600">Location:</span>
                    <span className="font-semibold text-slate-900">{completedOrder.delivery_location}</span>
                  </div>
                  <div className="flex justify-between py-1 font-bold text-sm text-emerald-950">
                    <span>Total Amount:</span>
                    <span>KES {completedOrder.total_kes.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2">
                  <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block">
                    What happens next:
                  </span>
                  <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                    <li>Our pharmacist verifies medicine stock & prescription requirements.</li>
                    <li>We will call you on <strong>{completedOrder.customer_phone}</strong> to confirm collection/delivery time.</li>
                    <li>Payment is settled in KES upon delivery or in-store pickup.</li>
                  </ul>
                </div>

                <button
                  onClick={resetAllAndClose}
                  className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  Continue Browsing
                </button>
              </div>
            ) : isCheckingOut ? (
              /* Checkout Form */
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                {checkoutError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Cart Total ({totalItems} items):</span>
                    <span>KES {totalKes.toLocaleString()}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Final total verified server-side with Gods Favor Pharmacy database.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. Stephen Palia"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Phone Number (M-Pesa / Calls) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 0712 345 678"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    placeholder="e.g. stephen@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Pickup or Delivery Address in Kitale *
                  </label>
                  <select
                    value={deliveryLocation}
                    onChange={e => setDeliveryLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                  >
                    <option value="Kitale Town - In-Store Pickup (Kijana Wamalwa Rd)">In-Store Pickup (Along Kijana Wamalwa Rd)</option>
                    <option value="Kitale Town CBD Delivery">Kitale Town CBD (Doorstep Delivery)</option>
                    <option value="Maili Saba / Tuwan Area">Maili Saba / Tuwan Area</option>
                    <option value="Milimani / Section 6, Kitale">Milimani / Section 6</option>
                    <option value="Sirende / Sibanga Area">Sirende / Sibanga Area</option>
                    <option value="Endebess / Kiminini Highway">Endebess / Kiminini Highway</option>
                    <option value="Other Trans Nzoia Region">Other Trans Nzoia Region (Specify in notes)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Special Pharmacist Notes / Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={orderNotes}
                    onChange={e => setOrderNotes(e.target.value)}
                    placeholder="Any patient allergies, preferred brand, or delivery instructions..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCheckingOut(false)}
                    className="w-1/3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Back to Cart
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    id="submit-order-btn"
                    className="w-2/3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Placing Order...</span>
                    ) : (
                      <>
                        <span>Submit Order (KES {totalKes.toLocaleString()})</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Cart Items List */
              <>
                {cart.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-700">Your cart is empty</h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Explore our wide range of pain relievers, antibiotics, maternal products, and vitamins.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white"
                      >
                        <img
                          src={item.product.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&auto=format&fit=crop&q=80'}
                          alt={item.product.name}
                          className="w-14 h-14 rounded-lg object-cover bg-slate-100 shrink-0"
                          referrerPolicy="no-referrer"
                        />

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {item.product.name}
                          </h4>
                          <div className="text-xs font-extrabold text-emerald-800 mt-0.5">
                            KES {item.product.price_kes.toLocaleString()}
                          </div>

                          {/* Stepper */}
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="p-1 text-slate-600 hover:text-slate-900"
                                aria-label="Decrease"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-bold text-slate-800">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="p-1 text-slate-600 hover:text-slate-900"
                                aria-label="Increase"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="text-[11px] text-slate-500">
                              = KES {(item.product.price_kes * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Bar when viewing cart items */}
          {!completedOrder && !isCheckingOut && cart.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500 font-semibold uppercase">Total Amount (KES):</span>
                <span className="text-xl font-extrabold text-slate-900">
                  KES {totalKes.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={clearCart}
                  className="p-3 rounded-xl border border-slate-200 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                  title="Clear Shopping Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsCheckingOut(true)}
                  id="cart-proceed-checkout-btn"
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Stock & Secure Order Processing</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
