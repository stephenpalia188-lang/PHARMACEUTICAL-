import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCatalog } from './components/ProductCatalog';
import { ServicesSection } from './components/ServicesSection';
import { ProductModal } from './components/ProductModal';
import { PrescriptionUploadModal } from './components/PrescriptionUploadModal';
import { CartDrawer } from './components/CartDrawer';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { AdminPortal } from './components/AdminPortal';
import { SupabaseDiagnosticsModal } from './components/SupabaseDiagnosticsModal';
import { Footer } from './components/Footer';
import { Product } from './types';

function PharmacyApp() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white font-sans antialiased">
      {/* Navigation */}
      <Navbar
        onOpenOrderTracker={() => setIsOrderTrackerOpen(true)}
        onOpenPrescription={() => setIsPrescriptionOpen(true)}
        onOpenAdmin={() => setIsAdminPortalOpen(true)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main Content */}
      <main className="flex-1">
        <Hero
          onExploreProducts={() => scrollToSection('catalog')}
          onUploadPrescription={() => setIsPrescriptionOpen(true)}
          onViewServices={() => scrollToSection('services')}
        />

        <ProductCatalog
          onSelectProduct={(product) => setSelectedProduct(product)}
        />

        <ServicesSection
          onOpenPrescriptionUpload={() => setIsPrescriptionOpen(true)}
        />
      </main>

      {/* Footer & Location Details */}
      <Footer
        onOpenAdmin={() => setIsAdminPortalOpen(true)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onOpenPrescription={() => setIsPrescriptionOpen(true)}
        onOpenOrderTracker={() => setIsOrderTrackerOpen(true)}
        onNavigateSection={scrollToSection}
      />

      {/* Global Modals & Drawers */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOpenPrescriptionUpload={() => setIsPrescriptionOpen(true)}
      />

      <PrescriptionUploadModal
        isOpen={isPrescriptionOpen}
        onClose={() => setIsPrescriptionOpen(false)}
      />

      <CartDrawer />

      <OrderTrackerModal
        isOpen={isOrderTrackerOpen}
        onClose={() => setIsOrderTrackerOpen(false)}
      />

      <AdminPortal
        isOpen={isAdminPortalOpen}
        onClose={() => setIsAdminPortalOpen(false)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
      />

      <SupabaseDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <PharmacyApp />
      </CartProvider>
    </AuthProvider>
  );
}
