import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Stethoscope, 
  HeartPulse, 
  FileCheck, 
  CalendarCheck, 
  Clock, 
  CheckCircle2, 
  Phone,
  ShieldCheck
} from 'lucide-react';
import { Service } from '../types';

interface ServicesSectionProps {
  onOpenPrescriptionUpload: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onOpenPrescriptionUpload }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryNotes, setInquiryNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(json => setServices(json.data || []))
      .catch(err => console.error('Error loading services:', err));
  }, []);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSelectedService(null);
      setInquiryName('');
      setInquiryPhone('');
      setInquiryNotes('');
    }, 3000);
  };

  return (
    <section id="services" className="py-16 sm:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
            <span>Community Healthcare Services</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Clinical Consultations & In-Store Vitals Checks
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Beyond dispensing medications, our registered pharmacists provide essential diagnostic screenings, medication management, and preventive health guidance directly at our Kitale branch.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 hover:border-emerald-500/40 p-6 bg-slate-50/50 hover:bg-white transition-all duration-200 hover:shadow-xl hover:shadow-emerald-900/5 group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Stethoscope className="w-6 h-6" />
                </div>

                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {service.name}
                  </h3>
                  {service.price_kes !== undefined && (
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 shrink-0">
                      {service.price_kes === 0 ? 'FREE' : `KES ${service.price_kes}`}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {service.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Est. {service.duration_minutes || 15} mins</span>
                </span>

                <button
                  onClick={() => setSelectedService(service)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white font-bold transition-colors cursor-pointer"
                >
                  Book / Inquire
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Walk-in & Location Callout */}
        <div className="mt-14 rounded-2xl bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-8 sm:p-10 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Activity className="w-4 h-4" />
                <span>Walk-In Vitals Station</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold">
                No Appointment Needed for Routine Blood Pressure & Glucose Checks
              </h3>
              <p className="text-sm text-emerald-100 max-w-2xl leading-relaxed">
                Visit us today along Kijana Wamalwa Road in Kitale. Get immediate, accurate readings, personalized lifestyle advice, and prescription refills from our friendly healthcare team.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
              <a
                href="tel:+254712345678"
                className="py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-center text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call Pharmacist (+254 712 345 678)</span>
              </a>

              <button
                onClick={onOpenPrescriptionUpload}
                className="py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-center text-sm border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Submit Prescription Online</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Service Inquiry / Booking Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              Book Service: {selectedService.name}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Our pharmacist at Gods Favor Pharmacy, Kitale will reserve your slot and contact you.
            </p>

            {submitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">Inquiry Received!</h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  Thank you. Our Kitale branch team will call you shortly on {inquiryPhone} to confirm details.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={e => setInquiryName(e.target.value)}
                    placeholder="e.g. John Wekesa"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Phone Number (Kenyan Format) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={inquiryPhone}
                    onChange={e => setInquiryPhone(e.target.value)}
                    placeholder="e.g. 0712 345 678"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Preferred Time & Clinical Notes
                  </label>
                  <textarea
                    rows={3}
                    value={inquiryNotes}
                    onChange={e => setInquiryNotes(e.target.value)}
                    placeholder="Preferred day/time (e.g., Tomorrow at 10 AM, Fasting blood sugar check)..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedService(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
