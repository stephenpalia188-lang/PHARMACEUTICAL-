import React from 'react';
import { 
  ShieldCheck, 
  Truck, 
  Clock, 
  FileCheck, 
  MapPin, 
  ArrowRight, 
  Sparkles,
  PhoneCall,
  Award,
  Stethoscope
} from 'lucide-react';

interface HeroProps {
  onExploreProducts: () => void;
  onUploadPrescription: () => void;
  onViewServices: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreProducts,
  onUploadPrescription,
  onViewServices,
}) => {
  return (
    <section id="hero" className="relative overflow-hidden bg-radial from-emerald-950 via-slate-950 to-slate-950 text-white pt-12 pb-20 lg:pt-16 lg:pb-28">
      {/* Subtle Grid Accent */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Main Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/70 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Licensed Community Pharmacy in Kitale, Kenya</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Trusted Medicine & <br />
              <span className="text-emerald-400">Professional Healthcare</span> <br />
              for Kitale Families.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Located <strong className="text-white font-semibold">Along Kijana Wamalwa Road, Kitale</strong>. 
              We dispense genuine, MoH-certified pharmaceuticals, offer clinical vital checks, 
              provide prescription refills, and deliver doorstep healthcare supplies across Trans Nzoia.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onExploreProducts}
                id="hero-order-medicines-btn"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Browse Medicines & Supplies</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onUploadPrescription}
                id="hero-upload-rx-btn"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Upload Doctor's Prescription</span>
              </button>

              <button
                onClick={onViewServices}
                id="hero-services-btn"
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-slate-300 hover:text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Stethoscope className="w-4 h-4 text-emerald-400" />
                <span>Clinical Services</span>
              </button>
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-900/40 text-emerald-400">
                  <Award className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">100% Genuine</div>
                  <div className="text-[11px] text-slate-400">PPB Certified Stock</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-900/40 text-emerald-400">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">Kitale Delivery</div>
                  <div className="text-[11px] text-slate-400">Town & Suburbs</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-900/40 text-emerald-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">Daily Service</div>
                  <div className="text-[11px] text-slate-400">From 7:30 AM</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-900/40 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">Expert Counsel</div>
                  <div className="text-[11px] text-slate-400">Licensed Pharmacist</div>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Quick Inquiry Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Physical Pharmacy Open
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">Kitale, Trans Nzoia</span>
              </div>

              <div className="py-5 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Gods Favor Pharmacy Location</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Along Kijana Wamalwa Road, Kitale Town, Kenya
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Direct access from town center with convenient parking and prescription pickup desk.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Mon - Sat:</span>
                    <span className="font-semibold text-white">7:30 AM - 9:00 PM</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Sunday & Holidays:</span>
                    <span className="font-semibold text-white">9:00 AM - 7:00 PM</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Pharmacist on Duty:</span>
                    <span className="font-semibold text-emerald-400">Available All Day</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <a
                    href="tel:+254712345678"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Pharmacy Now</span>
                  </a>
                  <button
                    onClick={onViewServices}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    <span>Check Vitals</span>
                  </button>
                </div>
              </div>

              {/* Safety banner */}
              <div className="mt-2 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>All prescription items require medical verification before dispensing.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
