import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product } from '../types';
import { supabase } from '../lib/supabase';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalKes: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = 'gfp_cart_state_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Reconcile persisted cart items with the live production catalog so stale
  // products cannot survive catalog changes and fail later at checkout.
  useEffect(() => {
    let cancelled = false;

    const reconcileCart = async () => {
      if (!cart.length) return;

      const ids = cart.map(item => item.product.id).filter(Boolean);
      if (!ids.length) return;

      const { data, error } = await supabase
        .from('products')
        .select('id, name, price_kes, stock_quantity, is_active')
        .in('id', ids);

      if (cancelled || error || !data) return;

      const liveById = new Map(data.map(product => [product.id, product]));
      const reconciled = cart
        .filter(item => {
          const live = liveById.get(item.product.id);
          return Boolean(live && live.is_active !== false && (live.stock_quantity ?? 0) > 0);
        })
        .map(item => {
          const live = liveById.get(item.product.id)!;
          const quantity = Math.min(item.quantity, live.stock_quantity ?? item.quantity);
          return {
            ...item,
            product: { ...item.product, ...live },
            quantity,
          };
        })
        .filter(item => item.quantity > 0);

      if (!cancelled) {
        setCart(reconciled);
      }
    };

    reconcileCart();
    return () => {
      cancelled = true;
    };
    // Reconcile on mount and whenever the cart contents change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock_quantity || 99) }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stock_quantity || 99) }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          const maxStock = item.product.stock_quantity || 99;
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalKes = cart.reduce((sum, item) => sum + item.product.price_kes * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalKes, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
