import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Clock,
  PhoneCall,
  Mail,
  Building2,
  User,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  AlertCircle,
  Package,
  PlaneTakeoff,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import {
  submitHeavyCargoInquiry,
  HeavyCargoInquiryResponse,
} from '../../services/rate-discovery.service';

export interface HeavyCargoInquiryProps {
  quote: {
    origin: string;
    destination: string;
    readyDate: string;
    pieces: string;
    weight: string;
    volume: string;
    cargoType: string;
  };
  chargeableWeight: number;
  actualWeight: number;
  volumetricWeight: number;
  onBackToQuote: () => void;
  onResetQuote: () => void;
}

export const HeavyCargoInquiry: React.FC<HeavyCargoInquiryProps> = ({
  quote,
  chargeableWeight,
  actualWeight,
  volumetricWeight,
  onBackToQuote,
  onResetQuote,
}) => {
  const [formData, setFormData] = useState({
    contactName: '',
    companyName: '',
    email: '',
    phone: '',
    iecCode: '',
    specialInstructions: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<HeavyCargoInquiryResponse | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.contactName.trim()) {
      setError('Please provide your full contact name.');
      return;
    }
    if (!formData.companyName.trim()) {
      setError('Please enter your company / organization name.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      setError('Please provide a valid business email address.');
      return;
    }
    const digitsOnly = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim() || digitsOnly.length < 7) {
      setError('Please provide a valid direct phone or mobile number (at least 7 digits).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitHeavyCargoInquiry({
        origin: quote.origin,
        destination: quote.destination,
        weight: actualWeight,
        volumetricWeight,
        cargoType: quote.cargoType,
        readyDate: quote.readyDate,
        contactName: formData.contactName.trim(),
        companyName: formData.companyName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        iecCode: formData.iecCode.trim(),
        specialInstructions: formData.specialInstructions.trim(),
      });
      setSubmissionResult(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit inquiry. Please try again or call our direct desk.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (!submissionResult?.referenceNumber) return;
    navigator.clipboard.writeText(submissionResult.referenceNumber);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  // -------------------------------------------------------------
  // CONFIRMATION VIEW (Post-submission)
  // -------------------------------------------------------------
  if (submissionResult) {
    return (
      <motion.div
        key="confirmation-view"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-[#dfe5e7] bg-white p-6 shadow-sm sm:p-10"
        data-testid="heavy-cargo-confirmation"
      >
        {/* Status Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f4f7] text-[#187e9c]">
            <CheckCircle2 size={36} className="text-[#187e9c]" />
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#eaf5ea] px-3 py-1 font-mulish text-xs font-bold text-[#1f7a37]">
            <span className="h-2 w-2 rounded-full bg-[#1f7a37]"></span>
            Request Registered Successfully
          </span>
          <h2 className="mt-3 font-mulish text-2xl font-black text-[#101820] sm:text-3xl">
            Our Sales Coordinator Will Contact You Soon
          </h2>
          <p className="mt-2 max-w-2xl font-mulish text-sm text-[#505459]">
            For shipments above <strong className="text-[#101820]">500 kg</strong>, published carrier tariffs do not apply. Our dedicated Pricing Team &amp; Sales Coordinator are actively securing custom spot allocations and negotiated airline block rates for your consignment.
          </p>
        </div>

        {/* Reference & SLA Badge */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col justify-between rounded-xl border border-[#c2e2e8] bg-[#f2f8fa] p-5">
            <div>
              <span className="font-mulish text-[11px] font-bold uppercase tracking-wider text-[#176579]">
                RFQ Reference Number
              </span>
              <div className="mt-1 flex items-center gap-3">
                <span className="font-mono text-xl font-black text-[#101820]">
                  {submissionResult.referenceNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 rounded-md border border-[#c2e2e8] bg-white px-2.5 py-1 text-xs font-bold text-[#176579] transition hover:bg-[#e8f4f7]"
                  title="Copy Reference"
                  aria-label="Copy reference number to clipboard"
                >
                  {copiedRef ? (
                    <>
                      <Check size={13} className="text-[#1f7a37]" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>
            <p className="mt-3 font-mulish text-xs text-[#65686d]">
              Please quote this reference in any correspondence with Jet Freight.
            </p>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-[#dfe5e7] bg-[#f9fafb] p-5">
            <div>
              <span className="font-mulish text-[11px] font-bold uppercase tracking-wider text-[#65686d]">
                Guaranteed Turnaround SLA
              </span>
              <div className="mt-1 flex items-center gap-2 text-xl font-bold text-[#101820]">
                <Clock size={20} className="text-[#187e9c]" />
                <span>{submissionResult.estimatedResponseTime || 'Within 2 business hours'}</span>
              </div>
            </div>
            <p className="mt-3 font-mulish text-xs text-[#65686d]">
              Our pricing coordinators are reviewing direct flight lift options from BOM.
            </p>
          </div>
        </div>

        {/* Shipment Details Summary Box */}
        <div className="mt-6 rounded-xl border border-[#dfe5e7] bg-white p-5">
          <h3 className="font-mulish text-xs font-bold uppercase tracking-wider text-[#908e92]">
            Consignment Specification
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <div className="font-mulish text-[11px] text-[#65686d]">Route</div>
              <div className="mt-0.5 font-mulish text-sm font-bold text-[#101820]">
                {quote.origin} &rarr; {quote.destination}
              </div>
            </div>
            <div>
              <div className="font-mulish text-[11px] text-[#65686d]">Chargeable Weight</div>
              <div className="mt-0.5 font-mulish text-sm font-bold text-[#187e9c]">
                {chargeableWeight} kg
              </div>
            </div>
            <div>
              <div className="font-mulish text-[11px] text-[#65686d]">Gross / Volumetric</div>
              <div className="mt-0.5 font-mulish text-sm font-bold text-[#101820]">
                {actualWeight} kg / {volumetricWeight} kg
              </div>
            </div>
            <div>
              <div className="font-mulish text-[11px] text-[#65686d]">Commodity Category</div>
              <div className="mt-0.5 font-mulish text-sm font-bold text-[#101820]">
                {quote.cargoType}
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-[#f0f2f3] pt-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <span className="font-mulish text-[11px] text-[#65686d]">Primary Contact:</span>
                <span className="ml-1.5 font-mulish text-xs font-bold text-[#101820]">
                  {formData.contactName}
                </span>
              </div>
              <div>
                <span className="font-mulish text-[11px] text-[#65686d]">Company:</span>
                <span className="ml-1.5 font-mulish text-xs font-bold text-[#101820]">
                  {formData.companyName}
                </span>
              </div>
              <div>
                <span className="font-mulish text-[11px] text-[#65686d]">Phone:</span>
                <span className="ml-1.5 font-mulish text-xs font-bold text-[#101820]">
                  {formData.phone}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Direct Contact Support Box */}
        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-xl border border-[#dfe5e7] bg-[#fbfcfc] p-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f4f7] text-[#187e9c]">
              <PhoneCall size={18} />
            </div>
            <div>
              <div className="font-mulish text-sm font-bold text-[#101820]">
                Need immediate spot rate clearance?
              </div>
              <div className="font-mulish text-xs text-[#65686d]">
                Reach our Sahar Cargo Complex Pricing Desk directly: <strong>+91 22 6104 3300</strong> | <strong>pricing@jetfreight.com</strong>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-[#e8f4f7] px-2.5 py-1 text-[11px] font-bold text-[#176579]">
              Mon-Sat, 09:00 - 19:30 IST
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col justify-end gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onResetQuote}
            className="focus-ring rounded-full bg-[#187e9c] px-6 py-3 font-mulish text-xs font-extrabold text-white transition hover:bg-[#13667f]"
          >
            Submit Another Shipment
          </button>
        </div>
      </motion.div>
    );
  }

  // -------------------------------------------------------------
  // INQUIRY FORM VIEW
  // -------------------------------------------------------------
  return (
    <motion.div
      key="inquiry-form-view"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6"
      data-testid="heavy-cargo-inquiry-section"
    >
      {/* Header Bar */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#e2e5e6] pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="font-mulish text-[11px] font-bold text-[#908e92]">
            {quote.pieces} pieces &middot; {chargeableWeight} kg chargeable &middot; {quote.cargoType}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xl font-semibold text-[#101820]">
            <span>{quote.origin}</span>
            <ArrowRight size={17} className="text-[#187e9c]" />
            <span>{quote.destination}</span>
            <span className="font-mulish ml-1.5 inline-flex items-center rounded-md bg-[#e8f4f7] px-2 py-0.5 text-[11px] font-bold text-[#176579]">
              Heavy Air Cargo (&gt;500 kg)
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToQuote}
          className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-[#dfe5e7] bg-white px-4 py-2 font-mulish text-xs font-bold text-[#101820] shadow-sm transition hover:bg-[#f4f7f8]"
        >
          <ArrowLeft size={14} /> Modify Shipment Specs
        </button>
      </div>

      {/* Explanatory Callout Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#c2e2e8] bg-gradient-to-r from-[#eef8fa] to-[#f7fbfc] p-6 text-[#101820] shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#187e9c] text-white">
                <PlaneTakeoff size={13} />
              </span>
              <h3 className="font-mulish text-base font-extrabold text-[#101820]">
                Custom Spot Rate Required for Consignments &gt; 500 kg
              </h3>
            </div>
            <p className="max-w-2xl font-mulish text-xs leading-relaxed text-[#404449]">
              Standard published tariffs are restricted to lighter shipments. For shipments weighing over <strong>500 kg</strong>, our Sales Coordinator and Air Freight Pricing Desk negotiate exclusive airline spot capacity and volume tier discounts directly with carrier revenue management.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 font-mulish text-[11px] font-bold text-[#176579]">
              <span className="flex items-center gap-1">
                <Clock size={13} /> Response within 2 business hours
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck size={13} /> Guaranteed lift &amp; pallet position allocation
              </span>
            </div>
          </div>

          <div className="shrink-0 rounded-xl border border-[#c2e2e8] bg-white p-3 text-center sm:w-44">
            <div className="font-mulish text-[10px] font-bold uppercase tracking-wider text-[#908e92]">
              Weight Category
            </div>
            <div className="mt-0.5 font-mulish text-lg font-black text-[#187e9c]">
              {chargeableWeight} kg
            </div>
            <div className="font-mulish text-[11px] text-[#65686d]">
              Spot Tariff Bracket
            </div>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="rounded-2xl border border-[#dfe5e7] bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 border-b border-[#f0f2f3] pb-4">
          <h2 className="font-mulish text-lg font-extrabold text-[#101820]">
            Provide Shipper &amp; Contact Information
          </h2>
          <p className="mt-1 font-mulish text-xs text-[#65686d]">
            Our coordinator will connect with you with flight options, departure schedules, and spot pricing.
          </p>
        </div>

        {error && (
          <div
            className="mb-6 flex items-center gap-2 rounded-xl bg-[#fff4f3] px-4 py-3 font-mulish text-xs font-bold text-[#b44f47]"
            role="alert"
          >
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Contact Name */}
            <div>
              <label
                htmlFor="contactName"
                className="mb-1.5 flex items-center gap-1.5 font-mulish text-xs font-bold text-[#101820]"
              >
                <User size={13} className="text-[#187e9c]" /> Full Name *
              </label>
              <input
                id="contactName"
                name="contactName"
                type="text"
                required
                value={formData.contactName}
                onChange={handleInputChange}
                placeholder="e.g. Rajesh Kumar"
                className="w-full rounded-xl border border-[#c5d0d2] bg-white px-4 py-2.5 font-mulish text-xs text-[#101820] placeholder-[#a0a4a8] transition outline-none focus:outline-none focus:border-[#187e9c] focus:ring-2 focus:ring-[#187e9c]/20"
              />
            </div>

            {/* Company Name */}
            <div>
              <label
                htmlFor="companyName"
                className="mb-1.5 flex items-center gap-1.5 font-mulish text-xs font-bold text-[#101820]"
              >
                <Building2 size={13} className="text-[#187e9c]" /> Company / Organization *
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="e.g. Apex Exports India Pvt Ltd"
                className="w-full rounded-xl border border-[#c5d0d2] bg-white px-4 py-2.5 font-mulish text-xs text-[#101820] placeholder-[#a0a4a8] transition outline-none focus:outline-none focus:border-[#187e9c] focus:ring-2 focus:ring-[#187e9c]/20"
              />
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 flex items-center gap-1.5 font-mulish text-xs font-bold text-[#101820]"
              >
                <Mail size={13} className="text-[#187e9c]" /> Business Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="e.g. rajesh@apexexports.com"
                className="w-full rounded-xl border border-[#c5d0d2] bg-white px-4 py-2.5 font-mulish text-xs text-[#101820] placeholder-[#a0a4a8] transition outline-none focus:outline-none focus:border-[#187e9c] focus:ring-2 focus:ring-[#187e9c]/20"
              />
            </div>

            {/* Telephone Number */}
            <div>
              <label
                htmlFor="phone"
                className="mb-1.5 flex items-center gap-1.5 font-mulish text-xs font-bold text-[#101820]"
              >
                <PhoneCall size={13} className="text-[#187e9c]" /> Direct Phone / Mobile *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g. +91 98201 23456"
                className="w-full rounded-xl border border-[#c5d0d2] bg-white px-4 py-2.5 font-mulish text-xs text-[#101820] placeholder-[#a0a4a8] transition outline-none focus:outline-none focus:border-[#187e9c] focus:ring-2 focus:ring-[#187e9c]/20"
              />
            </div>

            {/* IEC Code (Optional) */}
            <div>
              <label
                htmlFor="iecCode"
                className="mb-1.5 flex items-center gap-1.5 font-mulish text-xs font-bold text-[#101820]"
              >
                <FileText size={13} className="text-[#187e9c]" /> IEC Code (Optional)
              </label>
              <input
                id="iecCode"
                name="iecCode"
                type="text"
                value={formData.iecCode}
                onChange={handleInputChange}
                placeholder="10-digit DGFT Importer-Exporter Code"
                maxLength={20}
                className="w-full rounded-xl border border-[#c5d0d2] bg-white px-4 py-2.5 font-mulish text-xs text-[#101820] placeholder-[#a0a4a8] transition outline-none focus:outline-none focus:border-[#187e9c] focus:ring-2 focus:ring-[#187e9c]/20"
              />
            </div>

            {/* Ready Date Indicator */}
            <div>
              <label
                htmlFor="readyDate"
                className="mb-1.5 flex items-center gap-1.5 font-mulish text-xs font-bold text-[#101820]"
              >
                <Clock size={13} className="text-[#187e9c]" /> Target Cargo Ready Date
              </label>
              <input
                id="readyDate"
                type="text"
                readOnly
                value={quote.readyDate || 'Not specified'}
                className="w-full rounded-xl border border-[#dfe5e7] bg-[#f8fbfa] px-4 py-2.5 font-mulish text-xs text-[#505459] cursor-not-allowed"
              />
            </div>
          </div>

          {/* Special Instructions / Cargo Handling */}
          <div>
            <label
              htmlFor="specialInstructions"
              className="mb-1.5 flex items-center gap-1.5 font-mulish text-xs font-bold text-[#101820]"
            >
              <Package size={13} className="text-[#187e9c]" /> Special Cargo Requirements / Dimension Notes (Optional)
            </label>
            <textarea
              id="specialInstructions"
              name="specialInstructions"
              rows={3}
              value={formData.specialInstructions}
              onChange={handleInputChange}
              placeholder="e.g. Palletized crates, requires forklift on tender, temperature range +15°C to +25°C, or non-stackable."
              maxLength={500}
              className="w-full rounded-xl border border-[#c5d0d2] bg-white px-4 py-2.5 font-mulish text-xs text-[#101820] placeholder-[#a0a4a8] transition outline-none focus:outline-none focus:border-[#187e9c] focus:ring-2 focus:ring-[#187e9c]/20"
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-col items-start justify-between gap-4 border-t border-[#f0f2f3] pt-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 font-mulish text-xs text-[#65686d]">
              <ShieldCheck size={16} className="text-[#187e9c]" />
              <span>Details handled in compliance with Jet Freight Privacy &amp; IATA security protocol.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#187e9c] px-8 py-3.5 font-mulish text-xs font-extrabold text-white transition hover:bg-[#13667f] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              data-testid="submit-heavy-cargo-inquiry"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Submitting Request...
                </>
              ) : (
                <>
                  Request Spot Quote from Pricing Team <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
