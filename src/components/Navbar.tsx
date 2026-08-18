import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShoppingCart, 
  Phone, 
  MapPin, 
  Clock, 
  User, 
  Menu, 
  X, 
  Search, 
  FileText, 
  Activity, 
  Database,
  Lock
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenOrderTracker: () => void;
  onOpenPrescription: () => void;
  onOpenAdmin: () => void;
  onOpenDiagnostics: () => void;
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenOrderTracker,
  onOpenPrescription,
  onOpenAdmin,
  onOpenDiagnostics,
  activeSection,
  setActiveSection,
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      {/* Top Notification Bar */}
      <div className="bg-emerald-900 text-emerald-100 text-xs px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Along Kijana Wamalwa Road, Kitale, Kenya</span>
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mon-Sat: 7:30 AM - 9:00 PM | Sun: 9:00 AM - 7:00 PM</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-medium">
            <button 
              onClick={onOpenDiagnostics}
              id="nav-diagnostics-btn"
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-emerald-800 hover:bg-emerald-700 text-emerald-200 transition-colors cursor-pointer"
              title="View Supabase Backend & Database Status"
            >
              <Database className="w-3 h-3 text-emerald-300" />
              <span>Supabase Status</span>
            </button>
            <a 
              href="tel:+254712345678" 
              className="flex items-center gap-1.5 text-white hover:text-emerald-300 font-semibold transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>+254 712 345 678</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => scrollToSection('hero')}
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <div className="relative">
                <ShieldCheck className="w-7 h-7" />
                <span className="absolute -bottom-1 -right-1 text-[9px] font-black bg-amber-400 text-emerald-950 px-1 rounded-full">
                  Rx
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-950">
                  GODS FAVOR
                </span>
                <span className="text-xl sm:text-2xl font-light text-emerald-600">
                  PHARMACY
                </span>
              </div>
              <p className="text-[11px] font-medium tracking-wide uppercase text-slate-500">
                Kitale Town • Quality Healthcare & Genuine Medicines
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('catalog')}
              className={`text-sm font-semibold transition-colors cursor-pointer ${
                activeSection === 'catalog' ? 'text-emerald-700 font-bold' : 'text-slate-700 hover:text-emerald-700'
              }`}
            >
              Medicines & Products
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className={`text-sm font-semibold transition-colors cursor-pointer ${
                activeSection === 'services' ? 'text-emerald-700 font-bold' : 'text-slate-700 hover:text-emerald-700'
              }`}
            >
              Clinical Services
            </button>
            <button
              onClick={onOpenPrescription}
              id="nav-prescription-btn"
              className="text-sm font-semibold text-slate-700 hover:text-emerald-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Upload Prescription</span>
            </button>
            <button
              onClick={onOpenOrderTracker}
              id="nav-track-order-btn"
              className="text-sm font-semibold text-slate-700 hover:text-emerald-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Track Order</span>
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className={`text-sm font-semibold transition-colors cursor-pointer ${
                activeSection === 'about' ? 'text-emerald-700 font-bold' : 'text-slate-700 hover:text-emerald-700'
              }`}
            >
              About & Location
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              id="nav-cart-btn"
              className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 transition-colors cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Admin Portal Button */}
            <button
              onClick={onOpenAdmin}
              id="nav-admin-portal-btn"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isAdmin
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
              title={isAdmin ? "Logged in as Admin (botone678@gmail.com)" : "Admin Login Portal"}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isAdmin ? 'Admin Dashboard' : 'Admin Portal'}</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 shadow-xl animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-3">
            <button
              onClick={() => scrollToSection('catalog')}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 text-left font-medium text-slate-800 hover:bg-emerald-50"
            >
              <span>Medicines & Products</span>
              <Search className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 text-left font-medium text-slate-800 hover:bg-emerald-50"
            >
              <span>Clinical Services</span>
              <Activity className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenPrescription(); }}
              className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 text-left font-medium text-emerald-900 hover:bg-emerald-100"
            >
              <span>Upload Prescription</span>
              <FileText className="w-4 h-4 text-emerald-600" />
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenOrderTracker(); }}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 text-left font-medium text-slate-800 hover:bg-emerald-50"
            >
              <span>Track My Order</span>
              <Activity className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 text-left font-medium text-slate-800 hover:bg-emerald-50"
            >
              <span>About & Kitale Location</span>
              <MapPin className="w-4 h-4 text-slate-400" />
            </button>
            
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenDiagnostics(); }}
                className="text-xs text-slate-600 flex items-center gap-1.5 p-2"
              >
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Supabase Diagnostic Panel</span>
              </button>

              {user && (
                <button
                  onClick={() => signOut()}
                  className="text-xs text-rose-600 font-semibold p-2"
                >
                  Sign Out ({user.email})
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
