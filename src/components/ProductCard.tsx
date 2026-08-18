import React from 'react';
import { ShoppingCart, Check, Plus, Eye, ShieldAlert } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

const createImageFallback = (name: string) => {
  const label = name.length > 28 ? `${name.slice(0, 28)}…` : name;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500"><rect width="800" height="500" fill="#f1f5f9"/><rect x="300" y="105" width="200" height="250" rx="28" fill="#d1fae5" stroke="#059669" stroke-width="8"/><rect x="345" y="65" width="110" height="55" rx="12" fill="#64748b"/><rect x="325" y="180" width="150" height="95" rx="10" fill="#ffffff"/><text x="400" y="222" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" font-weight="700" fill="#065f46">PHARMACY</text><text x="400" y="252" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" fill="#475569">${label.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart, cart } = useCart();
  const cartItem = cart.find(item => item.product.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock_quantity <= 0 || !product.is_available;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;
  const fallbackImage = createImageFallback(product.name);

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative flex flex-col justify-between rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500/40 p-4 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-900/5"
    >
      <div>
        <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-100 mb-3.5">
          <img
            src={product.image_url || fallbackImage}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const image = e.currentTarget;
              if (image.src !== fallbackImage) image.src = fallbackImage;
            }}
          />

          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
            {product.requires_prescription ? (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/95 text-amber-950 text-[10px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                <span>Rx Required</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                OTC Medicine
              </span>
            )}

            {product.is_featured && (
              <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold tracking-wider">
                Featured
              </span>
            )}
          </div>

          <div className="absolute top-2.5 right-2.5">
            {isOutOfStock ? (
              <span className="px-2 py-0.5 rounded-md bg-rose-600/90 text-white text-[10px] font-bold uppercase">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
                Only {product.stock_quantity} left
              </span>
            ) : null}
          </div>

          <button
            onClick={() => onSelect(product)}
            className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            aria-label="View product details"
          >
            <span className="px-3.5 py-1.5 rounded-lg bg-white/95 text-slate-900 text-xs font-bold shadow-md flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>Quick View</span>
            </span>
          </button>
        </div>

        {product.category && (
          <div className="text-[11px] font-semibold text-emerald-700 tracking-wide uppercase mb-1 line-clamp-1">
            {product.category.name}
          </div>
        )}

        <h3
          onClick={() => onSelect(product)}
          className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 hover:text-emerald-700 cursor-pointer transition-colors"
          title={product.name}
        >
          {product.name}
        </h3>

        {product.dosage ? (
          <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">{product.dosage}</p>
        ) : product.description ? (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{product.description}</p>
        ) : null}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block leading-none">Price</span>
          <div className="text-base sm:text-lg font-extrabold text-slate-900">KES {product.price_kes.toLocaleString()}</div>
        </div>

        <button
          onClick={() => !isOutOfStock && addToCart(product, 1)}
          disabled={isOutOfStock}
          id={`add-to-cart-${product.id}`}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            isOutOfStock
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : inCartQty > 0
              ? 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-xs'
              : 'bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-200 hover:border-emerald-600'
          }`}
          title={isOutOfStock ? 'Product is out of stock' : 'Add to Shopping Cart'}
        >
          {inCartQty > 0 ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>In Cart ({inCartQty})</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
