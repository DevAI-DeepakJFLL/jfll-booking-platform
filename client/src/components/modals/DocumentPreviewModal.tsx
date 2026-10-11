'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, FileCheck, FileText, X } from 'lucide-react';

export interface DocumentPreviewItem {
  title: string;
  type: string;
  reference: string;
}

export interface DocumentPreviewModalProps {
  document: DocumentPreviewItem | null;
  onClose: () => void;
}

export function DocumentPreviewModal({
  document,
  onClose,
}: DocumentPreviewModalProps) {
  if (!document) return null;

  return (
    <AnimatePresence>
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
                <FileText size={18} />
              </span>
              <h3 className="font-extrabold text-sm text-[#101820]">{document.title}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[#908e92] hover:text-[#101820] cursor-pointer"
              aria-label="Close document preview"
            >
              <X size={18} />
            </button>
          </div>

          <div className="my-5 rounded-xl border border-dashed border-[#c5d0d2] bg-[#f8f9fa] p-5 text-center font-mulish text-xs text-[#556972]">
            <FileCheck size={36} className="mx-auto text-[#187e9c] mb-2" />
            <strong className="block text-sm text-[#101820]">{document.type}</strong>
            <p className="mt-1">Generated electronically by Jet Freight Operations Engine</p>
            <span className="mt-2 inline-block rounded bg-white px-2.5 py-1 text-[11px] font-bold text-[#187e9c] border border-[#e2e5e6]">
              Reference: {document.reference}
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[#eef2f3] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="font-mulish text-xs font-bold text-[#556972] hover:text-[#101820] cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                alert(`Simulated PDF download for ${document.title}`);
                onClose();
              }}
              className="flex items-center gap-1.5 rounded-xl bg-[#187e9c] px-4 py-2 font-mulish text-xs font-extrabold text-white transition hover:bg-[#156b84] cursor-pointer"
            >
              <Download size={14} />
              <span>Download PDF</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default DocumentPreviewModal;
