import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Plane,
  ShieldCheck,
} from 'lucide-react';
import { AirlineLogo } from '../AirlineLogo';
import type { QuoteForm, Rate } from '../../types/booking';
import type { LocationItem } from '../../data/locations';

export interface RatesComparisonGridProps {
  quote: QuoteForm;
  chargeableWeight: number;
  dynamicRates: Rate[];
  filteredRates: Rate[];
  rateFilter: string;
  setRateFilter: (filter: 'all' | 'cheapest' | 'fastest' | 'direct') => void;
  sortAsc: boolean;
  setSortAsc: React.Dispatch<React.SetStateAction<boolean>>;
  directCount: number;
  isSearchingRates: boolean;
  selectedRate: Rate | null;
  onSelectRate: (rate: Rate) => void;
  onModifySearch: () => void;
  formatInr: (amount: number) => string;
  formatAirlineName: (airline: string) => string;
  locations: LocationItem[];
}

export function RatesComparisonGrid({
  quote,
  chargeableWeight,
  dynamicRates,
  filteredRates,
  rateFilter,
  setRateFilter,
  sortAsc,
  setSortAsc,
  directCount,
  isSearchingRates,
  selectedRate,
  onSelectRate,
  onModifySearch,
  formatInr,
  formatAirlineName,
  locations,
}: RatesComparisonGridProps) {
  return (
    <div key="rates" className="space-y-6">
      {/* Search Summary Header Bar */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#e2e5e6] pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="font-mulish text-[11px] font-bold text-[#908e92]">
            {quote.pieces} pieces &middot; {chargeableWeight} kg chargeable &middot; {quote.cargoType}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xl font-semibold text-[#101820]">
            <span>{quote.origin}</span>
            <ArrowRight size={17} className="text-[#f2a63d]" />
            <span>{quote.destination}</span>
            <span className="font-mulish ml-1 text-[11px] font-bold text-[#176579]">Air export</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter rates">
            {[
              { value: 'all', label: `All Flights (${dynamicRates.length})` },
              {
                value: 'cheapest',
                label: rateFilter === 'cheapest' ? (sortAsc ? 'Lowest Price ↑' : 'Highest Price ↓') : 'Lowest Price',
              },
              {
                value: 'fastest',
                label: rateFilter === 'fastest' ? (sortAsc ? 'Fastest Transit ↑' : 'Longest Transit ↓') : 'Fastest Transit',
              },
              { value: 'direct', label: `Direct Only (${directCount})` },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  if (rateFilter === tab.value && (tab.value === 'cheapest' || tab.value === 'fastest')) {
                    setSortAsc((prev) => !prev);
                  } else {
                    setRateFilter(tab.value as any);
                    setSortAsc(true);
                  }
                }}
                className={`rounded-full px-3 py-1 font-mulish text-[11px] font-extrabold transition cursor-pointer flex items-center gap-1 ${
                  rateFilter === tab.value
                    ? 'bg-[#101820] text-white shadow-xs'
                    : 'bg-[#f4f7f8] text-[#556972] hover:bg-[#e7edf0]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onModifySearch}
            className="font-mulish text-[11px] font-extrabold text-[#187e9c] hover:underline cursor-pointer ml-1"
          >
            Modify search
          </button>
        </div>
      </div>

      {/* Main Two-Column Grid: Rates on Left, Sidebars on Right */}
      <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        {/* Left: Rate Cards */}
        <div className="space-y-4">
          {isSearchingRates ? (
            <div className="space-y-4 font-mulish">
              <div className="rounded-2xl border border-[#dfe5e7] bg-white p-6 text-center shadow-xs">
                <div className="flex items-center justify-center gap-3 text-[#187e9c]">
                  <Plane className="animate-bounce" size={24} />
                  <span className="font-extrabold text-sm text-[#101820]">
                    Searching airline tariffs for {quote.origin || 'BOM'} &rarr; {quote.destination || 'DXB'} ({chargeableWeight} kg)...
                  </span>
                </div>
                <p className="text-xs text-[#64748b] mt-1.5">
                  Comparing scheduled flight tariffs, fuel surcharges, and terminal handling...
                </p>
              </div>
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-2xl border border-[#e2e8f0] bg-white p-6 animate-pulse space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-200" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 rounded bg-slate-200" />
                        <div className="h-3 w-24 rounded bg-slate-100" />
                      </div>
                    </div>
                    <div className="h-6 w-20 rounded-full bg-slate-100" />
                  </div>
                  <div className="h-12 w-full rounded-xl bg-slate-100" />
                </div>
              ))}
            </div>
          ) : filteredRates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#dfe5e7] bg-[#f8fafc] p-8 text-center font-mulish">
              <Plane className="mx-auto text-[#908e92] mb-3" size={32} />
              <h3 className="text-sm font-bold text-[#101820]">No tariff rates found for this query</h3>
              <p className="text-xs text-[#65686d] mt-1 max-w-sm mx-auto">
                Consolidated rate sheet tariffs are active for BOM &rarr; DXB (17 carriers) and BOM &rarr; SHA (16 carriers). Please check your origin, destination, and commodity category.
              </p>
              <button
                type="button"
                onClick={onModifySearch}
                className="mt-4 rounded-full bg-[#187e9c] px-4 py-2 text-xs font-bold text-white hover:bg-[#13667f] transition cursor-pointer"
              >
                Modify Route &amp; Cargo
              </button>
            </div>
          ) : (
            filteredRates.map((rate) => {
              const finalPrice = rate.total;
              const isSelected = selectedRate?.id === rate.id;

              return (
                <motion.div
                  layout
                  key={rate.id}
                  className={`rate-card rounded-2xl border p-5 sm:p-6 transition bg-white ${
                    isSelected
                      ? 'border-[#187e9c] ring-2 ring-[#187e9c]/20 shadow-sm'
                      : 'border-[#dfe5e7] hover:border-[#187e9c] hover:shadow-xs'
                  }`}
                >
                  {/* Top Header: Monogram & Airline Name (Left) + Price Hero (Right) */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 pb-3.5 border-b border-[#f0f3f5]">
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                      <AirlineLogo
                        carrier={rate.carrier}
                        carrierCode={rate.carrierCode}
                        className="h-10 w-10 sm:h-12 sm:w-12 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-sm sm:text-base text-[#101820] tracking-tight truncate">
                          {formatAirlineName(rate.carrier)}
                        </h4>
                        <div className="mt-0.5 flex items-center gap-1.5 sm:gap-2 font-mulish text-xs text-[#64748b] flex-wrap">
                          <span className="shrink-0">Flight <strong className="font-mono font-bold text-[#101820]">{rate.code}</strong></span>
                          <span className="text-[#cbd5e1]">&middot;</span>
                          <span className="text-[#475569] font-medium truncate">{rate.service || 'Scheduled Cargo'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Top Right: High-Impact Price Hero */}
                    <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 sm:text-right shrink-0">
                      {rate.recommended && (
                        <div className="sm:mb-1 order-2 sm:order-1">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#ecfdf5] px-2.5 py-0.5 font-mulish text-[10px] font-bold text-[#047857] border border-[#a7f3d0] shadow-2xs">
                            <CheckCircle2 size={11} className="text-[#059669]" />
                            Lowest Fare
                          </span>
                        </div>
                      )}
                      <div className="flex items-baseline justify-end gap-1.5 order-1 sm:order-2">
                        <span className="font-mono text-xl sm:text-2xl font-black text-[#101820] tracking-tight">
                          {formatInr(finalPrice)}
                        </span>
                        <span className="text-[11px] font-bold text-[#64748b] font-mulish">all-in</span>
                      </div>
                    </div>
                  </div>

                  {/* Center: Journey Flow */}
                  <div className="grid grid-cols-3 sm:grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 py-3 sm:py-4 my-1 border-b border-[#f0f3f5]">
                    {/* Departure */}
                    <div>
                      <div className="text-[9px] sm:text-[10px] font-extrabold text-[#908e92] uppercase tracking-wider font-mulish">Departure</div>
                      <div className="mt-0.5 flex items-baseline gap-1 sm:gap-2">
                        <span className="font-mono text-base sm:text-xl font-black text-[#101820]">{rate.departure.split(' ')[0] || '14:30'}</span>
                        <span className="font-bold text-xs text-[#475569]">{quote.origin || 'BOM'}</span>
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-[#64748b] font-mulish mt-0.5 truncate">
                        {locations.find((l) => l.code === (quote.origin || 'BOM'))?.city || 'Origin'} ({rate.departure.split(' ')[1] || 'IST'})
                      </div>
                    </div>

                    {/* Transit Timeline & Visual Path */}
                    <div className="flex flex-col items-center justify-center text-center px-1">
                      <span className="font-mulish text-[10px] sm:text-xs font-bold text-[#475569] flex items-center gap-1">
                        <Clock3 size={11} className="text-[#187e9c] shrink-0 sm:size-[13px]" />
                        {rate.transit}
                      </span>
                      <div className="relative flex items-center justify-center w-full max-w-[85px] sm:max-w-[140px] my-1 sm:my-1.5">
                        <div className="h-0.5 w-full bg-[#cbd5e1]" />
                        <div className="absolute flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-white border border-[#94a3b8] text-[#187e9c] shadow-2xs">
                          <Plane size={9} className="rotate-45 sm:size-[11px]" />
                        </div>
                      </div>
                      <span className="font-mulish text-[9px] sm:text-[11px] font-bold text-[#187e9c]">
                        {rate.direct ? 'Direct Flight' : 'Connecting'}
                      </span>
                    </div>

                    {/* Arrival */}
                    <div className="text-right">
                      <div className="text-[9px] sm:text-[10px] font-extrabold text-[#908e92] uppercase tracking-wider font-mulish">Arrival</div>
                      <div className="mt-0.5 flex items-baseline justify-end gap-1 sm:gap-2">
                        <span className="font-mono text-base sm:text-xl font-black text-[#101820]">{rate.arrival.split(' ')[0] || '18:45'}</span>
                        <span className="font-bold text-xs text-[#475569]">{quote.destination || 'DXB'}</span>
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-[#64748b] font-mulish mt-0.5 truncate">
                        {locations.find((l) => l.code === (quote.destination || 'DXB'))?.city || 'Destination'} ({rate.arrival.split(' ')[1] || 'Local'})
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Cutoff & Cargo Stats on Left, Select CTA on Right */}
                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2 font-mulish text-xs text-[#64748b]">
                      <Clock3 size={13} className="text-[#908e92] shrink-0" />
                      <span>Cutoff: <strong className="text-[#101820] font-bold">{rate.cutoff || '08:00 IST'}</strong></span>
                      <span className="text-[#cbd5e1]">&middot;</span>
                      <span>Weight: <strong className="text-[#101820]">{chargeableWeight} kg</strong></span>
                    </div>

                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => onSelectRate(rate)}
                        className="focus-ring rounded-full bg-[#187e9c] hover:bg-[#13667f] px-6 py-2.5 font-mulish text-xs font-extrabold text-white transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        Select Rate <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Right: Sidebars */}
        <div className="space-y-4">
          {/* Direct Airline Space Guarantee Card */}
          <div className="rounded-2xl border border-[#dfe5e7] bg-[#f8fafc] p-5 font-mulish text-xs">
            <div className="flex items-center gap-2 mb-2">
              <Plane size={16} className="text-[#187e9c]" />
              <strong className="text-sm text-[#101820]">Confirmed Airline Allocations</strong>
            </div>
            <p className="text-[#65686d] leading-relaxed">
              Published scheduled flight tariffs with confirmed space allocations across widebody passenger and freighter flights from {quote.origin || 'BOM'} to {quote.destination || 'DXB'}.
            </p>
          </div>

          {/* All-in Rates Guarantee Card */}
          <div className="rounded-2xl border border-[#dfe5e7] bg-[#f8fafc] p-5 font-mulish text-xs">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-[#176579]" />
              <strong className="text-sm text-[#101820]">All-in rates, no surprises</strong>
            </div>
            <p className="text-[#65686d] leading-relaxed">
              Every rate includes fuel &amp; security surcharges, AWB issuance, and airport origin handling. Destination charges are billed to consignee unless prepaid.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
