import React from 'react';
import { Check, CheckCircle2, Copy } from 'lucide-react';
import type { BookingForm, QuoteForm } from '../../types/booking';
import type { RateItem } from '../../services/rate-discovery.service';

export interface BookingConfirmationProps {
  booking: BookingForm;
  reference: string;
  quote: QuoteForm;
  selectedRate: { carrier?: string } | null;
  copiedReference: boolean;
  onCopyReference: () => void;
  cloudSyncStatus: {
    status: 'idle' | 'syncing' | 'synced' | 'error';
    message?: string;
    messageId?: string;
  };
  onGoToOperations: () => void;
  onStartAnotherQuote: () => void;
}

export function BookingConfirmation({
  booking,
  reference,
  quote,
  selectedRate,
  copiedReference,
  onCopyReference,
  cloudSyncStatus,
  onGoToOperations,
  onStartAnotherQuote,
}: BookingConfirmationProps) {
  return (
    <div key="confirmation" className="py-8 text-center sm:py-12">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e4f5ef] text-[#176579]">
        <CheckCircle2 size={34} />
      </div>
      <div className="section-kicker mt-7">Booking request confirmed</div>
      <h3 className="mt-3 text-3xl font-semibold tracking-[-.05em] text-[#101820]">
        You are cleared for take-off.
      </h3>
      <p className="mx-auto mt-4 max-w-[475px] leading-6 text-[#65686d] text-sm">
        We have sent your confirmation to {booking.shipperEmail}. Operations will issue your airway bill within two business hours.
      </p>

      <div className="mx-auto mt-7 max-w-[440px] rounded-2xl bg-[#f4f7f8] p-5 text-left border border-[#dfe5e7]">
        <div className="font-mulish text-[10px] font-extrabold uppercase tracking-[.14em] text-[#908e92]">
          Booking Reference
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <strong className="text-lg sm:text-2xl font-mono tracking-tight text-[#101820] truncate shrink min-w-0">
            {reference}
          </strong>
          <button
            type="button"
            onClick={onCopyReference}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#64748b] hover:bg-[#e4ebed] hover:text-[#101820] transition cursor-pointer shrink-0 min-h-[36px]"
            title="Copy reference"
          >
            {copiedReference ? (
              <>
                <Check size={15} className="text-[#176579]" />
                <span className="text-[#176579] font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={15} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#dfe5e7] pt-4 font-mulish text-[11px]">
          <span className="text-[#908e92]">Route</span>
          <strong className="text-right text-[#101820]">
            {quote.origin} &rarr; {quote.destination}
          </strong>
          <span className="text-[#908e92]">Carrier</span>
          <strong className="text-right text-[#101820]">{selectedRate?.carrier || 'Carrier Partner'}</strong>
        </div>

        {/* Live Cloud Persistence & Email Status Indicator */}
        {cloudSyncStatus.status === 'syncing' && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-amber-50/80 p-2.5 text-[11px] font-semibold text-amber-800 border border-amber-200/80">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-amber-700 border-t-transparent shrink-0" />
            <span>{cloudSyncStatus.message}</span>
          </div>
        )}
        {cloudSyncStatus.status === 'synced' && (
          <div className="mt-4 flex flex-col items-center gap-1 rounded-xl bg-emerald-50/80 p-2.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200/80 text-center">
            <div className="flex items-center gap-1.5">
              <Check size={14} className="text-emerald-700" />
              <span>{cloudSyncStatus.message}</span>
            </div>
            {cloudSyncStatus.messageId && (
              <span className="font-mono text-[10px] text-emerald-600">
                Gmail Notification ID: {cloudSyncStatus.messageId}
              </span>
            )}
          </div>
        )}
        {cloudSyncStatus.status === 'error' && (
          <div className="mt-4 flex flex-col items-center gap-1 rounded-xl bg-rose-50/80 p-2.5 text-[11px] font-semibold text-rose-800 border border-rose-200/80 text-center">
            <span className="font-bold">Cloud Sync Alert</span>
            <span className="text-[10px] text-rose-700">{cloudSyncStatus.message}</span>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onGoToOperations}
          className="focus-ring rounded-full bg-[#101820] px-6 py-3 font-mulish text-[12px] font-extrabold text-white hover:bg-[#263740]"
        >
          Go to Operations Console
        </button>
        <button
          type="button"
          onClick={onStartAnotherQuote}
          className="focus-ring rounded-full border border-[#c7c6c8] px-6 py-3 font-mulish text-[12px] font-extrabold text-[#101820] hover:bg-[#f4f7f8]"
        >
          Start another quote
        </button>
      </div>
    </div>
  );
}
