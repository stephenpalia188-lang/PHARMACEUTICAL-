import React, { useState } from 'react';
import { X, FileText, Upload, CheckCircle2, ShieldCheck, AlertCircle, Phone, MapPin } from 'lucide-react';

interface PrescriptionUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrescriptionUploadModal: React.FC<PrescriptionUploadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('Kitale Town / Pharmacy Pickup');
  const [prescriptionText, setPrescriptionText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successReference, setSuccessReference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (!patientName.trim() || !patientPhone.trim()) {
        throw new Error('Please provide your name and Kenyan phone number.');
      }
      if (!prescriptionText.trim() && !fileName) {
        throw new Error('Please provide the prescription medicine names or attach a prescription document.');
      }

      // Submit as a prescription review order via /api/orders
      const refNumber = `RX-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      // We can record this through the orders API with notes
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: patientName.trim(),
          customer_phone: patientPhone.trim(),
          customer_email: patientEmail.trim() || `${patientPhone.replace(/\s+/g, '')}@patient.local`,
          delivery_location: deliveryLocation.trim(),
          notes: `[PRESCRIPTION INQUIRY - Ref: ${refNumber}] Attachment: ${fileName || 'None'} | Details: ${prescriptionText}`,
          items: [
            {
              product_id: null,
              product_name: 'Prescription Dispensing & Verification Service',
              quantity: 1,
            }
          ]
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit prescription.');
      }

      const data = await res.json();
      setSuccessReference(data.order?.order_number || refNumber);
    } catch (err: any) {
      setError(err.message || 'Failed to submit prescription');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccessReference(null);
    setPatientName('');
    setPatientPhone('');
    setPatientEmail('');
    setPrescriptionText('');
    setFileName(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-200 overflow-hidden">
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {successReference ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Prescription Submitted Successfully!
            </h3>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-left space-y-2">
              <div className="flex justify-between text-xs text-emerald-950">
                <span className="font-semibold">Tracking / Reference Number:</span>
                <span className="font-mono font-bold text-emerald-800">{successReference}</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-950">
                <span className="font-semibold">Patient Phone:</span>
                <span className="font-bold">{patientPhone}</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-950">
                <span className="font-semibold">Branch Location:</span>
                <span>Kijana Wamalwa Road, Kitale</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              Our registered pharmacist at Gods Favor Pharmacy is reviewing the medication dosage and availability. We will call you directly at <strong>{patientPhone}</strong> with price confirmation and dispensing schedule.
            </p>

            <button
              onClick={handleResetAndClose}
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Upload Doctor's Prescription</h3>
                <p className="text-xs text-slate-500">
                  Gods Favor Pharmacy, Kitale • Licensed Pharmacist Verification
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    placeholder="e.g. Mary Simiyu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Kenyan Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={e => setPatientPhone(e.target.value)}
                    placeholder="e.g. 0712 345 678"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={e => setPatientEmail(e.target.value)}
                    placeholder="e.g. mary@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Delivery / Pickup in Kitale
                  </label>
                  <input
                    type="text"
                    value={deliveryLocation}
                    onChange={e => setDeliveryLocation(e.target.value)}
                    placeholder="e.g. In-store Pickup or Maili Saba, Kitale"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              {/* Prescription Text / Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Prescription Details & Medicines Required *
                </label>
                <textarea
                  rows={3}
                  value={prescriptionText}
                  onChange={e => setPrescriptionText(e.target.value)}
                  placeholder="Type the names of prescribed medicines, dosage, doctor instructions, or allergies..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              {/* File Attachment Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Or Attach Photo / Scan of Prescription (JPG, PNG, PDF)
                </label>
                <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-slate-50 hover:bg-emerald-50/40 transition-colors">
                  <Upload className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-700">
                    {fileName ? `Attached: ${fileName}` : 'Click or Drag Prescription Image Here'}
                  </span>
                  <span className="text-[10px] text-slate-400">Clear photos of doctor’s stamp & signature preferred</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Legal Pharmacist Notice */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Under Kenya Pharmacy and Poisons Board regulations, prescription-only medicines (POM) can only be dispensed against a genuine, certified prescription.
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <span>Submitting to Pharmacist...</span>
                  ) : (
                    <span>Submit for Pharmacist Review</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
