import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, AlertTriangle, Layers, ShieldCheck } from 'lucide-react';
import { Product, Category } from '../types';
import { ProductCard } from './ProductCard';
import { getSupabaseClient } from '../lib/supabase';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '../data/initial-catalog';

interface ProductCatalogProps {
  onSelectProduct: (product: Product) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ onSelectProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'otc' | 'rx'>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setCategories(INITIAL_CATEGORIES);
      return;
    }

    try {
      const { data, error: queryError } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (queryError) throw queryError;
      setCategories(data && data.length > 0 ? data : INITIAL_CATEGORIES);
    } catch (err) {
      console.error('Error fetching categories from Supabase:', err);
      setCategories(INITIAL_CATEGORIES);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase is not configured in this deployment.');

      let query = supabase
        .from('products')
        .select('*, category:categories(id, name)')
        .order('name', { ascending: true });

      if (selectedCategory !== 'all') query = query.eq('category_id', selectedCategory);
      if (searchQuery.trim()) query = query.ilike('name', `%${searchQuery.trim()}%`);

      const { data, error: queryError } = await query;
      if (queryError) throw queryError;

      if (data && data.length > 0) {
        setProducts(data as Product[]);
        return;
      }

      let fallbackProducts: Product[] = INITIAL_PRODUCTS.map(p => ({
        ...p,
        category: INITIAL_CATEGORIES.find(c => c.id === p.category_id) || null,
      }));

      if (selectedCategory !== 'all') {
        fallbackProducts = fallbackProducts.filter(p => p.category_id === selectedCategory);
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        fallbackProducts = fallbackProducts.filter(p =>
          p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)
        );
      }

      setProducts(fallbackProducts);
    } catch (err: any) {
      console.error('Error fetching products from Supabase:', err);
      setError(err?.message || 'Unable to connect to the pharmacy catalog. Please check connection and try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 250);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  const filteredProducts = products.filter(p => {
    if (filterType === 'otc') return !p.requires_prescription;
    if (filterType === 'rx') return p.requires_prescription;
    return true;
  });

  return (
    <section id="catalog" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1.5">
              <Layers className="w-4 h-4" />
              <span>Registered Pharmacy Catalog</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">Essential Medicines & Medical Supplies</h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">Certified pharmaceuticals stored in strict temperature-controlled conditions in Kitale Town.</p>
          </div>
          <button onClick={() => fetchProducts()} className="self-start md:self-auto px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Catalog</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search medicine name, condition, or symptom..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder:text-slate-400" />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600">Clear</button>}
            </div>
            <div className="flex rounded-xl bg-slate-100 p-1 shrink-0">
              <button onClick={() => setFilterType('all')} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>All Items</button>
              <button onClick={() => setFilterType('otc')} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${filterType === 'otc' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>OTC Only</button>
              <button onClick={() => setFilterType('rx')} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${filterType === 'rx' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>Rx Required</button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Categories:</span>
            <button onClick={() => setSelectedCategory('all')} className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${selectedCategory === 'all' ? 'bg-emerald-800 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>All Categories ({products.length})</button>
            {categories.map(cat => <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${selectedCategory === cat.id ? 'bg-emerald-800 text-white shadow-xs font-bold' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>{cat.name}</button>)}
          </div>
        </div>

        {loading && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{[1,2,3,4,5,6,7,8].map(i => <div key={i} className="rounded-2xl bg-white border border-slate-200 p-4 animate-pulse space-y-4"><div className="w-full h-44 rounded-xl bg-slate-200" /><div className="h-4 bg-slate-200 rounded w-1/3" /><div className="h-5 bg-slate-200 rounded w-3/4" /><div className="h-3 bg-slate-200 rounded w-full" /></div>)}</div>}

        {!loading && error && <div className="rounded-2xl bg-rose-50 border border-rose-200 p-8 text-center max-w-xl mx-auto space-y-3"><AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" /><h3 className="text-lg font-bold text-rose-950">Unable to load medicines</h3><p className="text-xs text-rose-800">{error}</p><button onClick={() => fetchProducts()} className="mt-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer">Retry Connection</button></div>}

        {!loading && !error && filteredProducts.length === 0 && <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4"><div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto"><Search className="w-8 h-8" /></div><h3 className="text-lg font-bold text-slate-900">No matching medicines found</h3><p className="text-xs text-slate-500">We couldn't find any products matching "{searchQuery}". You can check our full inventory or request a specialized order.</p><button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setFilterType('all'); }} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer">Reset Filters</button></div>}

        {!loading && !error && filteredProducts.length > 0 && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{filteredProducts.map(product => <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />)}</div>}

        <div className="mt-12 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-900"><div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" /><span><strong>Pharmacy Storage Guarantee:</strong> All thermolabile medications (insulin, vaccines, eye drops) are stored in continuous temperature-monitored pharmaceutical refrigerators.</span></div><span className="font-mono text-[11px] text-emerald-800 shrink-0">Kitale Town • Kijana Wamalwa Road</span></div>
      </div>
    </section>
  );
};
