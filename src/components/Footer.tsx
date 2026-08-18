import React from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Heart, 
  FileText, 
  Lock, 
  Activity,
  AlertTriangle
} from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenDiagnostics: () => void;
  onOpenPrescription: () => void;
  onOpenOrderTracker: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdmin,
  onOpenDiagnostics,
  onOpenPrescription,
  onOpenOrderTracker,
  onNavigateSection,
}) => {
  return (
    <footer id="about" className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Medical Safety Disclaimer Banner */}
      <div className="bg-amber-950/70 border-b border-amber-900/50 text-amber-200 text-xs px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="leading-relaxed text-[11px] sm:text-xs">
            <strong>Official Medical Disclaimer:</strong> The pharmaceutical information provided on this platform is for patient educational guidance and ordering convenience only. It is not a substitute for clinical medical diagnosis, professional medical treatment, or licensed physician advice. Always seek the advice of your doctor or qualified pharmacist with any questions regarding a medical condition.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight">
                  GODS FAVOR <span className="text-emerald-400 font-light">PHARMACY</span>
                </span>
                <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-500">
                  Kitale Town • Kenya
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Your premier community healthcare partner in Kitale. Dedicated to providing 100% genuine medications, clinical vital signs screenings, certified prescription dispensing, and prompt regional deliveries.
            </p>

            <div className="pt-2 text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Along Kijana Wamalwa Road, Kitale, Kenya</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="tel:+254712345678" className="hover:text-emerald-400 font-semibold">
                  +254 712 345 678
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>care@godsfavorpharmacy.co.ke</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Healthcare Services
            </h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li>
                <button 
                  onClick={() => onNavigateSection('catalog')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Prescription & OTC Medicines
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateSection('services')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Blood Pressure Screening
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateSection('services')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Blood Glucose / Diabetes Testing
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenPrescription} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Prescription Upload & Review
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateSection('services')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Chronic Disease Refill Program
                </button>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Operating Hours (Kitale)
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span>Monday - Friday:</span>
                <span className="font-semibold text-white">7:30 AM - 9:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday:</span>
                <span className="font-semibold text-white">7:30 AM - 9:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday & Holidays:</span>
                <span className="font-semibold text-white">9:00 AM - 7:00 PM</span>
              </div>
              <div className="pt-1 text-[11px] text-emerald-400 font-semibold border-t border-slate-800">
                ● Licensed Pharmacist always on duty
              </div>
            </div>
          </div>

          {/* Admin & System */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Management
            </h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li>
                <button
                  onClick={onOpenAdmin}
                  id="footer-admin-portal-link"
                  className="hover:text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Portal</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenOrderTracker}
                  className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Track Live Order</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenDiagnostics}
                  className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Supabase Diagnostics</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Gods Favor Pharmacy, Kitale Kenya. All rights reserved.
          </div>
          <div className="text-[11px] text-slate-400">
            Registered Community Pharmacy • Kijana Wamalwa Road, Kitale
          </div>
        </div>
      </div>
    </footer>
  );
};
