'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LockKeyhole, X } from 'lucide-react';

export interface CorporateUidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (uid: string, companyName: string) => void;
  initialUid?: string;
  initialCompany?: string;
}

export function CorporateUidModal({
  isOpen,
  onClose,
  onApply,
  initialUid = '',
  initialCompany = '',
}: CorporateUidModalProps) {
  const [uidInput, setUidInput] = useState(initialUid);
  const [companyName, setCompanyName] = useState(initialCompany);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uidInput.trim()) {
      setError('Please enter a valid Corporate UID or GSTIN.');
      return;
    }
    setError('');
    onApply(uidInput.trim(), companyName.trim() || 'Contract Enterprise Partner');
    onClose();
  };

  const handleDemoAccess = () => {
    const demoUid = 'JFLL-CORP-4820';
    const demoCompany = 'Apex Industrial Exports Ltd';
    setUidInput(demoUid);
    setCompanyName(demoCompany);
    setError('');
    onApply(demoUid, demoCompany);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#dfe5e7]"
          >
            <div className="flex items-center justify-between border-b border-[#eef2f3] pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#187e9c]/10 text-[#187e9c]">
                  <LockKeyhole size={18} />
                </span>
                <h3 className="font-extrabold text-base text-[#101820]">Contract Customer Login</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-[#908e92] hover:text-[#101820] cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 font-mulish text-xs text-[#65686d] leading-relaxed">
              Enter your JetFreight Corporate UID or GSTIN to surface negotiated contractual tariffs and assigned airline allocations.
            </div>

            {/* 1-Click Demo Login Bar */}
            <div className="mt-3.5 flex items-center justify-between rounded-xl bg-[#eef8f5] p-3 border border-[#d4e9e3]">
              <div className="font-mulish text-xs">
                <span className="font-extrabold text-[#176579] block">1-Click Demo Access</span>
                <span className="text-[#65686d]">Apex Industrial Exports Ltd (JFLL-CORP-4820)</span>
              </div>
              <button
                type="button"
                onClick={handleDemoAccess}
                className="rounded-lg bg-[#187e9c] px-3 py-1.5 font-mulish text-[11px] font-extrabold text-white hover:bg-[#156b84] transition cursor-pointer shrink-0"
              >
                Use Demo UID
              </button>
            </div>

            {error && (
              <div className="mt-3 rounded-lg bg-red-50 p-2 text-xs font-bold text-red-600">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="font-mulish block text-[11px] font-extrabold uppercase tracking-[.08em] text-[#4d5b62] mb-1">
                  Corporate UID / GSTIN
                </label>
                <input
                  type="text"
                  className="booking-input text-xs font-bold w-full uppercase"
                  value={uidInput}
                  onChange={(e) => setUidInput(e.target.value)}
                  placeholder="JFLL-CORP-XXXX"
                  data-testid="input-corporate-uid"
                />
              </div>

              <div>
                <label className="font-mulish block text-[11px] font-extrabold uppercase tracking-[.08em] text-[#4d5b62] mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  className="booking-input text-xs font-bold w-full"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Apex Industrial Exports Ltd"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#eef2f3] pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="font-mulish text-xs font-bold text-[#556972] hover:text-[#101820] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#187e9c] px-6 py-2.5 font-mulish text-xs font-extrabold text-white transition hover:bg-[#156b84] cursor-pointer"
                  data-testid="button-submit-uid"
                >
                  Apply Contract Rates
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default CorporateUidModal;
