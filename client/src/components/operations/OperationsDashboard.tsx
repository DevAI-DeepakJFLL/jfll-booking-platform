import React from 'react';
import {
  Building2,
  Clock3,
  FileCheck,
  FileText,
  Plane,
  Plus,
  Search,
  Check,
} from 'lucide-react';
import { AirlineLogo } from '../AirlineLogo';
import type { DocumentPreview, ShipmentRecord } from '../../types/booking';

export interface OperationsDashboardProps {
  shipmentsList: ShipmentRecord[];
  selectedShipment: ShipmentRecord;
  setSelectedShipment: (shipment: ShipmentRecord) => void;
  isContractUser: boolean;
  contractCompanyName: string;
  onOpenTrackModal: () => void;
  onBookNewShipment: () => void;
  onPreviewDocument: (doc: DocumentPreview) => void;
  formatInr: (amount: number) => string;
}

export function OperationsDashboard({
  shipmentsList,
  selectedShipment,
  setSelectedShipment,
  isContractUser,
  contractCompanyName,
  onOpenTrackModal,
  onBookNewShipment,
  onPreviewDocument,
  formatInr,
}: OperationsDashboardProps) {
  return (
    <section id="shipments" className="scroll-mt-5 bg-white py-20 md:py-28 border-t border-[#dfe5e7]">
      <div className="atlas-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="section-kicker">Live Shipment Operations</span>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-.055em] text-[#16243a] sm:text-4xl">
              Air Export Operations Console
            </h2>
            <p className="mt-2 text-sm text-[#65686d]">
              Direct digital handoff: track milestones, monitor airline cargo cutoffs, and retrieve legal documents.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isContractUser && (
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#d4e9e3] bg-[#eef8f5] px-3.5 py-1.5 font-mulish text-xs font-extrabold text-[#176579]">
                <Building2 size={13} className="text-[#187e9c]" />
                <span className="truncate max-w-[150px]">{contractCompanyName}</span>
              </div>
            )}
            <button
              type="button"
              onClick={onOpenTrackModal}
              className="focus-ring rounded-full border border-[#dfe5e7] bg-white px-4 py-2.5 font-mulish text-xs font-extrabold text-[#16243a] transition hover:bg-[#f4f7f8] flex items-center gap-1.5 cursor-pointer"
            >
              <Search size={13} className="text-[#187e9c]" />
              <span>Quick Track AWB</span>
            </button>
            <button
              type="button"
              onClick={onBookNewShipment}
              className="focus-ring rounded-full bg-[#101820] px-5 py-2.5 font-mulish text-xs font-extrabold text-white transition hover:bg-[#263740] flex items-center gap-2 cursor-pointer"
            >
              <Plus size={14} className="text-[#f2a63d]" />
              <span>Book New Shipment</span>
            </button>
          </div>
        </div>

        {/* Operations Console Container */}
        <div className="space-y-6">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Active Shipments', val: `${shipmentsList.length}`, sub: 'Air export corridors' },
              { label: 'AWB Pending', val: '1', sub: 'Within 2h SLA window' },
              { label: 'In Transit', val: '1', sub: 'DEL → LHR (AI 161)' },
              { label: 'Customs Cleared', val: '1', sub: 'LEO Endorsed' },
            ].map((stat, i) => (
              <div key={i} className="rounded-2xl border border-[#dfe5e7] bg-[#f8fbfa] p-5 shadow-xs">
                <span className="font-mulish text-[10px] font-extrabold uppercase tracking-wider text-[#908e92]">
                  {stat.label}
                </span>
                <div className="text-2xl font-black text-[#101820] mt-1">{stat.val}</div>
                <span className="font-mulish text-[11px] text-[#556972] mt-0.5 block">{stat.sub}</span>
              </div>
            ))}
          </div>

          {/* Master-Detail Console Grid */}
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1.3fr]">
            {/* Left Column: Active Bookings */}
            <div className="rounded-2xl border border-[#dfe5e7] bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-[#eef2f3] pb-3">
                <h3 className="font-extrabold text-base text-[#101820]">Active Bookings</h3>
                <span className="font-mulish text-xs text-[#908e92]">Showing recent export jobs</span>
              </div>

              <div className="space-y-3">
                {shipmentsList.map((shipment) => {
                  const isSelected = selectedShipment.reference === shipment.reference;
                  return (
                    <div
                      key={shipment.reference}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedShipment(shipment)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedShipment(shipment);
                        }
                      }}
                      className={`rounded-xl border p-4 cursor-pointer transition text-left ${
                        isSelected
                          ? 'border-[#187e9c] bg-[#f8fbfa] shadow-xs ring-1 ring-[#187e9c]'
                          : 'border-[#dfe5e7] bg-white hover:border-[#187e9c]/40 hover:bg-[#fafbfb]'
                      }`}
                      title={`Select shipment ${shipment.reference}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mulish text-xs font-black text-[#187e9c]">
                          {shipment.reference}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-mulish text-[10px] font-extrabold uppercase ${
                            shipment.status.includes('pending')
                              ? 'bg-[#fff4e4] text-[#8b5717]'
                              : shipment.status.includes('Flight')
                              ? 'bg-[#eaf9fd] text-[#187e9c]'
                              : 'bg-[#eef8f5] text-[#176579]'
                          }`}
                        >
                          {shipment.status}
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <AirlineLogo
                            carrier={shipment.carrier}
                            className="h-8 w-8"
                          />
                          <div className="min-w-0">
                            <strong className="text-sm text-[#101820] block truncate">
                              {shipment.origin} &rarr; {shipment.destination} &middot; {shipment.carrier}
                            </strong>
                            <span className="block font-mulish text-xs text-[#65686d] mt-0.5 truncate">
                              Flight {shipment.flight} &middot; {shipment.chargeableWeight} kg &middot; {shipment.commodity}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm font-extrabold text-[#101820] shrink-0">
                          {formatInr(shipment.totalAmount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Selected Shipment Detail */}
            <div className="rounded-2xl border border-[#dfe5e7] bg-white p-6 shadow-xs">
              <div className="border-b border-[#eef2f3] pb-4">
                <div className="flex items-center justify-between">
                  <span className="font-mulish text-xs font-extrabold uppercase text-[#908e92]">
                    Live Tracking Detail
                  </span>
                  <span className="font-mulish text-xs font-bold text-[#187e9c] bg-[#eef8f5] px-2.5 py-1 rounded-md">
                    AWB: {selectedShipment.awbNumber}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <AirlineLogo
                    carrier={selectedShipment.carrier}
                    className="h-10 w-10"
                  />
                  <div>
                    <h3 className="text-lg font-extrabold text-[#101820]">
                      {selectedShipment.origin} &rarr; {selectedShipment.destination} ({selectedShipment.carrier} {selectedShipment.flight})
                    </h3>
                    <div className="mt-0.5 flex items-center gap-3 font-mulish text-xs text-[#65686d]">
                      <span>Ready: {selectedShipment.readyDate}</span>
                      <span>&middot;</span>
                      <span>Cutoff: {selectedShipment.cutoff}</span>
                      <span>&middot;</span>
                      <span className="font-bold text-[#101820]">{selectedShipment.chargeableWeight} kg Chargeable</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Milestones Stepper */}
              <div className="mt-6">
                <div className="font-mulish text-[11px] font-extrabold uppercase tracking-wider text-[#908e92] mb-4">
                  Operational Milestones
                </div>
                <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#dfe5e7]">
                  {selectedShipment.milestones.map((m, idx) => (
                    <div key={idx} className="relative font-mulish text-xs">
                      <span
                        className={`absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white ${
                          m.completed
                            ? 'bg-[#187e9c] text-white'
                            : m.current
                            ? 'bg-[#f2a63d] text-[#101820] font-bold ring-2 ring-[#f2a63d]/30'
                            : 'bg-[#e2e5e6] text-[#908e92]'
                        }`}
                      >
                        {m.completed ? <Check size={12} /> : idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center justify-between">
                          <strong className={`text-sm ${m.current ? 'text-[#187e9c]' : 'text-[#101820]'}`}>
                            {m.title}
                          </strong>
                          <span className="text-[10px] text-[#908e92]">{m.timestamp}</span>
                        </div>
                        <p className="text-[#65686d] text-xs mt-0.5">{m.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document Actions */}
              <div className="mt-8 border-t border-[#eef2f3] pt-5">
                <div className="font-mulish text-[11px] font-extrabold uppercase tracking-wider text-[#908e92] mb-3">
                  Digital Shipment Documents
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      onPreviewDocument({
                        title: `Air Waybill Draft (${selectedShipment.awbNumber})`,
                        type: 'Master Air Waybill (e-AWB)',
                        reference: selectedShipment.reference,
                      })
                    }
                    className="flex items-center gap-2.5 rounded-xl border border-[#dfe5e7] p-3 text-left font-mulish text-xs transition hover:bg-[#f4f7f8] hover:border-[#187e9c] cursor-pointer"
                  >
                    <FileText size={18} className="text-[#187e9c] shrink-0" />
                    <div>
                      <span className="block font-bold text-[#101820]">MAWB Draft</span>
                      <span className="text-[10px] text-[#65686d]">PDF preview</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onPreviewDocument({
                        title: `GST Tax Invoice (INV-${selectedShipment.reference})`,
                        type: 'Official GST E-Invoice (IRN verified)',
                        reference: selectedShipment.reference,
                      })
                    }
                    className="flex items-center gap-2.5 rounded-xl border border-[#dfe5e7] p-3 text-left font-mulish text-xs transition hover:bg-[#f4f7f8] hover:border-[#187e9c] cursor-pointer"
                  >
                    <FileCheck size={18} className="text-[#176579] shrink-0" />
                    <div>
                      <span className="block font-bold text-[#101820]">GST E-Invoice</span>
                      <span className="text-[10px] text-[#65686d]">IRN generated</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Operational Capability Pillars */}
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              {
                icon: <Plane size={20} className="text-[#187e9c]" />,
                title: 'Direct ICES Milestone Tracking',
                desc: 'Monitor real-time progress from Sahar / IGI Cargo Complex gate intake to EDI Customs Let Export Order (LEO) endorsement and departure.',
                badge: 'Real-time telemetry',
              },
              {
                icon: <Clock3 size={20} className="text-[#8b5717]" />,
                title: 'Airline Cargo Cutoff Alerts',
                desc: 'Strict countdown timers for physical cargo handover and EDI manifest lock-ins, preventing expensive roll-overs and missed flights.',
                badge: 'SLA countdowns',
              },
              {
                icon: <FileCheck size={20} className="text-[#176579]" />,
                title: 'Digital e-AWB & Tax Invoicing',
                desc: 'Direct retrieval of officially stamped Master Air Waybills (e-AWB) and QR-verified GST E-Invoices generated via NIC IRN portals.',
                badge: 'Legally binding',
              },
            ].map((card, i) => (
              <div key={i} className="rounded-2xl border border-[#dfe5e7] bg-[#f8fbfa] p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#dfe5e7]">
                      {card.icon}
                    </div>
                    <span className="font-mulish text-[10px] font-extrabold uppercase tracking-wider text-[#908e92] bg-white px-2.5 py-1 rounded-md border border-[#dfe5e7]">
                      {card.badge}
                    </span>
                  </div>
                  <h4 className="mt-4 font-extrabold text-base text-[#101820]">{card.title}</h4>
                  <p className="mt-2 font-mulish text-xs leading-relaxed text-[#65686d]">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
