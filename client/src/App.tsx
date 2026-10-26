'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CircleHelp,
  Clock3,
  Copy,
  FileText,
  Globe2,
  Info,
  LockKeyhole,
  MapPin,
  Menu,
  Plane,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
  Search,
  Building2,
  Download,
  UserCheck,
  AlertCircle,
  FileCheck,
  Boxes,
  Plus,
  Trash2,
  Calendar,
} from 'lucide-react';
import { fetchLiveOrCalculatedRates, type RateItem } from './services/rate-discovery.service';
import {
  formatAirlineName,
  CARRIER_CODE_MAP,
  formatInr,
  parseTransitMinutes,
  parseDepartureMinutes,
  convertToCm,
  calculateVolumetricWeight,
  calculateCbm,
  type DimensionUnit,
} from './lib/freight-domain';
import { AirlineLogo } from './components/AirlineLogo';
import { QuickTrackModal } from './components/modals/QuickTrackModal';
import { DocumentPreviewModal } from './components/modals/DocumentPreviewModal';
import { HeavyCargoInquiry } from './components/rates/HeavyCargoInquiry';
import { Field, StyledSelect, CustomDatePicker } from './components/form/FormControls';
import type {
  CargoType,
  QuoteForm,
  PieceLine,
  Incoterm,
  PackagingType,
  TempCondition,
  BookingForm,
  RateBreakdown,
  Rate,
  Milestone,
  ShipmentRecord,
  DocumentPreview,
} from './types/booking';
export type {
  CargoType,
  QuoteForm,
  PieceLine,
  Incoterm,
  PackagingType,
  TempCondition,
  BookingForm,
  RateBreakdown,
  Rate,
  Milestone,
  ShipmentRecord,
  DocumentPreview,
};

/* ==========================================================================
   STATIC DATA & CATALOG
   ========================================================================== */

const originLocations = [
  { code: 'BOM', city: 'Mumbai', airport: 'Chhatrapati Shivaji Maharaj International Airport' },
];

const destLocations = [
  { code: 'DXB', city: 'Dubai', airport: 'Dubai International Airport' },
  { code: 'SHA', city: 'Shanghai', airport: 'Shanghai Pudong International Airport' },
];

const locations = [
  { code: 'BOM', city: 'Mumbai', airport: 'Chhatrapati Shivaji Maharaj Intl' },
  { code: 'DXB', city: 'Dubai', airport: 'Dubai International' },
  { code: 'SHA', city: 'Shanghai', airport: 'Pudong International' },
  { code: 'DEL', city: 'Delhi', airport: 'Indira Gandhi International' },
  { code: 'BLR', city: 'Bangalore', airport: 'Kempegowda International' },
  { code: 'AMD', city: 'Ahmedabad', airport: 'Sardar Vallabhbhai Patel Intl' },
  { code: 'MAA', city: 'Chennai', airport: 'Chennai International' },
  { code: 'LHR', city: 'London', airport: 'Heathrow Airport' },
  { code: 'JFK', city: 'New York', airport: 'John F. Kennedy Intl' },
  { code: 'FRA', city: 'Frankfurt', airport: 'Frankfurt Airport' },
  { code: 'SIN', city: 'Singapore', airport: 'Changi Airport' },
  { code: 'LOS', city: 'Lagos', airport: 'Murtala Muhammed Intl' },
];

const cargoCategoryOptions = [
  { value: 'General cargo', label: 'General Cargo (Standard Freight / Consolidated)' },
  { value: 'Express courier', label: 'Express Courier (Priority Uplift / High Speed)' },
  { value: 'Pharma healthcare', label: 'Pharma Healthcare (Temperature Controlled / Cool Chain)' },
  { value: 'Dangerous goods', label: 'Dangerous Goods (DGR / Hazmat / Lithium Batteries)' },
  { value: 'Perishables', label: 'Perishables (Cold Storage / Fresh Food / Flowers)' },
];

const mockShipments: ShipmentRecord[] = [
  {
    reference: 'JFLL-AE-2026-04815',
    awbNumber: '176-9283-4011',
    carrier: 'Emirates SkyCargo',
    flight: 'EK 509',
    origin: 'BOM',
    destination: 'DXB',
    chargeableWeight: 240,
    commodity: 'Cotton knitted garments & samples',
    status: 'Booking Confirmed - AWB pending',
    statusStep: 1,
    readyDate: '27-08-2026',
    cutoff: '26 Aug, 18:00',
    totalAmount: 79000,
    pickupRequired: true,
    milestones: [
      {
        title: 'Booking Confirmed',
        description: 'Job file opened with operations desk · Rate secured',
        timestamp: '25 Aug 2026, 11:30 IST',
        completed: true,
      },
      {
        title: 'AWB Generation & Verification',
        description: 'Master AWB drafting in progress · Verified against customs checklist',
        timestamp: 'Estimated within 2 working hours',
        completed: false,
        current: true,
      },
      {
        title: 'Cargo Tender at BOM Warehouse',
        description: 'Delivery to Sahar Cargo Complex, Gate 4 before cutoff',
        timestamp: '26 Aug 2026, by 18:00 IST',
        completed: false,
      },
      {
        title: 'Customs Clearance (LEO Issued)',
        description: 'Shipping bill verification & EDI Let Export Order endorsement',
        timestamp: '26 Aug 2026, 21:00 IST',
        completed: false,
      },
      {
        title: 'Flight Departure (EK 509)',
        description: 'Depart Mumbai (BOM) en route to Dubai (DXB)',
        timestamp: '27 Aug 2026, 04:30 IST',
        completed: false,
      },
      {
        title: 'Destination Arrival & Consignee Handover',
        description: 'Arrived DXB Cargo Terminal · Ready for consignee pickup',
        timestamp: '27 Aug 2026, 06:45 GST',
        completed: false,
      },
    ],
  },
  {
    reference: 'JFLL-AE-2026-04790',
    awbNumber: '020-4491-8820',
    carrier: 'Lufthansa Cargo',
    flight: 'LH 757',
    origin: 'BOM',
    destination: 'FRA',
    chargeableWeight: 520,
    commodity: 'Precision auto electrical components',
    status: 'Cargo Tendered at BOM',
    statusStep: 2,
    readyDate: '24-08-2026',
    cutoff: '24 Aug, 16:00',
    totalAmount: 184500,
    pickupRequired: false,
    milestones: [
      {
        title: 'Booking Confirmed',
        description: 'Job file validated with Lufthansa allotment',
        timestamp: '23 Aug 2026, 14:10 IST',
        completed: true,
      },
      {
        title: 'AWB Generation & Verification',
        description: 'Master AWB 020-4491-8820 issued and signed',
        timestamp: '23 Aug 2026, 16:45 IST',
        completed: true,
      },
      {
        title: 'Cargo Tender at BOM Warehouse',
        description: 'Delivered Sahar Cargo Complex Gate 3 · Security scanned',
        timestamp: '24 Aug 2026, 15:30 IST',
        completed: true,
        current: true,
      },
      {
        title: 'Customs Clearance (LEO Issued)',
        description: 'EDI validation pending Customs Officer signature',
        timestamp: 'Expected 24 Aug 2026, 20:00 IST',
        completed: false,
      },
      {
        title: 'Flight Departure (LH 757)',
        description: 'Scheduled departure BOM to FRA',
        timestamp: '25 Aug 2026, 01:50 IST',
        completed: false,
      },
      {
        title: 'Destination Arrival & Consignee Handover',
        description: 'Frankfurt Cargo City South pickup terminal',
        timestamp: '25 Aug 2026, 07:15 CET',
        completed: false,
      },
    ],
  },
  {
    reference: 'JFLL-AE-2026-04610',
    awbNumber: '098-1120-7741',
    carrier: 'Air India Cargo',
    flight: 'AI 161',
    origin: 'DEL',
    destination: 'LHR',
    chargeableWeight: 840,
    commodity: 'Active pharmaceutical ingredients (cold chain 15-25C)',
    status: 'In Flight to London',
    statusStep: 5,
    readyDate: '22-08-2026',
    cutoff: '22 Aug, 19:00',
    totalAmount: 312000,
    pickupRequired: true,
    milestones: [
      {
        title: 'Booking Confirmed',
        description: 'Temperature-controlled space locked',
        timestamp: '21 Aug 2026, 09:00 IST',
        completed: true,
      },
      {
        title: 'AWB Generation & Verification',
        description: 'e-AWB transmitted to Heathrow Border Force',
        timestamp: '21 Aug 2026, 11:20 IST',
        completed: true,
      },
      {
        title: 'Cargo Tender at IGI Terminal',
        description: 'Tendered in active Envirotainer unit',
        timestamp: '22 Aug 2026, 18:30 IST',
        completed: true,
      },
      {
        title: 'Customs Clearance (LEO Issued)',
        description: 'LEO issued via ICES 2.0 system',
        timestamp: '22 Aug 2026, 21:15 IST',
        completed: true,
      },
      {
        title: 'Flight Departure (AI 161)',
        description: 'Airborne over European airspace',
        timestamp: '23 Aug 2026, 02:45 IST',
        completed: true,
        current: true,
      },
      {
        title: 'Destination Arrival & Consignee Handover',
        description: 'Heathrow World Cargo Centre ramp bay',
        timestamp: 'Estimated 23 Aug 2026, 07:30 GMT',
        completed: false,
      },
    ],
  },
];

const getToday = () => new Date().toISOString().slice(0, 10);

/* ==========================================================================
   UI HELPER COMPONENTS (AUTHENTIC SPECIFICATION)
   ========================================================================== */

function Logo() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="flex items-center gap-3 focus-ring text-left cursor-pointer transition hover:opacity-90"
      data-testid="link-logo"
      aria-label="Jet Freight Home"
    >
      <span className="jet-mark" aria-hidden="true">
        <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 29.5C15.4 28.8 19.8 25.8 22.3 20.3C24.1 16.4 28.6 13.2 36 13" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M22 7L36 13L29 26" stroke="#23c2f2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="30" r="2.2" fill="#f2a63d" />
        </svg>
      </span>
      <div>
        <div className="font-semibold tracking-[-.04em] text-[#16243a]">Jet Freight</div>
        <div className="tiny-label -mt-0.5 text-[#6c7d85]">Atlas Digital</div>
      </div>
    </button>
  );
}

function AtlasAircraft() {
  return (
    <svg viewBox="0 0 360 560" fill="none" role="img" aria-label="Top-down illustration of a cargo aircraft">
      <defs>
        <linearGradient id="aircraftBody" x1="180" y1="24" x2="180" y2="520" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fffdf6" />
          <stop offset=".45" stopColor="#dbe7e8" />
          <stop offset=".72" stopColor="#9ab9c2" />
          <stop offset="1" stopColor="#f2f0df" />
        </linearGradient>
        <linearGradient id="aircraftWing" x1="48" y1="237" x2="312" y2="237" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9cbfc5" />
          <stop offset=".5" stopColor="#e9f1ed" />
          <stop offset="1" stopColor="#9cbfc5" />
        </linearGradient>
        <linearGradient id="aircraftTail" x1="180" y1="430" x2="180" y2="541" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e5f1ea" />
          <stop offset="1" stopColor="#628e9d" />
        </linearGradient>
        <filter id="aircraftShadow" x="16" y="2" width="328" height="552" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="14" stdDeviation="9" floodColor="#405b65" floodOpacity=".22" />
        </filter>
      </defs>
      <g filter="url(#aircraftShadow)">
        <path d="M177.8 20C169.4 28.5 164.6 43.8 163.6 66.3L156.8 214.7L39.5 285.3C34.4 288.4 31.2 294.3 31.2 300.3V312.2L157.3 270.5L153.6 390.4L104.2 432.7C100.2 436.2 98 441.4 98.4 446.7L99.5 456.1L163.1 426.5L180 416.9L196.9 426.5L260.5 456.1L261.6 446.7C262 441.4 259.8 436.2 255.8 432.7L206.4 390.4L202.7 270.5L328.8 312.2V300.3C328.8 294.3 325.6 288.4 320.5 285.3L203.2 214.7L196.4 66.3C195.4 43.8 190.6 28.5 182.2 20C181 18.8 179 18.8 177.8 20Z" fill="url(#aircraftWing)" stroke="#5c8590" strokeWidth="1.2" />
        <path d="M180 22C166.7 38.9 165.2 64.6 165.5 93.1L169.3 365.4C169.7 396.5 172.7 423.9 180 453.1C187.3 423.9 190.3 396.5 190.7 365.4L194.5 93.1C194.8 64.6 193.3 38.9 180 22Z" fill="url(#aircraftBody)" stroke="#658b94" strokeWidth="1.2" />
        <path d="M180 453.1L149.4 519.4C147.6 523.3 150.5 527.7 154.8 527.7H205.2C209.5 527.7 212.4 523.3 210.6 519.4L180 453.1Z" fill="url(#aircraftTail)" stroke="#5c8590" strokeWidth="1.2" />
        <path d="M165.4 232.4L61.7 292.7L157.3 261.2L165.4 232.4ZM194.6 232.4L298.3 292.7L202.7 261.2L194.6 232.4Z" fill="#c7dde0" opacity=".72" />
        <path d="M180 39V446" stroke="#d8a04d" strokeWidth="2" strokeDasharray="8 8" opacity=".8" />
        <path d="M174.6 71H185.4M173.8 98H186.2M173.2 125H186.8M172.7 152H187.3" stroke="#496a75" strokeWidth="2" strokeLinecap="round" opacity=".8" />
        <path d="M163.8 215L180 234L196.2 215" stroke="#456872" strokeWidth="1.4" opacity=".75" />
        <path d="M163.9 369L180 386L196.1 369" stroke="#456872" strokeWidth="1.4" opacity=".72" />
        <ellipse cx="180" cy="66" rx="6" ry="13" fill="#294f61" />
        <path d="M177 64C178 57 182 57 183 64V75H177V64Z" fill="#b7e2e0" />
      </g>
    </svg>
  );
}

/* ==========================================================================
   MAIN APPLICATION
   ========================================================================== */

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [bookingSubStep, setBookingSubStep] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [cookieVisible, setCookieVisible] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem('jf-cookie-consent') !== 'accepted') {
        setCookieVisible(true);
      }
    } catch {}
  }, []);

  // JFLL Returning Partner identification state (replaces separate corporate login)
  const [hasWorkedWithJfll, setHasWorkedWithJfll] = useState<boolean>(false);
  const [jfllIdentifier, setJfllIdentifier] = useState<string>('');
  const isContractUser = hasWorkedWithJfll && Boolean(jfllIdentifier.trim());
  const contractCompanyName = jfllIdentifier.trim() || 'JFLL Partner';
  const contractUidInput = jfllIdentifier.trim();

  const clearJfllPartner = () => {
    setHasWorkedWithJfll(false);
    setJfllIdentifier('');
    setQuote((prev) => ({
      ...prev,
      hasWorkedWithJfll: false,
      jfllIdentifier: '',
      hasWorkedWithJfl: false,
      jflIdentifier: '',
    }));
  };

  // Tracking modal state
  const [isTrackModalOpen, setIsTrackModalOpen] = useState<boolean>(false);
  const [trackQuery, setTrackQuery] = useState<string>('');
  const [trackResult, setTrackResult] = useState<ShipmentRecord | null>(null);

  const openTrackModal = () => {
    setIsTrackModalOpen(true);
  };

  // Operations Dashboard state with LocalStorage persistence (Finding 8)
  const [shipmentsList, setShipmentsList] = useState<ShipmentRecord[]>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem('jf_shipments');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse shipments from localStorage', e);
      }
    }
    return mockShipments;
  });
  const [selectedShipment, setSelectedShipment] = useState<ShipmentRecord>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem('jf_shipments');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
        }
      } catch {}
    }
    return mockShipments[0];
  });
  const [activeDocumentPreview, setActiveDocumentPreview] = useState<DocumentPreview | null>(null);

  // Quote form state
  const [quote, setQuote] = useState<QuoteForm>({
    origin: 'BOM',
    destination: '',
    readyDate: '',
    pieces: '',
    weight: '',
    volume: '',
    cargoType: '' as CargoType,
    dimensionMode: 'dimensions',
    dimensionUnit: 'cm',
    length: '',
    width: '',
    height: '',
    hasWorkedWithJfll: false,
    jfllIdentifier: '',
    hasWorkedWithJfl: false,
    jflIdentifier: '',
  });
  const [quoteError, setQuoteError] = useState('');

  // Rates sorting and filtering
  const [dynamicRates, setDynamicRates] = useState<Rate[]>([]);
  const [rateFilter, setRateFilter] = useState<'all' | 'cheapest' | 'fastest' | 'direct'>('all');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [isSearchingRates, setIsSearchingRates] = useState<boolean>(false);
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null);

  // Step 2 Piece Dimensions Table
  const [pieceLines, setPieceLines] = useState<PieceLine[]>([]);

  // Step 2 & 3 Booking Details
  const [booking, setBooking] = useState<BookingForm>({
    shipperName: '',
    shipperEmail: '',
    shipperPhone: '',
    shipperCompany: '',
    shipperAddress: '',
    shipperGstin: '',
    shipperIec: '',
    adCode: '',
    consigneeName: '',
    consigneeEmail: '',
    consigneePhone: '',
    consigneeCompany: '',
    consigneeAddress: '',
    consigneeTaxId: '',
    cargoDescription: '',
    hsCode: '',
    packagingType: '' as PackagingType,
    incoterm: '' as Incoterm,
    tempCondition: '' as TempCondition,
    dgUnNumber: '',
    doorPickup: false,
  });

  const [bookingError, setBookingError] = useState('');
  const [reference, setReference] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [dgAccepted, setDgAccepted] = useState(false);

  // Physics calculations (IATA Volumetric standard)
  const actualWeight = Number(quote.weight) || 0;
  const cbmVolWeight = (Number(quote.volume) || 0) * 167;

  // IATA standard volumetric weight from dimensions: (Length × Breadth × Height × Pieces) ÷ 6,000 (with unit conversion)
  const dimVolWeight = useMemo(() => {
    const l = Number(quote.length) || 0;
    const w = Number(quote.width) || 0;
    const h = Number(quote.height) || 0;
    const pcs = Math.max(1, Number(quote.pieces) || 1);
    const unit = quote.dimensionUnit || 'cm';
    if (l > 0 && w > 0 && h > 0) {
      return calculateVolumetricWeight(l, w, h, pcs, unit);
    }
    return 0;
  }, [quote.length, quote.width, quote.height, quote.pieces, quote.dimensionUnit]);

  // Derived Volume in CBM: (Length × Breadth × Height × Pieces) ÷ 1,000,000 (with unit conversion)
  const dimCbm = useMemo(() => {
    const l = Number(quote.length) || 0;
    const w = Number(quote.width) || 0;
    const h = Number(quote.height) || 0;
    const pcs = Math.max(1, Number(quote.pieces) || 1);
    const unit = quote.dimensionUnit || 'cm';
    if (l > 0 && w > 0 && h > 0) {
      return calculateCbm(l, w, h, pcs, unit);
    }
    return 0;
  }, [quote.length, quote.width, quote.height, quote.pieces, quote.dimensionUnit]);

  const activeVolumetricWeight = useMemo(() => {
    if (quote.dimensionMode === 'cbm') {
      return cbmVolWeight;
    }
    return dimVolWeight > 0 ? dimVolWeight : cbmVolWeight;
  }, [quote.dimensionMode, dimVolWeight, cbmVolWeight]);

  const totalVolumetricWeightFromLines = useMemo(() => {
    return Math.round(
      pieceLines.reduce((acc, p) => {
        const vol = calculateVolumetricWeight(
          Number(p.length) || 0,
          Number(p.width) || 0,
          Number(p.height) || 0,
          Number(p.pieces) || 0,
          p.unit || quote.dimensionUnit || 'cm'
        );
        return acc + vol;
      }, 0) * 10
    ) / 10;
  }, [pieceLines, quote.dimensionUnit]);

  const volumetricWeight = Math.round(Math.max(totalVolumetricWeightFromLines, activeVolumetricWeight) * 10) / 10;
  // IATA TACT Rule 1.3.2: Round chargeable weight up to nearest 0.5 kg
  const chargeableWeight = Math.ceil(Math.max(actualWeight, volumetricWeight) * 2) / 2;

  // Fetch / compute dynamic rates from backend API / consolidated dataset
  useEffect(() => {
    let isMounted = true;
    if (chargeableWeight > 500) {
      setDynamicRates([]);
      return;
    }
    if (quote.origin && quote.destination && (actualWeight > 0 || volumetricWeight > 0) && quote.cargoType) {
      fetchLiveOrCalculatedRates({
        origin: quote.origin,
        destination: quote.destination,
        actualWeight: actualWeight || 0,
        volumetricWeight: volumetricWeight || 0,
        cargoType: quote.cargoType,
      }).then((res) => {
        if (isMounted) {
          if (res.requiresCustomQuote || chargeableWeight > 500) {
            setDynamicRates([]);
          } else if (res.rates.length > 0) {
            setDynamicRates(res.rates as Rate[]);
            if (!selectedRate || !res.rates.find((r) => r.id === selectedRate.id)) {
              setSelectedRate(res.rates[0] as Rate);
            }
          }
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [quote.origin, quote.destination, actualWeight, volumetricWeight, quote.cargoType, chargeableWeight]);

  // Filtered rates list
  const filteredRates = useMemo(() => {
    let list = [...dynamicRates];
    if (rateFilter === 'all') {
      // Natural chronological flight schedule order throughout the day
      list.sort((a, b) => parseDepartureMinutes(a.departure) - parseDepartureMinutes(b.departure));
    } else if (rateFilter === 'cheapest') {
      list.sort((a, b) => {
        const pA = a.total;
        const pB = b.total;
        return sortAsc ? pA - pB : pB - pA;
      });
    } else if (rateFilter === 'fastest') {
      list.sort((a, b) => {
        const tA = parseTransitMinutes(a.transit);
        const tB = parseTransitMinutes(b.transit);
        return sortAsc ? tA - tB : tB - tA;
      });
    } else if (rateFilter === 'direct') {
      list = list.filter((r) => r.direct);
      list.sort((a, b) => a.total - b.total);
    }
    return list;
  }, [dynamicRates, rateFilter, sortAsc]);

  const directCount = useMemo(() => dynamicRates.filter((r) => r.direct).length, [dynamicRates]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToQuote = () => scrollToSection('quote');

  const [copiedReference, setCopiedReference] = useState(false);

  const handleCopyReference = () => {
    if (!reference) return;
    navigator.clipboard.writeText(reference);
    setCopiedReference(true);
    setTimeout(() => setCopiedReference(false), 2000);
  };

  const selectNetworkRoute = (originCode: string, destCode: string) => {
    setQuote((current) => ({
      ...current,
      origin: originCode,
      destination: destCode,
    }));
    setActiveStep(0);
    scrollToQuote();
  };

  const updateQuote = <K extends keyof QuoteForm>(key: K, value: QuoteForm[K]) =>
    setQuote((current) => {
      const next = { ...current, [key]: key === 'origin' ? 'BOM' : value };
      if (key === 'length' || key === 'width' || key === 'height' || key === 'pieces') {
        const l = Number(key === 'length' ? value : next.length) || 0;
        const w = Number(key === 'width' ? value : next.width) || 0;
        const h = Number(key === 'height' ? value : next.height) || 0;
        const pcs = Math.max(1, Number(key === 'pieces' ? value : next.pieces) || 1);
        if (l > 0 && w > 0 && h > 0 && next.dimensionMode !== 'cbm') {
          next.volume = ((l * w * h * pcs) / 1000000).toFixed(3);
        }
      }
      return next;
    });

  const updateBooking = (key: keyof BookingForm, value: any) =>
    setBooking((current) => ({ ...current, [key]: value }));

  const handleAddPieceLine = () => {
    const newId = `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setPieceLines((prev) => [
      ...prev,
      { id: newId, pieces: 0, length: 0, width: 0, height: 0, weightPerPiece: 0 },
    ]);
  };

  const handleRemovePieceLine = (id: string) => {
    setPieceLines((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdatePieceLine = (id: string, field: keyof PieceLine, val: number) => {
    setPieceLines((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  const submitQuote = (event: React.FormEvent) => {
    event.preventDefault();
    if (hasWorkedWithJfll && !jfllIdentifier.trim()) {
      setQuoteError("Please enter your JFLL Member ID, Client ID, or Company Name, or select 'No'.");
      return;
    }
    if (
      !quote.origin ||
      !quote.destination ||
      quote.origin === quote.destination ||
      !quote.cargoType ||
      !quote.readyDate ||
      Number(quote.weight) <= 0 ||
      Number(quote.pieces) <= 0
    ) {
      setQuoteError('Please select origin, destination, ready date, commodity category, and enter pieces and gross weight.');
      return;
    }
    setQuoteError('');
    setIsSearchingRates(true);
    setRateFilter('cheapest');
    setSortAsc(true);
    setActiveStep(1);
    window.setTimeout(() => scrollToQuote(), 50);

    if (chargeableWeight > 500) {
      setIsSearchingRates(false);
      setDynamicRates([]);
      return;
    }

    fetchLiveOrCalculatedRates({
      origin: quote.origin,
      destination: quote.destination,
      actualWeight: Number(quote.weight) || 0,
      volumetricWeight: volumetricWeight || 0,
      cargoType: quote.cargoType,
    })
      .then((res) => {
        setDynamicRates(res.rates as Rate[]);
        if (res.rates.length > 0) {
          setSelectedRate(res.rates[0] as Rate);
        }
      })
      .finally(() => {
        setIsSearchingRates(false);
      });
  };

  const goToBooking = (rate: Rate) => {
    setSelectedRate(rate);
    setActiveStep(2);
    setBookingSubStep(0);
    // Pre-populate pieceLines from Step 0 dimensions if user hasn't added custom lines yet
    if (pieceLines.length === 0 && Number(quote.length) > 0 && Number(quote.width) > 0 && Number(quote.height) > 0) {
      setPieceLines([
        {
          id: `p-init-1`,
          pieces: Number(quote.pieces) || 1,
          length: Number(quote.length) || 0,
          width: Number(quote.width) || 0,
          height: Number(quote.height) || 0,
          unit: quote.dimensionUnit || 'cm',
          weightPerPiece: Math.round(((Number(quote.weight) || 0) / (Number(quote.pieces) || 1)) * 10) / 10,
        },
      ]);
    }
    window.setTimeout(() => scrollToQuote(), 50);
  };

  const nextBookingSubStep = () => {
    setBookingError('');
    if (bookingSubStep === 0) {
      if (
        !booking.shipperName.trim() ||
        !booking.shipperEmail.includes('@') ||
        !booking.consigneeName.trim() ||
        !booking.consigneeEmail.includes('@') ||
        !booking.shipperCompany.trim() ||
        !booking.shipperAddress.trim() ||
        !booking.consigneeAddress.trim()
      ) {
        setBookingError('Please complete shipper and consignee company, contact name, email, and address.');
        return;
      }
      if (!booking.shipperIec.trim() || booking.shipperIec.trim().length !== 10) {
        setBookingError('Please enter a valid 10-digit DGFT IEC (Import Export Code) for Indian Customs filing.');
        return;
      }
    }
    if (bookingSubStep === 1) {
      if (!booking.packagingType) {
        setBookingError('Please select a cargo packaging type.');
        return;
      }
      if (!booking.incoterm) {
        setBookingError('Please select an export Incoterm.');
        return;
      }
      if (!booking.cargoDescription.trim() || !booking.hsCode.trim()) {
        setBookingError('Please enter a clear commodity description and 6-digit HS Code for customs processing.');
        return;
      }
      if (quote.cargoType === 'Dangerous goods' && (!booking.dgUnNumber || !booking.dgUnNumber.trim())) {
        setBookingError('Please specify the IATA UN Identification Number for Dangerous Goods (e.g., UN 3481).');
        return;
      }
    }
    setBookingSubStep((prev) => Math.min(2, prev + 1));
  };

  const confirmBooking = () => {
    if (!selectedRate) {
      setBookingError('Please select a freight rate option before confirming.');
      return;
    }
    if (!termsAccepted || !dgAccepted) {
      setBookingError('Please accept the standard terms of carriage and Dangerous Goods compliance declaration.');
      return;
    }
    setBookingError('');
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const newRef = `JFLL-AE-2026-${randomSuffix}`;
    setReference(newRef);

    const price = selectedRate.total;
    const finalAmount = booking.doorPickup ? price + 2400 : price;

    const newShipment: ShipmentRecord = {
      reference: newRef,
      awbNumber: `176-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      carrier: selectedRate.carrier,
      flight: selectedRate.code,
      origin: quote.origin,
      destination: quote.destination,
      chargeableWeight,
      commodity: booking.cargoDescription || `${quote.cargoType}`,
      status: 'Booking Confirmed - AWB pending',
      statusStep: 1,
      readyDate: quote.readyDate,
      cutoff: selectedRate.cutoff,
      totalAmount: finalAmount,
      pickupRequired: booking.doorPickup,
      milestones: [
        {
          title: 'Booking Confirmed',
          description: `Rate secured with ${selectedRate.carrier} (${selectedRate.code})`,
          timestamp: 'Just now · IST',
          completed: true,
        },
        {
          title: 'AWB Generation & Verification',
          description: 'Operations desk verifying booking details and export manifest',
          timestamp: 'Target within 2 hours',
          completed: false,
          current: true,
        },
        {
          title: 'Cargo Tender at Origin Warehouse',
          description: booking.doorPickup ? 'Pickup dispatched from consignor premises' : `Direct drop-off at ${quote.origin} cargo terminal`,
          timestamp: `Cutoff: ${selectedRate.cutoff}`,
          completed: false,
        },
        {
          title: 'Customs Clearance (LEO Endorsement)',
          description: 'EDI Shipping Bill filing and physical verification',
          timestamp: 'Pending cargo handover',
          completed: false,
        },
        {
          title: `Flight Departure (${selectedRate.code})`,
          description: `Scheduled flight from ${quote.origin} to ${quote.destination}`,
          timestamp: selectedRate.departure,
          completed: false,
        },
        {
          title: 'Destination Terminal Release',
          description: `Cargo available for consignee pickup at ${quote.destination}`,
          timestamp: selectedRate.arrival,
          completed: false,
        },
      ],
    };

    setShipmentsList((prev) => {
      const updated = [newShipment, ...prev];
      try {
        localStorage.setItem('jf_shipments', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to persist shipment to localStorage:', err);
      }
      return updated;
    });
    setSelectedShipment(newShipment);
    setActiveStep(3);
    window.setTimeout(() => scrollToQuote(), 50);

    // Asynchronously notify backend API / Floci persistence
    try {
      const backendUrl =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
        window.location.port !== '4000'
          ? 'http://localhost:4000/api/bookings'
          : '/api/bookings';

      fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: newRef,
          awbNumber: newShipment.awbNumber,
          origin: quote.origin,
          destination: quote.destination,
          readyDate: quote.readyDate,
          carrier: selectedRate.carrier,
          flight: selectedRate.code,
          shipper: booking.shipperName,
          shipperName: booking.shipperName,
          shipperCompany: booking.shipperCompany,
          shipperEmail: booking.shipperEmail,
          shipperPhone: booking.shipperPhone,
          shipperGstin: booking.shipperGstin,
          shipperIec: booking.shipperIec,
          consignee: booking.consigneeName,
          consigneeName: booking.consigneeName,
          consigneeCompany: booking.consigneeCompany,
          consigneeEmail: booking.consigneeEmail,
          consigneePhone: booking.consigneePhone,
          commodity: booking.cargoDescription || quote.cargoType,
          cargoDescription: booking.cargoDescription,
          cargoCategory: quote.cargoType,
          packagingType: booking.packagingType,
          incoterm: booking.incoterm,
          pieces: quote.pieces,
          chargeableWeight,
          totalAmount: finalAmount,
          hasWorkedWithJfll,
          jfllIdentifier: jfllIdentifier.trim() || undefined,
          hasWorkedWithJfl: hasWorkedWithJfll,
          jflIdentifier: jfllIdentifier.trim() || undefined,
        }),
      }).catch(() => {});
    } catch {
      // Local state already updated
    }
  };

  const acceptCookies = () => {
    try {
      localStorage.setItem('jf-cookie-consent', 'accepted');
    } catch {
      // Local fallback
    }
    setCookieVisible(false);
  };

  const handleQuickTrackLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const query = trackQuery.trim().toUpperCase();
    const found = shipmentsList.find(
      (s) => s.reference.toUpperCase().includes(query) || s.awbNumber.toUpperCase().includes(query)
    );
    setTrackResult(found ?? null);
  };

  return (
    <div className="atlas-shell min-h-screen">
      {/* ====================================================================
          TOP APPLICATION HEADER (AUTHENTIC POSITIONING & SPACING)
          ==================================================================== */}
      <header className="absolute left-1/2 top-4 z-30 w-[min(1180px,calc(100%-32px))] -translate-x-1/2 sm:top-6 sm:w-[min(1180px,calc(100%-48px))]">
        <div className="hero-nav flex items-center justify-between rounded-full px-4 py-2.5 sm:px-6 sm:py-3 shadow-[0_4px_24px_rgba(16,24,32,.08)]">
          <Logo />

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
            <a
              href="#how-it-works"
              className="font-mulish focus-ring text-[12px] font-bold text-[#16243a] transition hover:text-[#187e9c]"
            >
              How it works
            </a>
            <a
              href="#journey"
              className="font-mulish focus-ring text-[12px] font-bold text-[#16243a] transition hover:text-[#187e9c]"
            >
              Journey
            </a>
            <a
              href="#network"
              className="font-mulish focus-ring text-[12px] font-bold text-[#16243a] transition hover:text-[#187e9c]"
            >
              Our network
            </a>
            <a
              href="#shipments"
              className="font-mulish focus-ring text-[12px] font-bold text-[#16243a] transition hover:text-[#187e9c]"
            >
              Operations
            </a>
            <button
              onClick={openTrackModal}
              className="font-mulish focus-ring flex items-center gap-1.5 text-[12px] font-bold text-[#187e9c] transition hover:text-[#16243a]"
            >
              <Search size={13} />
              <span>Track</span>
            </button>
          </nav>

          <div className="hidden items-center gap-4 sm:flex">
            {/* JFLL Partner Identification Status */}
            {isContractUser && (
              <div className="flex items-center gap-2 rounded-full border border-[#d4e9e3] bg-[#eef8f5] px-3.5 py-1.5 font-mulish text-[11px] font-extrabold text-[#176579]">
                <UserCheck size={14} className="text-[#187e9c]" />
                <span className="truncate max-w-[140px]">{contractCompanyName}</span>
                <button
                  onClick={clearJfllPartner}
                  className="ml-1 text-[10px] font-bold text-[#908e92] hover:text-[#b44f47] cursor-pointer"
                  title="Clear JFLL Partner details"
                >
                  (Clear)
                </button>
              </div>
            )}

            <button
              onClick={scrollToQuote}
              className="focus-ring rounded-full bg-[#101820] px-5 py-2.5 font-mulish text-[12px] font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#263740] shadow-sm flex items-center gap-1"
              data-testid="button-header-get-quote"
            >
              <span>Get a quote</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <button
            className="focus-ring rounded-lg p-2 text-[#16243a] lg:hidden"
            onClick={() => setMobileMenu((current) => !current)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenu ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="hero-nav mt-2 rounded-[18px] px-5 py-4 lg:hidden border border-[#c5d0d2] shadow-2xl"
            >
              <div className="flex flex-col gap-3 font-mulish text-sm font-bold text-[#16243a]">
                <a href="#how-it-works" onClick={() => setMobileMenu(false)}>
                  How it works
                </a>
                <a href="#journey" onClick={() => setMobileMenu(false)}>
                  Journey
                </a>
                <a href="#network" onClick={() => setMobileMenu(false)}>
                  Our network
                </a>
                <a href="#shipments" onClick={() => setMobileMenu(false)}>
                  Operations Console
                </a>
                <button
                  onClick={() => {
                    setMobileMenu(false);
                    openTrackModal();
                  }}
                  className="flex items-center gap-2 text-left text-[#187e9c]"
                >
                  <Search size={15} /> Track Shipment
                </button>

                {isContractUser && (
                  <div className="mt-2 pt-3 border-t border-[#dfe5e7] flex items-center justify-between text-xs font-bold text-[#176579]">
                    <div className="flex items-center gap-2">
                      <UserCheck size={14} /> {contractCompanyName}
                    </div>
                    <button
                      onClick={clearJfllPartner}
                      className="text-[#908e92] hover:text-[#b44f47] text-xs font-bold cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ====================================================================
          HERO STAGE (AUTHENTIC CONTAINER, ORBIT, SPARK, PROOF & DOCK)
          ==================================================================== */}
      <main>
        <section className="hero-wash">
          <div className="atlas-hero-stage">
            <div className="hero-orbit" aria-hidden="true" />
            <span className="hero-spark left-[17%] top-[38%]" aria-hidden="true" />
            <span className="hero-spark right-[21%] top-[21%] scale-75" aria-hidden="true" />

            <div className="relative min-h-[100svh] px-6 pb-[188px] pt-[124px] sm:px-10 sm:pt-[142px] lg:px-[8vw]">
              <motion.div
                className="hero-copy max-w-[700px]"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65 }}
              >
                <div className="section-kicker mb-5 flex items-center gap-2 !text-[#176579]">
                  <span className="h-px w-8 bg-[#f2a63d]" />
                  <span>India to everywhere &middot; Atlas air desk</span>
                </div>

                <h1 className="hero-title text-balance font-semibold text-[#16243a]">
                  Cargo moves better when{' '}
                  <span className="font-editorial font-normal italic text-[#187e9c]">clarity</span> leads.
                </h1>

                <p className="mt-7 max-w-[420px] text-[15px] leading-6 text-[#42515c] sm:text-[17px]">
                  Instant spot rates, direct airline allocations, and transparent milestones for Indian air freight.
                  Quote in seconds, book with certainty.
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <button
                    onClick={scrollToQuote}
                    className="focus-ring rounded-full bg-[#f2a63d] px-6 py-3.5 font-mulish text-[13px] font-extrabold text-[#10212b] shadow-[0_8px_20px_rgba(242,166,61,.22)] transition hover:-translate-y-0.5 hover:bg-[#f6bb63]"
                    data-testid="button-hero-get-quote"
                  >
                    Plan your shipment <ArrowRight size={15} className="ml-2 inline" />
                  </button>

                  <a
                    href="#how-it-works"
                    className="focus-ring font-mulish text-[13px] font-extrabold text-[#16243a]"
                    data-testid="link-hero-how-it-works"
                  >
                    See how it works <ChevronRight size={15} className="ml-1 inline text-[#187e9c]" />
                  </a>
                </div>

                <motion.div
                  role="button"
                  tabIndex={0}
                  onClick={() => selectNetworkRoute('BOM', 'DXB')}
                  onKeyDown={(e) => { if (e.key === 'Enter') selectNetworkRoute('BOM', 'DXB'); }}
                  className="hero-corridor mt-8 flex max-w-[340px] items-center gap-3 pt-4 cursor-pointer group transition hover:opacity-90"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.42 }}
                  title="Click to quote BOM → DXB route"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#16243a] text-[#f2a63d] group-hover:scale-105 transition-transform">
                    <Plane size={15} />
                  </span>
                  <div>
                    <div className="font-mulish text-[9px] font-extrabold uppercase tracking-[.12em] text-[#587078] group-hover:text-[#187e9c] transition-colors">
                      Primary corridor &middot; Quick quote
                    </div>
                    <strong className="text-sm text-[#16243a]">BOM &rarr; DXB &middot; daily widebody</strong>
                  </div>
                </motion.div>

                {/* Mobile Proof Badges Strip */}
                <div className="sm:hidden mt-6 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {[
                    ['Since 1986', '38+ yrs logistics'],
                    ['IATA Agent', 'Certified cargo'],
                    ['NSE Listed', 'JETFREIGHT'],
                    ['150+ Hubs', 'Direct gateways'],
                  ].map(([value, label]) => (
                    <div key={label} className="hero-proof rounded-xl px-3 py-2 shrink-0 min-w-[124px]">
                      <strong className="block text-[14px] tracking-tight text-[#16243a] font-bold">{value}</strong>
                      <span className="font-mulish text-[8px] font-extrabold uppercase tracking-[.08em] text-[#5f6d74] block mt-0.5">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Decorative Aircraft Illustration */}
              <motion.div
                className="hero-aircraft-wrap"
                initial={{ opacity: 0, y: 26, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
              >
                <AtlasAircraft />
              </motion.div>

              {/* Floating Proof Badges */}
              <motion.div
                className="absolute right-7 top-[30%] z-[2] hidden w-[172px] space-y-2.5 sm:block lg:right-[7vw]"
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.34 }}
              >
                {[
                  ['Since 1986', '38+ yrs logistics'],
                  ['IATA Agent', 'Certified cargo'],
                  ['NSE Listed', 'JETFREIGHT'],
                  ['150+ Hubs', 'Direct gateways'],
                ].map(([value, label]) => (
                  <div key={label} className="hero-proof rounded-xl px-3 py-2.5">
                    <strong className="block text-[16px] tracking-[-.05em] text-[#16243a]">{value}</strong>
                    <span className="font-mulish text-[9px] font-extrabold uppercase tracking-[.1em] text-[#5f6d74]">
                      {label}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Floating Hero Route Dock */}
            <motion.div
              className="hero-quote-dock rounded-[20px] p-3 sm:p-4"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.38 }}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="flex items-center gap-3 px-1 sm:px-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#16243a] text-[#f2a63d]">
                    <MapPin size={16} />
                  </span>
                  <div className="min-w-0">
                    <div className="font-mulish text-[9px] font-extrabold uppercase tracking-[.13em] text-[#7a8789]">
                      Quote desk
                    </div>
                    <div className="truncate text-sm font-semibold text-[#16243a]">Build your air-freight route</div>
                  </div>
                </div>

                <div className="hero-dock-divider" />

                <div
                  role="button"
                  tabIndex={0}
                  onClick={scrollToQuote}
                  onKeyDown={(e) => { if (e.key === 'Enter') scrollToQuote(); }}
                  className="route-pill flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl px-4 py-2.5 cursor-pointer hover:opacity-90 hover:ring-1 hover:ring-[#187e9c] transition"
                  title="Configure route at Quote Desk"
                >
                  <div>
                    <div className="font-mulish text-[9px] font-extrabold uppercase tracking-[.12em] text-[#66807c]">From</div>
                    <strong className="text-sm text-[#16243a]">
                      Mumbai <span className="font-mulish text-[10px] text-[#187e9c]">BOM</span>
                    </strong>
                  </div>
                  <ArrowRight size={15} className="shrink-0 text-[#d58b25]" />
                  <div className="text-right">
                    <div className="font-mulish text-[9px] font-extrabold uppercase tracking-[.12em] text-[#66807c]">To</div>
                    <strong className="text-sm text-[#16243a]">
                      Dubai <span className="font-mulish text-[10px] text-[#187e9c]">DXB</span>
                    </strong>
                  </div>
                </div>

                <div className="hidden px-2 lg:block">
                  <div className="font-mulish text-[9px] font-extrabold uppercase tracking-[.12em] text-[#7a8789]">
                    Sample weight
                  </div>
                  <div className="mt-1 text-sm font-semibold text-[#16243a]">240 kg &middot; 1.2 CBM</div>
                </div>

                <button
                  onClick={scrollToQuote}
                  className="focus-ring flex shrink-0 items-center justify-center rounded-xl bg-[#16243a] px-5 py-3 font-mulish text-[12px] font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#263b50]"
                  data-testid="button-hero-search"
                >
                  <span>Search rates</span>
                  <ArrowUpRight size={14} className="ml-2" />
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ====================================================================
            SECTION 01: RATE FINDER & BOOKING WIZARD (#quote)
            ==================================================================== */}
        <section id="quote" className="scroll-mt-5 bg-[#101820] py-20 text-white md:py-28">
          <div className="atlas-container">
            <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <div className="section-kicker !text-[#ffd08a]">01 &mdash; Instant quote</div>
                <h2 className="mt-3 max-w-[600px] text-4xl font-semibold tracking-[-.055em] md:text-5xl text-white">
                  Know the route before you commit.
                </h2>
              </div>
              <div className="font-mulish flex items-center gap-2 text-[11px] font-bold text-[#aeb9bd]">
                <span className="h-2 w-2 rounded-full bg-[#f2a63d]" />
                <span>Powered by structured carrier tariffs</span>
              </div>
            </div>

            <div className="rounded-[25px] bg-white p-5 text-[#101820] shadow-[0_22px_60px_rgba(0,0,0,.18)] sm:p-8">
              {/* Stepped Wizard Indicator */}
              <div className="mb-6 sm:mb-8 flex items-center gap-2 overflow-x-auto no-scrollbar py-1" role="tablist" aria-label="Booking flow steps">
                {['Route & cargo', chargeableWeight > 500 ? 'Spot Quote Desk' : 'Compare rates', 'Shipment details', 'Booked'].map((step, index) => {
                  const isClickable = index <= activeStep;
                  return (
                    <button
                      key={step}
                      type="button"
                      disabled={!isClickable}
                      onClick={() => {
                        if (index < activeStep) {
                          setActiveStep(index);
                        }
                      }}
                      className={`flex min-w-max items-center gap-2 text-left transition min-h-[36px] py-1 px-1 rounded-lg ${
                        isClickable ? 'cursor-pointer hover:opacity-85' : 'cursor-default opacity-50'
                      }`}
                      title={index < activeStep ? `Go back to ${step}` : step}
                    >
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full font-mulish text-[11px] font-extrabold ${
                          activeStep >= index ? 'bg-[#f2a63d] text-[#10212b]' : 'bg-[#eef2f3] text-[#908e92]'
                        }`}
                      >
                        {activeStep > index ? <Check size={14} /> : index + 1}
                      </div>
                      <span
                        className={`font-mulish text-[11px] font-bold ${
                          activeStep >= index ? 'text-[#101820]' : 'text-[#908e92]'
                        }`}
                      >
                        {step}
                      </span>
                      {index < 3 ? (
                        <div
                          className={`mx-1 h-px w-7 sm:w-12 ${
                            activeStep > index ? 'bg-[#f2a63d]' : 'bg-[#dfe5e7]'
                          }`}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {/* STEP 0: ROUTE & CARGO */}
              <>
                {activeStep === 0 && (
                  <form
                    key="quote-form"
                    onSubmit={submitQuote}
                  >
                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label className="font-mulish block text-[11px] font-extrabold uppercase tracking-[.08em] text-[#4d5b62] mb-2">
                          Origin gateway (India) *
                        </label>
                        <div className="booking-input select-trigger flex items-center justify-between bg-[#f8fafc] text-xs font-semibold text-[#101820] border-[#dfe5e7] cursor-default min-h-[44px]">
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
                                IATA Standard: (L × B × H × Pieces) ÷ 6,000 {(quote.dimensionUnit || 'cm') !== 'cm' ? `(converted from ${quote.dimensionUnit} to cm)` : ''}
                              </span>
                              {dimVolWeight > 0 ? (
                                <span className="font-extrabold text-[#176579]">
                                  = {dimVolWeight} kg vol. ({dimCbm} CBM)
                                </span>
                              ) : (
                                <span className="text-[#94a3b8] italic">Enter box dimensions in {quote.dimensionUnit || 'cm'}</span>
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
                          <span className="text-base font-black text-[#187e9c]">
                            {chargeableWeight} kg
                          </span>
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
                )}

                {/* STEP 1: COMPARE RATES OR HEAVY CARGO INQUIRY */}
                {activeStep === 1 &&
                  (chargeableWeight > 500 ? (
                    <HeavyCargoInquiry
                      quote={quote}
                      chargeableWeight={chargeableWeight}
                      actualWeight={actualWeight}
                      volumetricWeight={volumetricWeight}
                      onBackToQuote={() => {
                        setActiveStep(0);
                        window.setTimeout(() => scrollToQuote(), 50);
                      }}
                      onResetQuote={() => {
                        setQuote({
                          origin: 'BOM',
                          destination: '',
                          readyDate: '',
                          pieces: '',
                          weight: '',
                          volume: '',
                          cargoType: '' as CargoType,
                          dimensionMode: 'dimensions',
                          length: '',
                          width: '',
                          height: '',
                        });
                        setPieceLines([]);
                        setActiveStep(0);
                        window.setTimeout(() => scrollToQuote(), 50);
                      }}
                    />
                  ) : (
                    <div
                      key="rates"
                      className="space-y-6"
                    >
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
                          onClick={() => setActiveStep(0)}
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
                              onClick={() => setActiveStep(0)}
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
                                {/* Top Header: Monogram & Airline Name (Left) + Price Hero (Right - Marketer Eyeball Magnet) */}
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

                                {/* Center: Journey Flow (Google Flights / Flexport inspired) */}
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

                                {/* Bottom Row: Cutoff & Cargo Stats on Left, Breakdown Toggle & Select CTA on Right */}
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
                                      onClick={() => goToBooking(rate)}
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
                )
              )}

                {/* STEP 2: SHIPMENT DETAILS (GUIDED 3-STEP FLOW) */}
                {activeStep === 2 && (
                  <div
                    key="booking"
                    className="space-y-6"
                  >
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
                              // Allow jumping back to earlier steps or validating forward
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
                              label="GSTIN (15 Digits) *"
                              value={booking.shipperGstin}
                              onChange={(val) => updateBooking('shipperGstin', val)}
                              placeholder="27AABCA1234F1Z8"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <Field
                              label="DGFT IEC Number *"
                              value={booking.shipperIec}
                              onChange={(val) => updateBooking('shipperIec', val)}
                              placeholder="10-digit Exporter Code"
                              helper="Mandatory for ICEGATE Shipping Bill"
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
                                        className="booking-input p-2 text-xs min-h-[40px]"
                                        value={line.pieces === 0 ? '' : line.pieces}
                                        onChange={(e) => handleUpdatePieceLine(line.id, 'pieces', Math.max(0, Number(e.target.value)))}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] text-[#64748b] mb-1 font-bold">Length ({lineUnit})</label>
                                      <input
                                        type="number"
                                        placeholder={lineUnit}
                                        className="booking-input p-2 text-xs min-h-[40px]"
                                        value={line.length === 0 ? '' : line.length}
                                        onChange={(e) => handleUpdatePieceLine(line.id, 'length', Math.max(0, Number(e.target.value)))}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] text-[#64748b] mb-1 font-bold">Width ({lineUnit})</label>
                                      <input
                                        type="number"
                                        placeholder={lineUnit}
                                        className="booking-input p-2 text-xs min-h-[40px]"
                                        value={line.width === 0 ? '' : line.width}
                                        onChange={(e) => handleUpdatePieceLine(line.id, 'width', Math.max(0, Number(e.target.value)))}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] text-[#64748b] mb-1 font-bold">Height ({lineUnit})</label>
                                      <input
                                        type="number"
                                        placeholder={lineUnit}
                                        className="booking-input p-2 text-xs min-h-[40px]"
                                        value={line.height === 0 ? '' : line.height}
                                        onChange={(e) => handleUpdatePieceLine(line.id, 'height', Math.max(0, Number(e.target.value)))}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] text-[#64748b] mb-1 font-bold">Wt/pc (kg)</label>
                                      <input
                                        type="number"
                                        placeholder="kg"
                                        className="booking-input p-2 text-xs min-h-[40px]"
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
                          <Field
                            label="Harmonized System (HS) Code *"
                            value={booking.hsCode}
                            onChange={(val) => updateBooking('hsCode', val)}
                            placeholder="e.g. 7318.15"
                            helper="6 or 8 digits required for Indian Customs Shipping Bill"
                          />

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
                            <div className="md:col-span-2">
                              <Field
                                label="UN Identification Number (e.g. UN 3481) *"
                                value={booking.dgUnNumber || ''}
                                onChange={(val) => updateBooking('dgUnNumber', val)}
                                placeholder="e.g. UN 3481 Class 9 Lithium Ion Batteries"
                                helper="Mandatory IATA DGR classification · RAC fee applicable"
                              />
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
                              onClick={() => setActiveStep(0)}
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
                          else setActiveStep(1);
                        }}
                        className="font-mulish text-[11px] font-extrabold text-[#176579] hover:underline cursor-pointer flex items-center gap-1 py-2 px-3 rounded-lg hover:bg-[#eef8f5] transition"
                      >
                        <ChevronLeft size={15} /> Back
                      </button>

                      {bookingSubStep < 2 ? (
                        <button
                          type="button"
                          onClick={nextBookingSubStep}
                          className="focus-ring rounded-full bg-[#f2a63d] px-7 py-3 font-mulish text-[12px] font-extrabold text-[#10212b] transition hover:bg-[#f6bb63] cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
                        >
                          <span>Continue</span>
                          <ArrowRight size={14} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={confirmBooking}
                          className="focus-ring rounded-full bg-[#187e9c] px-8 py-3.5 font-mulish text-[12px] font-extrabold text-white transition hover:bg-[#156b84] cursor-pointer flex items-center gap-2 shadow-sm active:scale-[0.98]"
                        >
                          <span>Confirm &amp; Lock Allocation</span>
                          <Check size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 3: BOOKED / CONFIRMATION */}
                {activeStep === 3 && (
                  <div
                    key="confirmation"
                    className="py-8 text-center sm:py-12"
                  >
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
                        <strong className="text-lg sm:text-2xl font-mono tracking-tight text-[#101820] truncate shrink min-w-0">{reference}</strong>
                        <button
                          type="button"
                          onClick={handleCopyReference}
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
                        <strong className="text-right text-[#101820]">{quote.origin} &rarr; {quote.destination}</strong>
                        <span className="text-[#908e92]">Carrier</span>
                        <strong className="text-right text-[#101820]">{selectedRate?.carrier || 'Carrier Partner'}</strong>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                      <button
                        onClick={() => {
                          scrollToSection('shipments');
                        }}
                        className="focus-ring rounded-full bg-[#101820] px-6 py-3 font-mulish text-[12px] font-extrabold text-white hover:bg-[#263740]"
                      >
                        Go to Operations Console
                      </button>
                      <button
                        onClick={() => {
                          setActiveStep(0);
                          scrollToQuote();
                        }}
                        className="focus-ring rounded-full border border-[#c7c6c8] px-6 py-3 font-mulish text-[12px] font-extrabold text-[#101820] hover:bg-[#f4f7f8]"
                      >
                        Start another quote
                      </button>
                    </div>
                  </div>
                )}
              </>
            </div>
          </div>
        </section>

        {/* ====================================================================
            NEW SECTION: ONE CONNECTED FREIGHT JOURNEY (4 CARDS SIMPLIFIER)
            ==================================================================== */}
        <section id="journey" className="scroll-mt-5 bg-white py-20 md:py-28">
          <div className="atlas-container">
            <div className="mb-14 text-center max-w-[700px] mx-auto">
              <span className="section-kicker">One Connected Freight Journey</span>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-.055em] sm:text-4xl md:text-5xl text-[#16243a]">
                Make freight booking as intuitive as travel.
              </h2>
              <p className="mt-4 text-[#65686d] text-base leading-7">
                A simpler journey from discovery to scale &mdash; starting with Air Export across 150+ direct gateways.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  step: '01',
                  phase: 'DISCOVER',
                  label: 'Explore',
                  desc: 'Find the right route & option with instant comparable rates and volumetric calculations.',
                  active: true,
                  target: 'quote',
                },
                {
                  step: '02',
                  phase: 'BOOK',
                  label: 'Decide',
                  desc: 'Choose carrier, confirm pieces, and reserve space with a guided 3-step digital flow.',
                  active: true,
                  target: 'quote',
                },
                {
                  step: '03',
                  phase: 'EXECUTE',
                  label: 'Deliver',
                  desc: 'Track live milestones, coordinate warehouse tenders, and receive digital Master AWBs.',
                  active: true,
                  target: 'shipments',
                },
                {
                  step: '04',
                  phase: 'SCALE',
                  label: 'Grow',
                  desc: 'Standardize commercial logic, contract pricing, and scale across Sea Export & Imports.',
                  active: false,
                  target: 'network',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  role="button"
                  tabIndex={0}
                  onClick={() => scrollToSection(item.target)}
                  onKeyDown={(e) => { if (e.key === 'Enter') scrollToSection(item.target); }}
                  className={`rounded-2xl border p-6 transition cursor-pointer text-left ${
                    item.active
                      ? 'border-[#d4e9e3] bg-[#f8fbfa] shadow-sm hover:shadow-md hover:border-[#187e9c] hover:-translate-y-1'
                      : 'border-[#dfe5e7] bg-[#fdfdfd] opacity-80 hover:opacity-100 hover:border-[#b8c5c7]'
                  }`}
                  title={`Navigate to ${item.phase}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mulish text-xs font-black text-[#d8891c]">{item.step}</span>
                    <span className="rounded-full bg-[#187e9c]/10 px-2.5 py-0.5 font-mulish text-[10px] font-extrabold uppercase tracking-wider text-[#187e9c]">
                      {item.label}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-[-.03em] text-[#16243a] flex items-center justify-between">
                    <span>{item.phase}</span>
                    <ArrowUpRight size={14} className="text-[#187e9c] opacity-70 group-hover:opacity-100" />
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#65686d]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====================================================================
            SECTION 02: HOW IT WORKS (ELEVATED VISUAL PRESENTATION & STRUCTURE)
            ==================================================================== */}
        <section id="how-it-works" className="scroll-mt-5 bg-[#f8f6f1] py-20 md:py-28 border-t border-[#dfe5e7]">
          <div className="atlas-container">
            <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:gap-16 xl:gap-20 items-start">
              {/* Left Column: Vision, SLA Guarantee, and Direct Trigger */}
              <div className="lg:sticky lg:top-28">
                <div className="section-kicker">The JF difference</div>
                <h2 className="mt-4 text-4xl font-semibold leading-[1.02] tracking-[-.055em] md:text-5xl text-[#16243a]">
                  Less chasing.<br /><span className="font-editorial font-normal italic text-[#187e9c]">More moving.</span>
                </h2>
                <p className="mt-5 max-w-[420px] leading-7 text-[#65686d] text-sm md:text-base">
                  Traditional air export relies on endless email threads, opaque agent markups, and delayed airway bills. Jetfreight replaces phone-tag with instant algorithmic rate discovery, transparent landed costs, and direct digital operations handoffs.
                </p>

                {/* Operational SLA Assurance Card */}
                <div className="mt-8 rounded-2xl border border-[#dfe5e7] bg-white p-6 shadow-xs">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-[#eef2f3]">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef8f5] text-[#176579]">
                      <ShieldCheck size={18} />
                    </span>
                    <div>
                      <strong className="block text-xs font-black uppercase tracking-wider text-[#101820]">
                        The Digital Freight SLA
                      </strong>
                      <span className="font-mulish text-[11px] text-[#908e92]">Backed by NSE-listed logistics infrastructure</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3 font-mulish text-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 text-[#101820] font-bold">
                        <Clock3 size={14} className="text-[#187e9c] shrink-0" />
                        <span>Under 60 Seconds</span>
                      </div>
                      <span className="text-[#65686d] text-right">Instant multi-carrier rate discovery</span>
                    </div>

                    <div className="flex items-start justify-between gap-3 border-t border-[#f4f7f8] pt-2.5">
                      <div className="flex items-center gap-2 text-[#101820] font-bold">
                        <CheckCircle2 size={14} className="text-[#187e9c] shrink-0" />
                        <span>2-Hour AWB SLA</span>
                      </div>
                      <span className="text-[#65686d] text-right">Draft e-AWB issued post-booking</span>
                    </div>

                    <div className="flex items-start justify-between gap-3 border-t border-[#f4f7f8] pt-2.5">
                      <div className="flex items-center gap-2 text-[#101820] font-bold">
                        <Building2 size={14} className="text-[#187e9c] shrink-0" />
                        <span>100% Landed Cost</span>
                      </div>
                      <span className="text-[#65686d] text-right">Itemized FSC, THC &amp; GST included</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    onClick={scrollToQuote}
                    className="focus-ring rounded-full bg-[#101820] px-6 py-3 font-mulish text-xs font-extrabold text-white transition hover:bg-[#263740] flex items-center gap-2 shadow-sm"
                  >
                    <span>Build Your Export Quote</span>
                    <ArrowRight size={14} className="text-[#f2a63d]" />
                  </button>
                  <a
                    href="#network"
                    className="font-mulish text-xs font-bold text-[#187e9c] hover:underline px-3 py-2"
                  >
                    View 150+ gateways &rarr;
                  </a>
                </div>
              </div>

              {/* Right Column: 3 Elevated Stepped Cards with Visual Micro-Widgets */}
              <div className="space-y-6">
                {/* STEP 01 */}
                <div className="rounded-2xl border border-[#dfe5e7] bg-white p-6 sm:p-7 shadow-xs hover:border-[#187e9c]/50 transition">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef8f5] text-[#176579]">
                        <Sparkles size={18} />
                      </span>
                      <span className="font-mulish text-[11px] font-extrabold uppercase tracking-widest text-[#187e9c] bg-[#eef8f5] px-3 py-1 rounded-full">
                        Step 01 &middot; Specification &amp; Pricing
                      </span>
                    </div>
                    <span className="font-mulish text-2xl font-black text-[#d8891c]">01</span>
                  </div>

                  <h3 className="mt-4 text-xl font-bold tracking-[-.03em] text-[#16243a]">
                    Configure shipment specs in under 60 seconds
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#65686d]">
                    Tell us origin and destination hubs, ready date, piece dimensions, and cargo type. Our engine automatically computes gross vs. volumetric chargeable weight using the IATA standard 1:6 ratio, with direct carrier allocations across active trade lanes.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 font-mulish text-[11px] font-bold text-[#556972]">
                    <span className="rounded-lg bg-[#f4f7f8] px-2.5 py-1 border border-[#dfe5e7]">IATA 1:6 Volumetric Ratio</span>
                    <span className="rounded-lg bg-[#f4f7f8] px-2.5 py-1 border border-[#dfe5e7]">IATA Tariff Matching</span>
                    <span className="rounded-lg bg-[#f4f7f8] px-2.5 py-1 border border-[#dfe5e7]">Pharma, DGR &amp; Perishables</span>
                  </div>

                  {/* Micro-Artifact: Step 1 Spec Engine Snippet */}
                  <div className="mt-5 rounded-xl border border-[#eef2f3] bg-[#f8fbfa] p-4">
                    <div className="flex items-center justify-between font-mulish text-[10px] font-extrabold uppercase tracking-wider text-[#908e92] mb-2 pb-2 border-b border-[#eef2f3]">
                      <span>Real-Time Volumetric Engine</span>
                      <span className="text-[#187e9c]">Algorithmic Discovery</span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 text-xs font-mulish">
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-[#187e9c] shrink-0" />
                        <span className="font-bold text-[#101820]">BOM (Mumbai) &rarr; LHR (London)</span>
                      </div>
                      <div className="flex items-center gap-2 sm:justify-end">
                        <Boxes size={13} className="text-[#176579] shrink-0" />
                        <span className="text-[#556972]">5 Wooden Crates &middot; <strong className="text-[#101820]">840 kg Chg.</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* STEP 02 */}
                <div className="rounded-2xl border border-[#dfe5e7] bg-white p-6 sm:p-7 shadow-xs hover:border-[#187e9c]/50 transition">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff4e4] text-[#8b5717]">
                        <Plane size={18} />
                      </span>
                      <span className="font-mulish text-[11px] font-extrabold uppercase tracking-widest text-[#8b5717] bg-[#fff4e4] px-3 py-1 rounded-full">
                        Step 02 &middot; Carrier Selection &amp; Transparency
                      </span>
                    </div>
                    <span className="font-mulish text-2xl font-black text-[#d8891c]">02</span>
                  </div>

                  <h3 className="mt-4 text-xl font-bold tracking-[-.03em] text-[#16243a]">
                    Compare airline schedules, cutoffs, and landed costs
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#65686d]">
                    Compare verified commercial schedules across primary carriers. View instant all-in landed rates across verified airlines with strict warehouse cutoff countdowns.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 font-mulish text-[11px] font-bold text-[#556972]">
                    <span className="rounded-lg bg-[#f4f7f8] px-2.5 py-1 border border-[#dfe5e7]">Direct Airline Allocation</span>
                    <span className="rounded-lg bg-[#f4f7f8] px-2.5 py-1 border border-[#dfe5e7]">Sahar / IGI Warehouse Cutoffs</span>
                    <span className="rounded-lg bg-[#f4f7f8] px-2.5 py-1 border border-[#dfe5e7]">Zero Hidden Surcharges</span>
                  </div>

                  {/* Micro-Artifact: Step 2 Rate & Cutoff Comparison */}
                  <div className="mt-5 rounded-xl border border-[#eef2f3] bg-[#f8fbfa] p-4">
                    <div className="flex items-center justify-between font-mulish text-[10px] font-extrabold uppercase tracking-wider text-[#908e92] mb-2 pb-2 border-b border-[#eef2f3]">
                      <span>Carrier Allocation &amp; Schedule</span>
                      <span className="text-[#176579] font-bold">Guaranteed Space</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mulish">
                      <div>
                        <strong className="block text-[#101820]">Air India Cargo (AI 161) &middot; Non-stop</strong>
                        <span className="text-[#65686d] text-[11px]">Dep: 02:45 &middot; Cutoff: 18:00 IST (Sahar Gate 4)</span>
                      </div>
                      <div className="text-left sm:text-right">
                        <strong className="text-sm font-black text-[#101820]">₹1,84,200</strong>
                        <span className="block text-[10px] text-[#187e9c] font-bold">All-in Landed (Inc. THC &amp; GST)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* STEP 03 */}
                <div className="rounded-2xl border border-[#dfe5e7] bg-white p-6 sm:p-7 shadow-xs hover:border-[#187e9c]/50 transition">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eaf9fd] text-[#187e9c]">
                        <ShieldCheck size={18} />
                      </span>
                      <span className="font-mulish text-[11px] font-extrabold uppercase tracking-widest text-[#187e9c] bg-[#eaf9fd] px-3 py-1 rounded-full">
                        Step 03 &middot; Digital Execution &amp; Docs
                      </span>
                    </div>
                    <span className="font-mulish text-2xl font-black text-[#d8891c]">03</span>
                  </div>

                  <h3 className="mt-4 text-xl font-bold tracking-[-.03em] text-[#16243a]">
                    Instant reference, 2-hour AWB SLA, and legal vault
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#65686d]">
                    Confirm your space in one click. Receive an instant booking reference, dispatch for optional door pickup, let our export team verify documents, and retrieve official Master e-AWBs and IRN-verified GST e-invoices directly from the Operations Console.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 font-mulish text-[11px] font-bold text-[#556972]">
                    <span className="rounded-lg bg-[#f4f7f8] px-2.5 py-1 border border-[#dfe5e7]">Instant Reference (JFLL-AE-...)</span>
                    <span className="rounded-lg bg-[#f4f7f8] px-2.5 py-1 border border-[#dfe5e7]">2-Hour Master e-AWB Turnaround</span>
                    <span className="rounded-lg bg-[#f4f7f8] px-2.5 py-1 border border-[#dfe5e7]">ICES EDI Customs LEO Filing</span>
                  </div>

                  {/* Micro-Artifact: Step 3 Milestone & Document Telemetry */}
                  <div className="mt-5 rounded-xl border border-[#eef2f3] bg-[#f8fbfa] p-4">
                    <div className="flex items-center justify-between font-mulish text-[10px] font-extrabold uppercase tracking-wider text-[#908e92] mb-2 pb-2 border-b border-[#eef2f3]">
                      <span>Operations Telemetry</span>
                      <span className="text-[#187e9c] font-bold">2h SLA Active</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mulish">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-[#101820]">
                          <Check size={13} className="text-[#187e9c]" />
                          <span>Ref: JFLL-AE-2026-04815</span>
                        </div>
                        <span className="text-[#65686d] text-[11px] block">ICES EDI Shipping Bill &middot; LEO Handover Target</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 border border-[#dfe5e7] text-[10px] font-bold text-[#101820]">
                          <FileText size={11} className="text-[#187e9c]" /> e-AWB Draft
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 border border-[#dfe5e7] text-[10px] font-bold text-[#101820]">
                          <FileCheck size={11} className="text-[#176579]" /> GST IRN
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            NEW SECTION: SHIPMENT OPERATIONS CONSOLE (MY SHIPMENTS)
            ==================================================================== */}
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
                  onClick={openTrackModal}
                  className="focus-ring rounded-full border border-[#dfe5e7] bg-white px-4 py-2.5 font-mulish text-xs font-extrabold text-[#16243a] transition hover:bg-[#f4f7f8] flex items-center gap-1.5"
                >
                  <Search size={13} className="text-[#187e9c]" />
                  <span>Quick Track AWB</span>
                </button>
                <button
                  onClick={() => {
                    setActiveStep(0);
                    scrollToQuote();
                  }}
                  className="focus-ring rounded-full bg-[#101820] px-5 py-2.5 font-mulish text-xs font-extrabold text-white transition hover:bg-[#263740] flex items-center gap-2"
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
                          onClick={() =>
                            setActiveDocumentPreview({
                              title: `Air Waybill Draft (${selectedShipment.awbNumber})`,
                              type: 'Master Air Waybill (e-AWB)',
                              reference: selectedShipment.reference,
                            })
                          }
                          className="flex items-center gap-2.5 rounded-xl border border-[#dfe5e7] p-3 text-left font-mulish text-xs transition hover:bg-[#f4f7f8] hover:border-[#187e9c]"
                        >
                          <FileText size={18} className="text-[#187e9c] shrink-0" />
                          <div>
                            <span className="block font-bold text-[#101820]">MAWB Draft</span>
                            <span className="text-[10px] text-[#65686d]">PDF preview</span>
                          </div>
                        </button>

                        <button
                          onClick={() =>
                            setActiveDocumentPreview({
                              title: `GST Tax Invoice (INV-${selectedShipment.reference})`,
                              type: 'Official GST E-Invoice (IRN verified)',
                              reference: selectedShipment.reference,
                            })
                          }
                          className="flex items-center gap-2.5 rounded-xl border border-[#dfe5e7] p-3 text-left font-mulish text-xs transition hover:bg-[#f4f7f8] hover:border-[#187e9c]"
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

        {/* ====================================================================
            SECTION 03: OUR NETWORK (AUTHENTIC NETWORK CARDS)
            ==================================================================== */}
        <section id="network" className="scroll-mt-5 bg-[#eef8f5] py-20 md:py-28">
          <div className="atlas-container">
            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <div>
                <div className="section-kicker">A network you can use</div>
                <h2 className="mt-4 max-w-[680px] text-4xl font-semibold tracking-[-.055em] md:text-5xl text-[#16243a]">
                  The right flight is the one that gets your business there.
                </h2>
              </div>
              <p className="max-w-[300px] leading-6 text-[#65686d] text-sm">
                Access dependable capacity across India&apos;s primary export hubs to Middle East, Europe &amp; US.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {[
                {
                  city: 'Mumbai',
                  code: 'BOM',
                  detail: 'Western India primary air gateway',
                  stat: '64',
                  label: 'weekly departures',
                  icon: <MapPin size={18} />,
                  onSelect: () => selectNetworkRoute('BOM', 'DXB'),
                },
                {
                  city: 'Dubai',
                  code: 'DXB',
                  detail: 'Middle East commercial hub & transit',
                  stat: '12+',
                  label: 'daily flights',
                  icon: <Globe2 size={18} />,
                  onSelect: () => selectNetworkRoute('BOM', 'DXB'),
                },
                {
                  city: 'London',
                  code: 'LHR',
                  detail: 'UK & European distribution hub',
                  stat: '24h',
                  label: 'average transit',
                  icon: <Truck size={18} />,
                  onSelect: () => selectNetworkRoute('DEL', 'LHR'),
                },
              ].map((item) => (
                <div
                  key={item.code}
                  role="button"
                  tabIndex={0}
                  onClick={item.onSelect}
                  onKeyDown={(e) => { if (e.key === 'Enter') item.onSelect(); }}
                  className="group relative overflow-hidden rounded-[22px] border border-[#d4e9e3] bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(18,34,44,.08)] cursor-pointer text-left"
                  title={`Click to quote freight via ${item.city} (${item.code})`}
                >
                  <div className="flex items-start justify-between">
                    <div className="rounded-xl bg-[#eef8f5] p-3 text-[#176579]">{item.icon}</div>
                    <span className="font-mulish text-[10px] font-extrabold tracking-[.14em] text-[#908e92]">
                      {item.code}
                    </span>
                  </div>
                  <h3 className="mt-12 text-2xl font-semibold tracking-[-.04em] text-[#16243a] flex items-center justify-between">
                    <span>{item.city}</span>
                    <span className="font-mulish text-[11px] font-bold text-[#187e9c] opacity-0 group-hover:opacity-100 transition-opacity">
                      Quote corridor &rarr;
                    </span>
                  </h3>
                  <p className="mt-1 text-sm text-[#65686d]">{item.detail}</p>
                  <div className="mt-7 flex items-end justify-between border-t border-[#dfebe6] pt-4">
                    <div>
                      <strong className="text-2xl tracking-[-.04em] text-[#16243a]">{item.stat}</strong>
                      <span className="font-mulish ml-2 text-[10px] font-bold text-[#908e92]">{item.label}</span>
                    </div>
                    <ArrowUpRight
                      size={18}
                      className="text-[#d8891c] transition group-hover:translate-x-1 group-hover:-translate-y-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====================================================================
            SECTION 04: OPERATIONAL PROMISE (AUTHENTIC HIGH-CONTRAST CARD)
            ==================================================================== */}
        <section id="promise" className="scroll-mt-5 bg-white py-20 md:py-28">
          <div className="atlas-container">
            <div className="rounded-[28px] bg-[#101820] px-6 py-12 text-white sm:px-10 md:px-16 md:py-16">
              <div className="grid gap-12 lg:grid-cols-[1fr_.85fr] lg:items-center">
                <div>
                  <div className="section-kicker !text-[#ffd08a]">Our operating promise</div>
                  <h2 className="mt-4 max-w-[680px] text-4xl font-semibold leading-[1.02] tracking-[-.06em] md:text-6xl text-white">
                    When the answer matters, you should not have to{' '}
                    <span className="font-editorial font-normal italic text-[#ffd08a]">wait for it.</span>
                  </h2>
                </div>

                <div className="border-t border-white/15 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                  <p className="leading-7 text-[#b7c1c5]">
                    Our digital front door is built around a simple idea: operational confidence starts before the cargo
                    leaves your warehouse.
                  </p>
                  <div className="mt-8 grid grid-cols-2 gap-5">
                    <div>
                      <strong className="text-3xl text-white">&lt; 2 hr</strong>
                      <div className="font-mulish mt-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#7d8d93]">
                        AWB issuance target
                      </div>
                    </div>
                    <div>
                      <strong className="text-3xl text-white">24/7</strong>
                      <div className="font-mulish mt-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#7d8d93]">
                        shipment visibility
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ====================================================================
          FOOTER (AUTHENTIC THREE-COLUMN LAYOUT)
          ==================================================================== */}
      <footer className="border-t border-[#dfe5e7] bg-[#f7f9fb] py-12">
        <div className="atlas-container">
          <div className="flex flex-col justify-between gap-10 md:flex-row">
            <div>
              <Logo />
              <p className="mt-5 max-w-[280px] text-sm leading-6 text-[#65686d]">
                A clearer way to move what matters, from India to 150+ gateways worldwide.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-16 gap-y-3 sm:grid-cols-3">
              <div>
                <div className="font-mulish mb-3 text-[10px] font-extrabold uppercase tracking-[.15em] text-[#908e92]">
                  Explore
                </div>
                <a href="#quote" className="quiet-link block text-sm">
                  Get a quote
                </a>
                <a href="#journey" className="quiet-link mt-2 block text-sm">
                  Journey
                </a>
                <a href="#how-it-works" className="quiet-link mt-2 block text-sm">
                  How it works
                </a>
                <a href="#shipments" className="quiet-link mt-2 block text-sm">
                  Operations
                </a>
              </div>

              <div>
                <div className="font-mulish mb-3 text-[10px] font-extrabold uppercase tracking-[.15em] text-[#908e92]">
                  Policies
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setActiveDocumentPreview({
                      title: 'Privacy Policy & Digital Security Standards',
                      type: 'ISO 27001 & ICES Customs Privacy Compliance',
                      reference: 'JFLL-POL-PRIVACY',
                    })
                  }
                  className="quiet-link block text-sm text-left hover:underline cursor-pointer"
                >
                  Privacy policy
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveDocumentPreview({
                      title: 'Standard Trading Conditions of Carriage',
                      type: 'IATA & FMC Contractual Policy',
                      reference: 'JFLL-POL-CARRIAGE',
                    })
                  }
                  className="quiet-link mt-2 block text-sm text-left hover:underline cursor-pointer"
                >
                  Terms of carriage
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveDocumentPreview({
                      title: 'IATA Dangerous Goods Regulations (DGR Guidelines)',
                      type: 'ICAO Annex 18 & IATA DGR Compliance Manual',
                      reference: 'JFLL-POL-IATA-DGR',
                    })
                  }
                  className="quiet-link mt-2 block text-sm text-left hover:underline cursor-pointer"
                >
                  IATA DGR Rules
                </button>
              </div>

              <div>
                <div className="font-mulish mb-3 text-[10px] font-extrabold uppercase tracking-[.15em] text-[#908e92]">
                  Contact
                </div>
                <a href="mailto:info@jetfreight.in" className="quiet-link block text-sm">
                  info@jetfreight.in
                </a>
                <span className="font-mulish mt-2 block text-[11px] font-bold text-[#908e92]">
                  Mumbai &middot; Delhi &middot; Dubai
                </span>
              </div>
            </div>
          </div>

          <div className="font-mulish mt-12 flex flex-col justify-between gap-3 border-t border-[#dfe5e7] pt-5 text-[10px] font-bold text-[#908e92] sm:flex-row">
            <span>&copy; {new Date().getFullYear()} Jet Freight Logistics Ltd. All rights reserved. NSE Listed.</span>
            <span className="flex items-center gap-2">
              <ShieldCheck size={13} className="text-[#187e9c]" /> Built for responsible movement
            </span>
          </div>
        </div>
      </footer>

      {/* ====================================================================
          MODULAR APPLICATION MODALS
          ==================================================================== */}
      <QuickTrackModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        shipmentsList={shipmentsList}
        onSelectShipment={(s) => {
          setSelectedShipment(s);
          scrollToSection('shipments');
        }}
      />

      <DocumentPreviewModal
        document={activeDocumentPreview}
        onClose={() => setActiveDocumentPreview(null)}
      />

      {/* ====================================================================
          COOKIE CONSENT BAR (AUTHENTIC PRESERVED)
          ==================================================================== */}
      {cookieVisible && (
        <div className="cookie-bar fixed bottom-5 left-1/2 z-40 w-[min(900px,calc(100%-40px))] -translate-x-1/2 rounded-2xl border border-[#dfe5e7] bg-white p-4 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mulish text-xs">
            <p className="text-[#556972]">
              We use operational cookies to remember your gateway routes, corporate tariff settings, and active bookings.
            </p>
            <button
              onClick={acceptCookies}
              className="focus-ring rounded-xl bg-[#101820] px-5 py-2 font-bold text-white uppercase text-[11px] transition hover:bg-[#263740] shrink-0 cursor-pointer"
            >
              Accept Cookies
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
