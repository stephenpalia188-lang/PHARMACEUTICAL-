import React, { useState } from 'react';
import { X, Search, Activity, CheckCircle2, Clock, PackageCheck, Truck, AlertCircle, Phone, Calendar } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({ isOpen, onClose }) => {
  const [orderNumber, setOrderNumber] = useState('');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const params = new URLSearchParams();
      params.append('order_number', orderNumber.trim());
      if (phoneOrEmail.trim()) {
        params.append('phone_or_email', phoneOrEmail.trim());
      }

      const res = await fetch(`/api/orders/lookup?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Order not found. Please verify your order reference number.');
      }

      setOrder(data.order);
    } catch (err: any) {
      setError(err.message || 'Failed to locate order.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 1;
      case 'confirmed': return 2;
      case 'processing': return 3;
      case 'ready': return 4;
      case 'completed': return 5;
      case 'cancelled': return 0;
      default: return 1;
    }
  };

  const currentStep = order ? getStatusStep(order.status) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-200 overflow-hidden max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Track Pharmacy Order</h3>
            <p className="text-xs text-slate-500">
              Live status tracking directly from Gods Favor Pharmacy database
            </p>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleLookup} className="space-y-3 mb-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              required
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              placeholder="Enter Order Number (e.g. GFP-2026-123456)..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm uppercase"
            />
            <button
              type="submit"
              disabled={loading}
              id="lookup-order-btn"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Searching...' : 'Track Status'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Enter the reference number sent to you when placing your order or prescription inquiry.
          </p>
        </form>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Order Details View */}
        {order && (
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            {/* Status Progress Bar */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase text-slate-500">Order Progress</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                  order.status === 'completed' ? 'bg-emerald-100 text-emerald-900' :
                  order.status === 'cancelled' ? 'bg-rose-100 text-rose-900' :
                  order.status === 'ready' ? 'bg-blue-100 text-blue-900' :
                  'bg-amber-100 text-amber-900'
                }`}>
                  Status: {order.status}
                </span>
              </div>

              {order.status !== 'cancelled' ? (
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                  <div className={`p-2 rounded-lg ${currentStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    1. Received
                  </div>
                  <div className={`p-2 rounded-lg ${currentStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    2. Verified
                  </div>
                  <div className={`p-2 rounded-lg ${currentStep >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    3. Preparing
                  </div>
                  <div className={`p-2 rounded-lg ${currentStep >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    4. Ready / Out
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-rose-100 text-rose-900 text-xs font-bold text-center">
                  Order Cancelled
                </div>
              )}
            </div>

            {/* Order Information */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Order Reference:</span>
                <span className="font-mono font-bold text-slate-900">{order.order_number}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Customer Name:</span>
                <span className="font-semibold text-slate-900">{order.customer_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Phone Contact:</span>
                <span className="font-semibold text-slate-900">{order.customer_phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Delivery / Pickup:</span>
                <span className="font-semibold text-slate-900">{order.delivery_location}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Order Placed:</span>
                <span className="text-slate-700">{new Date(order.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 font-bold text-sm text-emerald-950 pt-2">
                <span>Total Amount:</span>
                <span>KES {order.total_kes.toLocaleString()}</span>
              </div>
            </div>

            {/* Items list */}
            {order.items && order.items.length > 0 && (
              <div>
                <span className="text-xs font-bold uppercase text-slate-500 block mb-2">
                  Order Items ({order.items.length})
                </span>
                <div className="space-y-1.5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                      <span className="text-slate-800 font-medium">
                        {item.quantity}x {item.product_name}
                      </span>
                      <span className="font-bold text-slate-900">
                        KES {item.subtotal_kes.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes if any */}
            {order.notes && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <span className="font-bold block mb-0.5">Customer / Pharmacist Notes:</span>
                <p>{order.notes}</p>
              </div>
            )}

            <div className="pt-2 text-center">
              <a
                href="tel:+254712345678"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Need urgent assistance with this order? Call +254 712 345 678</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
