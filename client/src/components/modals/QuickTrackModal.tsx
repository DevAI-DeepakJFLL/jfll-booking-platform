'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';

export interface ShipmentRecordSummary {
  reference: string;
  awbNumber: string;
  carrier: string;
  flight: string;
  origin: string;
  destination: string;
  chargeableWeight: number;
  status: string;
  milestones: Array<{
    title: string;
    description: string;
    timestamp: string;
    completed: boolean;
  }>;
}

export interface QuickTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipmentsList: ShipmentRecordSummary[];
  onSelectShipment: (shipment: any) => void;
}

export function QuickTrackModal({
  isOpen,
  onClose,
  shipmentsList,
  onSelectShipment,
}: QuickTrackModalProps) {
  const [trackQuery, setTrackQuery] = useState('');
  const [trackResult, setTrackResult] = useState<ShipmentRecordSummary | null>(null);

  const handleLookup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = trackQuery.trim().toUpperCase();
    if (!query) {
      setTrackResult(null);
      return;
    }
    const found = shipmentsList.find(
      (s) =>
        s.reference.toUpperCase().includes(query) ||
        s.awbNumber.toUpperCase().includes(query) ||
        s.flight.toUpperCase().includes(query)
    );
    setTrackResult(found ?? null);
  };

  const handleChipSelect = (code: string) => {
    setTrackQuery(code);
    const found = shipmentsList.find(
      (s) =>
        s.reference.toUpperCase().includes(code.toUpperCase()) ||
        s.awbNumber.toUpperCase().includes(code.toUpperCase())
    );
    setTrackResult(found ?? null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-lg rounded-2xl bg-white p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-[#dfe5e7] relative"
          >
            <div className="flex items-center justify-between border-b border-[#eef2f3] pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#101820] text-[#f2a63d]">
                  <Search size={18} />
                </span>
                <h3 className="font-extrabold text-base text-[#101820]">Track Your Air Export</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 -mr-2 text-[#64748b] hover:text-[#101820] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Close tracking lookup"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLookup} className="mt-4 flex gap-2">
              <input
                type="text"
                className="booking-input text-xs font-bold uppercase flex-1 min-h-[44px]"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                placeholder="Enter Ref (e.g. JFLL-AE-2026-04815) or AWB"
                data-testid="input-quick-track"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#101820] min-h-[44px] px-5 py-2.5 font-mulish text-xs font-extrabold text-white transition hover:bg-[#263740] active:scale-[0.98] cursor-pointer shadow-xs"
              >
                Track
              </button>
            </form>

            {/* Quick Sample Query Chips */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 font-mulish text-[11px]">
              <span className="text-[#7d8d93] font-bold">Try Sample:</span>
              {[
                { label: 'JFLL-AE-2026-04815', code: 'JFLL-AE-2026-04815' },
                { label: '176-9283-4011', code: '176-9283-4011' },
                { label: 'DEL-LHR (AI 161)', code: 'JFLL-AE-2026-04610' },
              ].map((chip) => (
                <button
                  key={chip.code}
                  type="button"
                  onClick={() => handleChipSelect(chip.code)}
                  className="rounded-full bg-[#f4f7f8] px-2.5 py-0.5 font-bold text-[#187e9c] hover:bg-[#e4eff2] transition cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {trackResult ? (
              <div className="mt-5 rounded-xl border border-[#d4e9e3] bg-[#f8fbfa] p-4 text-xs font-mulish space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-sm text-[#101820]">{trackResult.reference}</strong>
                  <span className="rounded-full bg-[#187e9c]/10 px-2 py-0.5 text-[#187e9c] font-extrabold">
                    {trackResult.status}
                  </span>
                </div>
                <div className="text-[#556972]">
                  Route: <strong>{trackResult.origin} &rarr; {trackResult.destination}</strong> ({trackResult.carrier} {trackResult.flight})
                </div>
                <div className="text-[#556972]">
                  AWB: <strong>{trackResult.awbNumber}</strong> &middot; Weight: {trackResult.chargeableWeight} kg
                </div>
                {trackResult.milestones?.[0] && (
                  <div className="pt-2 border-t border-[#d4e9e3] text-[#101820] font-bold">
                    Latest Event: {trackResult.milestones[0].title} &middot; {trackResult.milestones[0].timestamp}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onSelectShipment(trackResult);
                    onClose();
                  }}
                  className="mt-3 text-xs font-extrabold text-[#187e9c] hover:underline block cursor-pointer"
                >
                  View Full Milestone History in Operations Console &rarr;
                </button>
              </div>
            ) : trackQuery.trim() ? (
              <div className="mt-4 rounded-xl border border-dashed border-[#e2e5e6] p-4 text-center text-xs font-mulish text-[#64748b]">
                No shipment found matching &ldquo;{trackQuery}&rdquo;. Try clicking one of the sample references above.
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default QuickTrackModal;
