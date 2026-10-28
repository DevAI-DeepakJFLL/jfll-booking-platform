import React from 'react';
import {
  MapPin,
  Boxes,
  Info,
  Building2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { StyledSelect, CustomDatePicker, Field } from '../form/FormControls';
import type { QuoteForm, BookingForm, CargoType } from '../../types/booking';
import type { LocationItem } from '../../data/locations';

export interface QuoteFormStepProps {
  quote: QuoteForm;
  updateQuote: <K extends keyof QuoteForm>(key: K, value: QuoteForm[K]) => void;
  destLocations: LocationItem[];
  cargoCategoryOptions: { value: string; label: string }[];
  quoteError: string;
  actualWeight: number;
  volumetricWeight: number;
  chargeableWeight: number;
  dimVolWeight: number;
  dimCbm: number;
  hasWorkedWithJfll: boolean;
  setHasWorkedWithJfll: (val: boolean) => void;
  jfllIdentifier: string;
  setJfllIdentifier: (val: string) => void;
  booking: BookingForm;
  setBooking: React.Dispatch<React.SetStateAction<BookingForm>>;
  submitQuote: (event: React.FormEvent) => void;
}

export const QuoteFormStep: React.FC<QuoteFormStepProps> = ({
  quote,
  updateQuote,
  destLocations,
  cargoCategoryOptions,
  quoteError,
  actualWeight,
  volumetricWeight,
  chargeableWeight,
  dimVolWeight,
  dimCbm,
  hasWorkedWithJfll,
  setHasWorkedWithJfll,
  jfllIdentifier,
  setJfllIdentifier,
  booking,
  setBooking,
  submitQuote,
}) => {
  return (
    <form key="quote-form" onSubmit={submitQuote}>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="font-mulish block text-[11px] font-extrabold uppercase tracking-[.08em] text-[#4d5b62] mb-2">
            Origin gateway (India) *
          </label>
          <div className="booking-input select-trigger flex items-center justify-between bg-[#f8fafc] text-sm font-medium text-[#101820] border-[#dfe5e7] cursor-default min-h-[48px]">
            <div className="flex items-center gap-2.5 min-w-0">
              <MapPin size={16} className="text-[#187e9c] shrink-0" />
              <span className="truncate">Mumbai (BOM) &middot; Chhatrapati Shivaji Maharaj Intl</span>
            </div>
            <span className="shrink-0 h-5 inline-flex items-center rounded-full bg-[#187e9c]/10 px-2 text-[10px] font-bold text-[#187e9c]">
              Fixed Gateway
            </span>
          </div>
        </div>

        <StyledSelect
          id="destination"
          label="Destination gateway *"
          value={quote.destination}
          onChange={(val) => updateQuote('destination', val)}
          icon={<MapPin size={16} />}
          placeholder="Select Destination Gateway..."
          options={destLocations.map((loc) => ({
            value: loc.code,
            label: `${loc.city} (${loc.code}) · ${loc.airport}`,
          }))}
        />

        <CustomDatePicker
          id="readyDate"
          label="Ready date *"
          value={quote.readyDate}
          onChange={(val) => updateQuote('readyDate', val)}
          placeholder="Select cargo ready date..."
        />

        <StyledSelect
          id="cargoType"
          label="Commodity category *"
          value={quote.cargoType}
          onChange={(val) => updateQuote('cargoType', val as CargoType)}
          icon={<Boxes size={16} />}
          placeholder="Select Commodity Category..."
          options={cargoCategoryOptions}
        />

        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Pieces"
            type="number"
            value={quote.pieces}
            onChange={(val) => updateQuote('pieces', val)}
            placeholder="e.g. 4"
          />
          <Field
            label="Gross weight (kg)"
            type="number"
            value={quote.weight}
            onChange={(val) => updateQuote('weight', val)}
            placeholder="e.g. 240"
            helper="Actual scale weight including packaging"
          />
        </div>

        {/* Cargo Sizing & Volumetric Weight Options */}
        <div className="rounded-xl border border-[#dfe5e7] bg-[#f8fbfa] p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mulish text-[11px] font-extrabold uppercase tracking-[.08em] text-[#555c61] flex items-center gap-1.5">
              <Boxes size={14} className="text-[#176579]" /> Cargo Dimensions &amp; Volumetric Weight
            </span>
            <div className="flex items-center gap-2">
              {quote.dimensionMode !== 'cbm' && (
                <div className="inline-flex rounded-lg bg-[#e8eef0] p-0.5 text-xs font-mulish">
                  {(['cm', 'in', 'm', 'mm'] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => updateQuote('dimensionUnit', u)}
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase transition cursor-pointer ${
                        (quote.dimensionUnit || 'cm') === u
                          ? 'bg-[#176579] text-white shadow-xs'
                          : 'text-[#64748b] hover:text-[#101820]'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              )}
              <div className="inline-flex rounded-lg bg-[#e8eef0] p-0.5 text-xs font-mulish">
                <button
                  type="button"
                  onClick={() => updateQuote('dimensionMode', 'dimensions')}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                    quote.dimensionMode !== 'cbm'
                      ? 'bg-white text-[#176579] shadow-sm'
                      : 'text-[#64748b] hover:text-[#101820]'
                  }`}
                >
                  Dimensions
                </button>
                <button
                  type="button"
                  onClick={() => updateQuote('dimensionMode', 'cbm')}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                    quote.dimensionMode === 'cbm'
                      ? 'bg-white text-[#176579] shadow-sm'
                      : 'text-[#64748b] hover:text-[#101820]'
                  }`}
                >
                  Direct CBM
                </button>
              </div>
            </div>
          </div>

          {quote.dimensionMode !== 'cbm' ? (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2.5">
                <Field
                  label={`Length (${quote.dimensionUnit || 'cm'})`}
                  type="number"
                  value={quote.length || ''}
                  onChange={(val) => updateQuote('length', val)}
                  placeholder={quote.dimensionUnit === 'in' ? 'e.g. 24' : 'e.g. 60'}
                />
                <Field
                  label={`Breadth (${quote.dimensionUnit || 'cm'})`}
                  type="number"
                  value={quote.width || ''}
                  onChange={(val) => updateQuote('width', val)}
                  placeholder={quote.dimensionUnit === 'in' ? 'e.g. 16' : 'e.g. 50'}
                />
                <Field
                  label={`Height (${quote.dimensionUnit || 'cm'})`}
                  type="number"
                  value={quote.height || ''}
                  onChange={(val) => updateQuote('height', val)}
                  placeholder={quote.dimensionUnit === 'in' ? 'e.g. 16' : 'e.g. 40'}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[#edf6f8] px-3 py-1.5 text-[11px] font-mulish text-[#475569]">
                <span className="text-[#64748b]">
                  IATA Standard: (L × B × H × Pieces) ÷ 6,000{' '}
                  {(quote.dimensionUnit || 'cm') !== 'cm'
                    ? `(converted from ${quote.dimensionUnit} to cm)`
                    : ''}
                </span>
                {dimVolWeight > 0 ? (
                  <span className="font-extrabold text-[#176579]">
                    = {dimVolWeight} kg vol. ({dimCbm} CBM)
                  </span>
                ) : (
                  <span className="text-[#94a3b8] italic">
                    Enter box dimensions in {quote.dimensionUnit || 'cm'}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <Field
              label="Total Volume (CBM)"
              type="number"
              value={quote.volume}
              onChange={(val) => updateQuote('volume', val)}
              placeholder="e.g. 1.2"
              helper="1 CBM = 167 kg volumetric weight (IATA air cargo ratio)"
            />
          )}
        </div>
      </div>

      {/* Volumetric Weight Check Banner */}
      {chargeableWeight > 0 ? (
        <div className="mt-5 rounded-xl bg-[#f4f7f8] p-4 text-xs font-mulish border border-[#dfe5e7] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-[#176579] uppercase text-[10px] tracking-wider block">
              IATA Chargeable Weight Verification
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                volumetricWeight > actualWeight
                  ? 'bg-[#fff3dc] text-[#a46600]'
                  : 'bg-[#e6f4ea] text-[#137333]'
              }`}
            >
              {volumetricWeight > actualWeight
                ? 'Billed on Volumetric Weight (Bulky Cargo)'
                : 'Billed on Gross Weight (Dense Cargo)'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[#101820] bg-white rounded-lg p-2.5 border border-[#e2e8f0]">
            <div>
              <span className="text-[10px] text-[#64748b] block font-bold">Gross Scale Weight</span>
              <span className="text-sm font-extrabold text-[#101820]">{actualWeight} kg</span>
            </div>
            <div>
              <span className="text-[10px] text-[#64748b] block font-bold">Volumetric Weight (÷6000)</span>
              <span className="text-sm font-extrabold text-[#101820]">{volumetricWeight} kg</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#556972]">
              Applicable Billing Weight (Higher of the two, rounded to 0.5 kg):
            </span>
            <span className="text-base font-black text-[#187e9c]">{chargeableWeight} kg</span>
          </div>

          {chargeableWeight > 500 && (
            <div className="flex items-center gap-1.5 rounded-lg border border-[#c2e2e8] bg-[#eef8fa] px-3 py-1.5 font-mulish text-xs font-bold text-[#176579]">
              <span className="h-2 w-2 rounded-full bg-[#187e9c] animate-pulse"></span>
              <span>Heavy Shipment (&gt; 500 kg): Custom Spot Allocation by Pricing Desk</span>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5 flex items-center justify-between rounded-xl bg-[#f8fbfa] p-3 text-xs font-mulish border border-dashed border-[#dfe5e7] text-[#64748b]">
          <span>Enter pieces, gross weight, and dimensions above to preview live airline tariff rates.</span>
          <Info size={16} className="text-[#908e92]" />
        </div>
      )}

      {/* Have you previously worked with JFLL? Form Field Card */}
      <div className="mt-5 rounded-2xl border border-[#dfe5e7] bg-[#f8fbfa] p-4 sm:p-5 font-mulish text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-[#187e9c]" />
              <strong className="text-sm text-[#101820]">Have you previously worked with JFLL?</strong>
            </div>
            <span className="text-[#65686d] text-[11px] block mt-0.5">
              Link your existing JFLL account for priority booking processing and assigned operations desk support.
            </span>
          </div>
          <div className="inline-flex rounded-xl bg-[#e8eef0] p-1 text-xs shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setHasWorkedWithJfll(true);
                updateQuote('hasWorkedWithJfll', true);
                updateQuote('hasWorkedWithJfl', true);
              }}
              className={`rounded-lg px-4 py-1.5 font-bold transition cursor-pointer ${
                hasWorkedWithJfll
                  ? 'bg-[#176579] text-white shadow-xs'
                  : 'text-[#64748b] hover:text-[#101820]'
              }`}
              data-testid="button-worked-with-jfll-yes"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => {
                setHasWorkedWithJfll(false);
                setJfllIdentifier('');
                updateQuote('hasWorkedWithJfll', false);
                updateQuote('jfllIdentifier', '');
                updateQuote('hasWorkedWithJfl', false);
                updateQuote('jflIdentifier', '');
              }}
              className={`rounded-lg px-4 py-1.5 font-bold transition cursor-pointer ${
                !hasWorkedWithJfll
                  ? 'bg-white text-[#101820] shadow-xs'
                  : 'text-[#64748b] hover:text-[#101820]'
              }`}
              data-testid="button-worked-with-jfll-no"
            >
              No
            </button>
          </div>
        </div>

        {hasWorkedWithJfll && (
          <div className="mt-4 pt-3.5 border-t border-[#e2e8ea]">
            <Field
              label="Member ID / Client ID / Company Name *"
              value={jfllIdentifier}
              onChange={(val) => {
                setJfllIdentifier(val);
                updateQuote('jfllIdentifier', val);
                updateQuote('jflIdentifier', val);
                if (!booking.shipperCompany || booking.shipperCompany === jfllIdentifier) {
                  setBooking((prev) => ({ ...prev, shipperCompany: val }));
                }
              }}
              placeholder="e.g. JFLL-MUM-8921 or Reliance Retail Ltd"
              helper="Enter your JFLL partner ID, account number, or registered company name for assigned account handling."
            />
            {jfllIdentifier.trim() && (
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-[#176579]">
                <CheckCircle2 size={13} className="text-[#187e9c]" />
                <span>JFLL Partner identified ({jfllIdentifier.trim()}) &bull; Priority desk routing enabled</span>
              </div>
            )}
          </div>
        )}
      </div>

      {quoteError && (
        <div
          className="mt-5 flex items-center gap-2 rounded-xl bg-[#fff4f3] px-4 py-3 font-mulish text-xs font-bold text-[#b44f47]"
          role="alert"
        >
          <AlertCircle size={15} /> {quoteError}
        </div>
      )}

      <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-[#e2e5e6] pt-6 sm:flex-row sm:items-center">
        <span className="font-mulish flex items-center gap-2 text-[11px] font-bold text-[#908e92]">
          <ShieldCheck size={16} className="text-[#176579]" /> Your data stays private &amp; pre-validated
        </span>
        {chargeableWeight > 500 ? (
          <button
            type="submit"
            className="focus-ring w-full rounded-full bg-[#187e9c] px-7 py-3.5 font-mulish text-[12px] font-extrabold text-white transition hover:bg-[#13667f] sm:w-auto shadow-sm"
            data-testid="button-request-heavy-quote"
          >
            Request Heavy Cargo Quote (&gt;500 kg) <ArrowRight size={15} className="ml-2 inline" />
          </button>
        ) : (
          <button
            type="submit"
            className="focus-ring w-full rounded-full bg-[#f2a63d] px-7 py-3.5 font-mulish text-[12px] font-extrabold text-[#10212b] transition hover:bg-[#f6bb63] sm:w-auto"
            data-testid="button-search-rates"
          >
            Search live rates <ArrowRight size={15} className="ml-2 inline" />
          </button>
        )}
      </div>
    </form>
  );
};
