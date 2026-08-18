import React, { useState } from 'react';
import { X, Check, ShoppingCart, ShieldAlert, ShieldCheck, AlertCircle, Sparkles, Plus, Minus } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenPrescriptionUpload: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onOpenPrescriptionUpload,
}) => {
  const { addToCart, cart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const cartItem = cart.find(item => item.product.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock_quantity <= 0 || !product.is_available;
  const maxStock = product.stock_quantity || 1;

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addToCart(product, quantity);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-12 max-h-[85vh] overflow-y-auto">
          {/* Image Column */}
          <div className="sm:col-span-5 bg-slate-50 p-6 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-slate-100">
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white shadow-xs">
              <img
                src={product.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80'}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            </div>

            <div className="mt-4 w-full space-y-2">
              <div className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-100 text-slate-700">
                <span>Stock Status:</span>
                <span className={`font-bold ${product.stock_quantity > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-100 text-slate-700">
                <span>Origin:</span>
                <span className="font-semibold text-slate-900">MoH/PPB Registered</span>
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="sm:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {product.category && (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                    {product.category.name}
                  </span>
                )}
                {product.requires_prescription ? (
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                    <span>Prescription Required</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-semibold">
                    Over-The-Counter (OTC)
                  </span>
                )}
              </div>

              {/* Title & Price */}
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                  {product.name}
                </h2>
                <div className="mt-2 text-2xl font-black text-emerald-800">
                  KES {product.price_kes.toLocaleString()}
                </div>
              </div>

              {/* Dosage Instructions */}
              {product.dosage && (
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
                  <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block mb-1">
                    Dosage & Administration:
                  </span>
                  <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                    {product.dosage}
                  </p>
                </div>
              )}

              {/* Description */}
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Product Overview:
                </span>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {product.description || 'Quality pharmaceutical product certified for distribution in Kenya.'}
                </p>
              </div>

              {/* Prescription Notice */}
              {product.requires_prescription && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    <span>Pharmacist Verification Required</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    This medication requires a valid doctor's prescription upon delivery or collection. 
                    You can also upload your prescription directly for expedited processing.
                  </p>
                  <button
                    onClick={() => { onClose(); onOpenPrescriptionUpload(); }}
                    className="mt-1 text-[11px] font-bold text-amber-900 underline hover:text-amber-700 cursor-pointer"
                  >
                    Upload Doctor Prescription Now →
                  </button>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity selector */}
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-1.5 rounded-lg hover:bg-white text-slate-600 disabled:opacity-40 cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                    disabled={quantity >= maxStock || isOutOfStock}
                    className="p-1.5 rounded-lg hover:bg-white text-slate-600 disabled:opacity-40 cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  id="modal-add-to-cart-btn"
                  className={`flex-1 py-3 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isOutOfStock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>
                    {isOutOfStock ? 'Currently Unavailable' : `Add ${quantity} to Cart (KES ${(product.price_kes * quantity).toLocaleString()})`}
                  </span>
                </button>
              </div>

              <div className="text-[11px] text-center text-slate-400">
                Medical information provided is for reference. Always consult a healthcare professional.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
