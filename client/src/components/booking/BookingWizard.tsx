import React from 'react';
import {
  AlertCircle,
  Boxes,
  Building2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Globe2,
  Plus,
  Trash2,
} from 'lucide-react';
import { AirlineLogo } from '../AirlineLogo';
import { Field, StyledSelect } from '../form/FormControls';
import {
  convertToCm,
  calculateVolumetricWeight,
  calculateCbm,
} from '../../lib/freight-domain';
import type {
  BookingForm,
  QuoteForm,
  PieceLine,
  Rate,
  Incoterm,
  PackagingType,
  TempCondition,
} from '../../types/booking';
import type { LocationItem } from '../../data/locations';

export interface BookingWizardProps {
  booking: BookingForm;
  updateBooking: <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => void;
  bookingSubStep: number;
  setBookingSubStep: React.Dispatch<React.SetStateAction<number>>;
  bookingError: string | null;
  selectedRate: Rate | null;
  quote: QuoteForm;
  chargeableWeight: number;
  pieceLines: PieceLine[];
  handleAddPieceLine: () => void;
  handleRemovePieceLine: (id: string) => void;
  handleUpdatePieceLine: (id: string, field: keyof PieceLine, val: number) => void;
  dgAccepted: boolean;
  setDgAccepted: React.Dispatch<React.SetStateAction<boolean>>;
  termsAccepted: boolean;
  setTermsAccepted: React.Dispatch<React.SetStateAction<boolean>>;
  onBackToStep1: () => void;
  onNextSubStep: () => void;
  onConfirmBooking: () => void;
  isSubmitting: boolean;
  formatInr: (val: number) => string;
  formatAirlineName: (val: string) => string;
  locations: LocationItem[];
}

export function BookingWizard({
  booking,
  updateBooking,
  bookingSubStep,
  setBookingSubStep,
  bookingError,
  selectedRate,
  quote,
  chargeableWeight,
  pieceLines,
  handleAddPieceLine,
  handleRemovePieceLine,
  handleUpdatePieceLine,
  dgAccepted,
  setDgAccepted,
  termsAccepted,
  setTermsAccepted,
  onBackToStep1,
  onNextSubStep,
  onConfirmBooking,
  isSubmitting,
  formatInr,
  formatAirlineName,
  locations,
}: BookingWizardProps) {
  return (
    <div key="booking" className="space-y-6">
      {/* Selected Rate Banner */}
      {selectedRate && (
        <div className="rounded-2xl bg-[#f1f8f5] p-4 font-mulish border border-[#d4e9e3] flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 min-w-0">
            <AirlineLogo
              carrier={selectedRate.carrier}
              carrierCode={selectedRate.carrierCode}
              className="h-10 w-10"
            />
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[#176579]">
                Selected Carrier Lift
              </span>
              <div className="text-sm font-extrabold text-[#101820] mt-0.5 truncate">
                {formatAirlineName(selectedRate.carrier)} &middot; {selectedRate.code} &middot; {selectedRate.departure}
              </div>
            </div>
          </div>
          <span className="text-sm font-extrabold text-[#176579] shrink-0">
            {formatInr(selectedRate.total)} total
          </span>
        </div>
      )}

      {/* Sub-step Stepper */}
      <div className="flex items-center gap-2 border-b border-[#e2e5e6] pb-3 text-xs font-mulish overflow-x-auto no-scrollbar py-1" role="tablist" aria-label="Booking steps">
        {[
          { step: 0, label: 'Shipper & Consignee' },
          { step: 1, label: 'Cargo Specs & Packaging' },
          { step: 2, label: 'Review & Confirm' },
        ].map((item, idx) => {
          const isActive = bookingSubStep === item.step;
          const isCompleted = bookingSubStep > item.step;
          return (
            <button
              key={item.step}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                if (item.step < bookingSubStep) setBookingSubStep(item.step);
              }}
              className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 font-bold transition cursor-pointer text-xs whitespace-nowrap min-h-[38px] ${
                isActive
                  ? 'bg-[#187e9c] text-white shadow-xs'
                  : isCompleted
                  ? 'bg-[#eaf9fd] text-[#176579] hover:bg-[#d8f2fa]'
                  : 'bg-[#f4f7f8] text-[#908e92] cursor-not-allowed'
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-extrabold ${
                  isActive ? 'bg-white text-[#187e9c]' : isCompleted ? 'bg-[#176579] text-white' : 'bg-[#dfe5e7] text-[#65686d]'
                }`}
              >
                {isCompleted ? '✓' : idx + 1}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {bookingError && (
        <div className="flex items-center gap-2 rounded-xl bg-[#fff4f3] px-4 py-3 font-mulish text-xs font-bold text-[#b44f47]">
          <AlertCircle size={15} /> {bookingError}
        </div>
      )}

      {/* Sub-Step 0: Shipper & Consignee */}
      {bookingSubStep === 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Shipper */}
          <div className="space-y-4 rounded-2xl bg-[#f8fafc] p-4 sm:p-5 border border-[#dfe5e7]">
            <div className="font-mulish text-[11px] font-extrabold uppercase text-[#176579] flex items-center gap-2">
              <Building2 size={15} /> Shipper (India Exporter)
            </div>
            <Field
              label="Company Name *"
              value={booking.shipperCompany}
              onChange={(val) => updateBooking('shipperCompany', val)}
              placeholder="e.g. Acme Industrial Exports Pvt Ltd"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Field
                label="Contact Name *"
                value={booking.shipperName}
                onChange={(val) => updateBooking('shipperName', val)}
                placeholder="e.g. Ramesh Kumar"
              />
              <Field
                label="GSTIN (15 Digits / Optional)"
                value={booking.shipperGstin}
                onChange={(val) => updateBooking('shipperGstin', val)}
                placeholder="27AABCA1234F1Z8 (Optional for personal/sample cargo)"
                helper="Leave blank if unregistered or shipping samples"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Field
                label="DGFT IEC Number (Optional)"
                value={booking.shipperIec}
                onChange={(val) => updateBooking('shipperIec', val)}
                placeholder="10-digit Exporter Code"
                helper="Leave blank if requesting JFLL Customs assistance"
              />
              <Field
                label="Bank AD Code (Optional)"
                value={booking.adCode || ''}
                onChange={(val) => updateBooking('adCode', val)}
                placeholder="7-digit AD Code"
                helper="For EDP bank trade credit"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Field
                label="Email *"
                type="email"
                value={booking.shipperEmail}
                onChange={(val) => updateBooking('shipperEmail', val)}
              />
              <Field
                label="Phone *"
                value={booking.shipperPhone}
                onChange={(val) => updateBooking('shipperPhone', val)}
              />
            </div>
            <Field
              label="Pickup Address *"
              value={booking.shipperAddress}
              onChange={(val) => updateBooking('shipperAddress', val)}
            />
          </div>

          {/* Consignee */}
          <div className="space-y-4 rounded-2xl bg-[#f8fafc] p-4 sm:p-5 border border-[#dfe5e7]">
            <div className="font-mulish text-[11px] font-extrabold uppercase text-[#176579] flex items-center gap-2">
              <Building2 size={15} /> Consignee (Destination Receiver)
            </div>
            <Field
              label="Company Name *"
              value={booking.consigneeCompany}
              onChange={(val) => updateBooking('consigneeCompany', val)}
              placeholder="e.g. Al-Futtaim Logistics LLC"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Field
                label="Contact Name *"
                value={booking.consigneeName}
                onChange={(val) => updateBooking('consigneeName', val)}
                placeholder="e.g. Tariq Mansoor"
              />
              <Field
                label="Tax ID / TRN (Optional)"
                value={booking.consigneeTaxId || ''}
                onChange={(val) => updateBooking('consigneeTaxId', val)}
                placeholder="e.g. 100293847500003"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Field
                label="Email *"
                type="email"
                value={booking.consigneeEmail}
                onChange={(val) => updateBooking('consigneeEmail', val)}
                placeholder="e.g. logistics@alfuttaim.ae"
              />
              <Field
                label="Phone *"
                value={booking.consigneePhone}
                onChange={(val) => updateBooking('consigneePhone', val)}
                placeholder="e.g. +971 4 398 2211"
              />
            </div>
            <Field
              label="Delivery Address *"
              value={booking.consigneeAddress}
              onChange={(val) => updateBooking('consigneeAddress', val)}
              placeholder="e.g. Warehouse 14, Al Quoz 3, Dubai, UAE"
            />
          </div>
        </div>
      )}

      {/* Sub-Step 1: Cargo Pieces & Dimensions */}
      {bookingSubStep === 1 && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <span className="font-mulish text-xs font-extrabold uppercase tracking-wider text-[#64748b]">
              Piece Dimensions (cm) &amp; Weight (kg)
            </span>
            <button
              type="button"
              onClick={handleAddPieceLine}
              className="self-start sm:self-auto font-mulish text-xs font-bold text-[#187e9c] hover:underline flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-[#eaf9fd] transition min-h-[36px]"
            >
              <Plus size={14} /> Add Piece Row
            </button>
          </div>

          {pieceLines.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#dfe5e7] bg-[#f8fafc] p-6 text-center text-xs font-mulish">
              <Boxes className="mx-auto text-[#908e92] mb-2" size={26} />
              <span className="font-bold text-[#556972] block">No individual cargo piece lines added</span>
              <span className="text-[11px] text-[#908e92] block mt-0.5">
                Add piece dimensions (cm) to calculate exact volumetric chargeable weight under IATA standards (L × W × H / 6,000).
              </span>
              <button
                type="button"
                onClick={handleAddPieceLine}
                className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-[#187e9c] px-4 py-2 text-xs font-bold text-white hover:bg-[#13667f] transition cursor-pointer"
              >
                <Plus size={14} /> Add First Piece Row
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pieceLines.map((line) => {
                const lineUnit = line.unit || quote.dimensionUnit || 'cm';
                const heightInCm = convertToCm(line.height, lineUnit);
                const isOverHeight = heightInCm > 100;
                const isHeavyPiece = line.weightPerPiece > 85;
                const lineVolCbm = calculateCbm(line.length, line.width, line.height, line.pieces, lineUnit);
                const lineVolWeight = calculateVolumetricWeight(line.length, line.width, line.height, line.pieces, lineUnit);

                return (
                  <div
                    key={line.id}
                    className="p-3 sm:p-4 rounded-xl border border-[#dfe5e7] bg-[#f8fafc] text-xs font-mulish space-y-2"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3 items-center">
                      <div>
                        <label className="block text-[10px] text-[#64748b] mb-1 font-bold">Pieces</label>
                        <input
                          type="number"
                          placeholder="1"
                          className="booking-input p-2 text-sm font-medium min-h-[44px]"
                          value={line.pieces === 0 ? '' : line.pieces}
                          onChange={(e) => handleUpdatePieceLine(line.id, 'pieces', Math.max(0, Number(e.target.value)))}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#64748b] mb-1 font-bold">Length ({lineUnit})</label>
                        <input
                          type="number"
                          placeholder={lineUnit}
                          className="booking-input p-2 text-sm font-medium min-h-[44px]"
                          value={line.length === 0 ? '' : line.length}
                          onChange={(e) => handleUpdatePieceLine(line.id, 'length', Math.max(0, Number(e.target.value)))}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#64748b] mb-1 font-bold">Width ({lineUnit})</label>
                        <input
                          type="number"
                          placeholder={lineUnit}
                          className="booking-input p-2 text-sm font-medium min-h-[44px]"
                          value={line.width === 0 ? '' : line.width}
                          onChange={(e) => handleUpdatePieceLine(line.id, 'width', Math.max(0, Number(e.target.value)))}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#64748b] mb-1 font-bold">Height ({lineUnit})</label>
                        <input
                          type="number"
                          placeholder={lineUnit}
                          className="booking-input p-2 text-sm font-medium min-h-[44px]"
                          value={line.height === 0 ? '' : line.height}
                          onChange={(e) => handleUpdatePieceLine(line.id, 'height', Math.max(0, Number(e.target.value)))}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#64748b] mb-1 font-bold">Wt/pc (kg)</label>
                        <input
                          type="number"
                          placeholder="kg"
                          className="booking-input p-2 text-sm font-medium min-h-[44px]"
                          value={line.weightPerPiece === 0 ? '' : line.weightPerPiece}
                          onChange={(e) => handleUpdatePieceLine(line.id, 'weightPerPiece', Math.max(0, Number(e.target.value)))}
                        />
                      </div>
                      <div className="text-right sm:text-center pt-2 sm:pt-3 col-span-2 sm:col-span-1 md:col-span-1">
                        <button
                          type="button"
                          onClick={() => handleRemovePieceLine(line.id)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 min-h-[40px] min-w-[40px] inline-flex items-center justify-center cursor-pointer transition"
                          aria-label="Remove piece row"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] pt-1 text-[#64748b] border-t border-[#edf2f4]">
                      <span className="flex items-center gap-1.5">
                        <span>Vol: <strong>{lineVolCbm} CBM</strong></span>
                        <span>&middot;</span>
                        <span>Vol Wt: <strong>{lineVolWeight} kg</strong></span>
                      </span>
                      {(isOverHeight || isHeavyPiece) && (
                        <span className="flex items-center gap-1 text-[#b44f47] font-bold">
                          <AlertCircle size={13} />
                          {isOverHeight ? 'Height >100cm requires wide-body freighter (B777/A330)' : 'Heavy piece (>85kg) requires forklift handling'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Trade & Cargo Specifications */}
          <div className="grid gap-4 md:grid-cols-2 pt-4 border-t border-[#e2e5e6]">
            <StyledSelect
              id="packagingType"
              label="Cargo Packaging Type *"
              value={booking.packagingType}
              onChange={(val) => updateBooking('packagingType', val as PackagingType)}
              icon={<Boxes size={16} />}
              placeholder="Select Cargo Packaging Type..."
              options={[
                { value: 'Wooden Crates (ISPM-15)', label: 'Wooden Crates (ISPM-15 Heat Treated / IPPC Stamped)' },
                { value: 'Corrugated Cartons', label: 'Corrugated Cartons (Heavy Duty 7-Ply Export)' },
                { value: 'Palletized Unit', label: 'Shrink-wrapped Pallet (Standard Air Pallet)' },
                { value: 'Drums / Barrels', label: 'Steel / Plastic Drums (UN Liquid/Solid Certified)' },
              ]}
            />

            <StyledSelect
              id="incoterm"
              label="Export Incoterm (Carrier PP) *"
              value={booking.incoterm}
              onChange={(val) => updateBooking('incoterm', val as Incoterm)}
              icon={<Globe2 size={16} />}
              placeholder="Select Export Incoterm..."
              options={[
                { value: 'CIF', label: 'CIF · Cost, Insurance & Freight (Prepaid PP - Standard)' },
                { value: 'CIP', label: 'CIP · Carriage and Insurance Paid To (Prepaid PP - Recommended)' },
                { value: 'CPT', label: 'CPT · Carriage Paid To (Prepaid PP - Direct Airline Tariff)' },
                { value: 'DAP', label: 'DAP · Delivered at Place (Prepaid PP - Door Delivery)' },
                { value: 'FOB', label: 'FOB · Free on Board (Prepaid Air Export Tariff)' },
                { value: 'EXW', label: 'EXW · Ex-Works (Factory Pickup + Prepaid Freight)' },
              ]}
            />

            <Field
              label="Commercial Commodity Description *"
              value={booking.cargoDescription}
              onChange={(val) => updateBooking('cargoDescription', val)}
              placeholder="e.g. Precision auto electrical brackets"
            />
            <div>
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <label className="font-mulish block text-[10px] sm:text-[11px] font-extrabold uppercase tracking-normal sm:tracking-[.08em] text-[#555c61]">
                  Harmonized System (HS) Code (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => updateBooking('hsCode', 'JFLL Customs Classification Desk')}
                  className="font-mulish text-[11px] font-bold text-[#187e9c] hover:underline cursor-pointer"
                >
                  Don&apos;t have HS Code? Let JFLL classify
                </button>
              </div>
              <input
                data-testid="input-hs-code"
                className="booking-input text-sm font-medium text-[#101820] min-h-[48px]"
                value={booking.hsCode}
                placeholder="e.g. 7318.15 or click to let JFLL classify"
                onChange={(e) => updateBooking('hsCode', e.target.value)}
              />
              <span className="font-mulish mt-1.5 block text-[11px] text-[#908e92]">
                6 or 8 digits for Indian Customs, or leave blank for our customs team to classify from description
              </span>
            </div>

            {(quote.cargoType === 'Pharma healthcare' || quote.cargoType === 'Perishables') && (
              <div className="md:col-span-2">
                <StyledSelect
                  id="tempCondition"
                  label={`${quote.cargoType === 'Pharma healthcare' ? 'Pharmaceutical' : 'Perishable'} Temperature Control Regime`}
                  value={booking.tempCondition || ''}
                  onChange={(val) => updateBooking('tempCondition', val as TempCondition)}
                  icon={<Clock3 size={16} />}
                  placeholder="Select Temperature Control Regime..."
                  options={[
                    { value: 'Cold Chain (+2° to +8°C)', label: 'COL · Cold Chain (+2°C to +8°C) Active Container / Reefer' },
                    { value: 'Controlled Room Temp (+15° to +25°C)', label: 'CRT · Controlled Room Temperature (+15°C to +25°C)' },
                    { value: 'None', label: 'Ambient · Standard Ambient Air Cargo' },
                  ]}
                />
              </div>
            )}

            {quote.cargoType === 'Dangerous goods' && (
              <div className="md:col-span-2 space-y-1">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <label className="font-mulish block text-[10px] sm:text-[11px] font-extrabold uppercase tracking-normal sm:tracking-[.08em] text-[#555c61]">
                    IATA UN Identification Number (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => updateBooking('dgUnNumber', 'Pending Classification (JFLL Hazmat Desk)')}
                    className="font-mulish text-[11px] font-bold text-[#187e9c] hover:underline cursor-pointer"
                  >
                    Don&apos;t have UN Number? Let JFLL identify
                  </button>
                </div>
                <input
                  data-testid="input-un-number"
                  className="booking-input text-sm font-medium text-[#101820] min-h-[48px]"
                  value={booking.dgUnNumber || ''}
                  onChange={(e) => updateBooking('dgUnNumber', e.target.value)}
                  placeholder="e.g. UN 3481 (or leave blank if unknown)"
                />
                <span className="font-mulish mt-1.5 block text-[11px] text-[#908e92]">
                  Only required for Dangerous Goods. Skip or leave blank if unknown — our IATA certified DGR desk will determine it from your Material Safety Data Sheet (MSDS).
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-Step 2: Review & Confirm */}
      {bookingSubStep === 2 && (
        <div className="space-y-5">
          {!selectedRate ? (
            <div className="rounded-2xl border border-dashed border-[#dfe5e7] bg-[#f8fafc] p-6 text-center font-mulish">
              <AlertCircle className="mx-auto text-[#b44f47] mb-2" size={24} />
              <p className="text-xs font-bold text-[#101820]">No freight rate selected</p>
              <button
                type="button"
                onClick={onBackToStep1}
                className="mt-3 rounded-full bg-[#187e9c] px-4 py-1.5 text-xs font-bold text-white cursor-pointer"
              >
                Search Rates
              </button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl border border-[#dfe5e7] bg-[#f8fafc] p-4 text-xs font-mulish space-y-2">
                <div className="flex items-center gap-2.5 pb-1 border-b border-[#eef2f3]">
                  <AirlineLogo
                    carrier={selectedRate.carrier}
                    carrierCode={selectedRate.carrierCode}
                    className="h-8 w-8"
                  />
                  <div>
                    <strong className="block text-sm text-[#101820]">Routing &amp; Schedule</strong>
                    <span className="text-[11px] text-[#65686d]">{formatAirlineName(selectedRate.carrier)} ({selectedRate.code})</span>
                  </div>
                </div>
                <div className="text-[#65686d]">Gateways: <strong className="text-[#101820]">{quote.origin} &rarr; {quote.destination}</strong></div>
                <div className="text-[#65686d]">Departure: <strong className="text-[#101820]">{selectedRate.departure}</strong></div>
                <div className="text-[#65686d]">Cutoff: <strong className="text-[#101820]">{selectedRate.cutoff}</strong></div>
                <div className="text-[#65686d]">Transit: <strong className="text-[#101820]">{selectedRate.transit}</strong></div>
              </div>

              <div className="rounded-2xl border border-[#dfe5e7] bg-[#f8fafc] p-4 text-xs font-mulish space-y-2">
                <strong className="block text-sm text-[#101820]">Cargo &amp; Compliance</strong>
                <div className="text-[#65686d]">Shipper IEC: <strong className="text-[#101820]">{booking.shipperIec}</strong></div>
                <div className="text-[#65686d]">Incoterm: <strong className="text-[#101820]">{booking.incoterm}</strong></div>
                <div className="text-[#65686d]">Packaging: <strong className="text-[#101820]">{booking.packagingType}</strong></div>
                <div className="text-[#65686d]">HS Code: <strong className="text-[#101820]">{booking.hsCode}</strong></div>
                {quote.cargoType === 'Dangerous goods' && booking.dgUnNumber && (
                  <div className="text-[#b44f47]">UN No: <strong>{booking.dgUnNumber}</strong></div>
                )}
                {(quote.cargoType === 'Pharma healthcare' || quote.cargoType === 'Perishables') && booking.tempCondition && booking.tempCondition !== 'None' && (
                  <div className="text-[#176579]">Temp Regime: <strong>{booking.tempCondition}</strong></div>
                )}
              </div>

              <div className="rounded-2xl border border-[#dfe5e7] bg-[#f8fafc] p-4 text-xs font-mulish space-y-2">
                <strong className="block text-sm text-[#101820]">Charges Summary</strong>
                {(() => {
                  const freightPrice = selectedRate.total;
                  const total = booking.doorPickup ? freightPrice + 2400 : freightPrice;
                  return (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[#65686d]">
                        <span>Air Freight (All-In):</span>
                        <strong className="text-[#101820]">{formatInr(freightPrice)}</strong>
                      </div>
                      {booking.doorPickup && (
                        <div className="flex justify-between text-[#187e9c]">
                          <span>Doorstep Factory Collection:</span>
                          <strong>₹2,400</strong>
                        </div>
                      )}
                      <div className="pt-2 border-t border-[#dfe5e7] flex justify-between font-extrabold text-sm text-[#101820]">
                        <span>Total Payable:</span>
                        <span className="text-[#187e9c]">{formatInr(total)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Checkboxes */}
          <div className="space-y-2.5 rounded-xl bg-[#f8fbfa] p-4 border border-[#d4e9e3] text-xs font-mulish">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                className="rounded accent-[#187e9c]"
                checked={booking.doorPickup}
                onChange={(e) => updateBooking('doorPickup', e.target.checked)}
              />
              <span className="font-bold text-[#101820]">
                Require doorstep factory collection in {quote.origin} (+₹2,400)
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                className="rounded accent-[#187e9c]"
                checked={dgAccepted}
                onChange={(e) => setDgAccepted(e.target.checked)}
              />
              <span className="text-[#475569]">
                {quote.cargoType === 'Dangerous goods' ? (
                  <span className="font-semibold text-[#8b5717]">
                    I confirm Dangerous Goods Declaration (DGD), UN-certified packaging ({booking.dgUnNumber || 'DGR'}), and acceptance of ₹8,500 RAC airline safety screening.
                  </span>
                ) : (
                  'I declare that this cargo contains no undeclared Dangerous Goods or restricted items.'
                )}
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                className="rounded accent-[#187e9c]"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <span className="text-[#475569]">
                I accept Jet Freight Logistics Ltd Standard Trading Conditions of Carriage and Indian ICEGATE customs filing mandates.
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Step Navigation Buttons */}
      <div className="flex items-center justify-between border-t border-[#e2e5e6] pt-6">
        <button
          type="button"
          onClick={() => {
            if (bookingSubStep > 0) setBookingSubStep((p) => p - 1);
            else onBackToStep1();
          }}
          className="font-mulish text-[11px] font-extrabold text-[#176579] hover:underline cursor-pointer flex items-center gap-1 py-2 px-3 rounded-lg hover:bg-[#eef8f5] transition"
        >
          <ChevronLeft size={15} /> Back
        </button>

        {bookingSubStep < 2 ? (
          <button
            type="button"
            onClick={onNextSubStep}
            className="focus-ring rounded-full bg-[#f2a63d] px-7 py-3 font-mulish text-[12px] font-extrabold text-[#10212b] transition hover:bg-[#f6bb63] cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
          >
            <span>Continue</span>
            <ChevronRight size={15} />
          </button>
        ) : (
          <button
            type="button"
            data-testid="button-confirm-booking"
            onClick={onConfirmBooking}
            disabled={isSubmitting || !selectedRate}
            className={`focus-ring rounded-full px-8 py-3.5 font-mulish text-[13px] font-extrabold text-white transition shadow-md active:scale-[0.98] cursor-pointer flex items-center gap-2 ${
              isSubmitting || !selectedRate
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-[#187e9c] hover:bg-[#13667f]'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Confirming Booking...</span>
              </>
            ) : (
              <span>Confirm &amp; Generate e-AWB</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
