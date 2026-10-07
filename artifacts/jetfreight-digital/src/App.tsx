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

/* ==========================================================================
   TYPES & DATA MODELS
   ========================================================================== */

export type CargoType = 'General cargo' | 'Perishables' | 'Pharma healthcare' | 'Dangerous goods' | 'Express courier';

export type QuoteForm = {
  origin: string;
  destination: string;
  readyDate: string;
  pieces: string;
  weight: string;
  volume: string;
  cargoType: CargoType;
};

export type PieceLine = {
  id: string;
  pieces: number;
  length: number;
  width: number;
  height: number;
  weightPerPiece: number;
};

export type BookingForm = {
  shipperName: string;
  shipperEmail: string;
  shipperPhone: string;
  shipperCompany: string;
  shipperAddress: string;
  shipperGstin: string;
  consigneeName: string;
  consigneeEmail: string;
  consigneePhone: string;
  consigneeCompany: string;
  consigneeAddress: string;
  cargoDescription: string;
  hsCode: string;
  doorPickup: boolean;
};

export type RateBreakdown = {
  baseFreight: number;
  fuelSecurity: number;
  originTHC: number;
  gstTax: number;
  total: number;
};

export type Rate = {
  id: string;
  carrier: string;
  code: string;
  service: string;
  departure: string;
  arrival: string;
  transit: string;
  total: number;
  contractTotal?: number;
  base: number;
  fuelSecurity: number;
  originTHC: number;
  tax: number;
  included: string[];
  accent: string;
  recommended?: boolean;
  direct?: boolean;
  cutoff: string;
};

export type Milestone = {
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
  current?: boolean;
};

export type ShipmentRecord = {
  reference: string;
  awbNumber: string;
  carrier: string;
  flight: string;
  origin: string;
  destination: string;
  chargeableWeight: number;
  commodity: string;
  status: string;
  statusStep: number;
  readyDate: string;
  cutoff: string;
  totalAmount: number;
  pickupRequired: boolean;
  milestones: Milestone[];
};

export type DocumentPreview = {
  title: string;
  type: string;
  reference: string;
};

/* ==========================================================================
   STATIC DATA & CATALOG
   ========================================================================== */

const locations = [
  { code: 'BOM', city: 'Mumbai', airport: 'Chhatrapati Shivaji Maharaj Intl' },
  { code: 'DEL', city: 'Delhi', airport: 'Indira Gandhi International' },
  { code: 'BLR', city: 'Bangalore', airport: 'Kempegowda International' },
  { code: 'AMD', city: 'Ahmedabad', airport: 'Sardar Vallabhbhai Patel Intl' },
  { code: 'MAA', city: 'Chennai', airport: 'Chennai International' },
  { code: 'DXB', city: 'Dubai', airport: 'Dubai International' },
  { code: 'LHR', city: 'London', airport: 'Heathrow Airport' },
  { code: 'JFK', city: 'New York', airport: 'John F. Kennedy Intl' },
  { code: 'FRA', city: 'Frankfurt', airport: 'Frankfurt Airport' },
  { code: 'SIN', city: 'Singapore', airport: 'Changi Airport' },
  { code: 'LOS', city: 'Lagos', airport: 'Murtala Muhammed Intl' },
];

const cargoTypes: CargoType[] = [
  'General cargo',
  'Perishables',
  'Pharma healthcare',
  'Dangerous goods',
  'Express courier',
];

const initialMockRates: Rate[] = [
  {
    id: 'rate-ek',
    carrier: 'Emirates SkyCargo',
    code: 'EK 509',
    service: 'Fastest Direct Priority',
    departure: '04:30 BOM',
    arrival: '06:45 DXB',
    transit: '22 hrs door-to-port',
    total: 79000,
    contractTotal: 67150,
    base: 61500,
    fuelSecurity: 9800,
    originTHC: 3800,
    tax: 3900,
    included: ['Direct widebody lift', 'Express ramp transfer', 'Priority temperature lock'],
    accent: '#d8891c',
    recommended: true,
    direct: true,
    cutoff: '26 Aug, 18:00',
  },
  {
    id: 'rate-ai',
    carrier: 'Air India Cargo',
    code: 'AI 985',
    service: 'Best Value Scheduled',
    departure: '08:15 BOM',
    arrival: '10:30 DXB',
    transit: '24 hrs door-to-port',
    total: 72500,
    contractTotal: 61625,
    base: 56000,
    fuelSecurity: 9200,
    originTHC: 3800,
    tax: 3500,
    included: ['National carrier flag lift', 'High cubic capacity', 'Pre-allocated cargo space'],
    accent: '#187e9c',
    recommended: false,
    direct: true,
    cutoff: '26 Aug, 14:00',
  },
  {
    id: 'rate-lh',
    carrier: 'Lufthansa Cargo',
    code: 'LH 757',
    service: 'European Hub Specialist',
    departure: '01:50 BOM',
    arrival: '14:20 DXB (via FRA)',
    transit: '48 hrs hub connection',
    total: 69000,
    contractTotal: 58650,
    base: 53200,
    fuelSecurity: 8800,
    originTHC: 3800,
    tax: 3200,
    included: ['Reliable Frankfurt freighter transfer', 'Pharma cool hub certified'],
    accent: '#263740',
    recommended: false,
    direct: false,
    cutoff: '25 Aug, 20:00',
  },
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

const formatInr = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

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

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  invalid,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  invalid?: boolean;
  helper?: string;
}) {
  return (
    <label className="block">
      <span className="font-mulish mb-2 block text-[11px] font-extrabold uppercase tracking-[.08em] text-[#555c61]">
        {label}
      </span>
      <input
        data-testid={`input-${label.toLowerCase().replaceAll(' ', '-')}`}
        className={`booking-input ${invalid ? 'invalid' : ''}`}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalid}
      />
      {helper ? <span className="font-mulish mt-1.5 block text-[11px] text-[#908e92]">{helper}</span> : null}
    </label>
  );
}

function StyledSelect({
  id,
  label,
  value,
  onChange,
  options,
  icon,
  compact = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  icon?: React.ReactNode;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  return (
    <div ref={wrapperRef} className={`relative ${compact ? 'flex items-center gap-2' : ''}`}>
      <label
        htmlFor={id}
        className={`font-mulish block text-[11px] font-extrabold uppercase tracking-[.08em] text-[#4d5b62] ${
          compact ? 'shrink-0 normal-case tracking-normal' : 'mb-2'
        }`}
      >
        {label}
      </label>
      <button
        id={id}
        type="button"
        className={`booking-input select-trigger flex items-center gap-3 text-left ${
          compact ? 'w-auto min-w-[164px] rounded-full px-3 py-2 text-[11px]' : ''
        }`}
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        data-testid={`select-${id}`}
      >
        {icon ? <span className="select-leading-icon">{icon}</span> : null}
        <span className="min-w-0 flex-1 truncate">{selected.label}</span>
        <ChevronDown size={16} className={`select-chevron shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className={`select-menu ${compact ? 'min-w-[164px]' : ''}`}
            role="listbox"
            aria-label={label}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                className={`select-option ${option.value === value ? 'selected' : ''}`}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <span>{option.label}</span>
                {option.value === value ? <Check size={15} /> : null}
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
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
  const [cookieVisible, setCookieVisible] = useState(() => {
    try {
      return localStorage.getItem('jf-cookie-consent') !== 'accepted';
    } catch {
      return true;
    }
  });

  // Auth / Corporate contract state
  const [isContractUser, setIsContractUser] = useState<boolean>(false);
  const [contractUidInput, setContractUidInput] = useState<string>('JFLL-CORP-9821');
  const [contractCompanyName, setContractCompanyName] = useState<string>('Apex Industrial Exports Ltd');
  const [isUidModalOpen, setIsUidModalOpen] = useState<boolean>(false);
  const [uidError, setUidError] = useState<string>('');

  // Tracking modal state
  const [isTrackModalOpen, setIsTrackModalOpen] = useState<boolean>(false);
  const [trackQuery, setTrackQuery] = useState<string>('JFLL-AE-2026-04815');
  const [trackResult, setTrackResult] = useState<ShipmentRecord | null>(mockShipments[0]);

  // Operations Dashboard state
  const [shipmentsList, setShipmentsList] = useState<ShipmentRecord[]>(mockShipments);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentRecord>(mockShipments[0]);
  const [activeDocumentPreview, setActiveDocumentPreview] = useState<DocumentPreview | null>(null);

  // Quote form state
  const [quote, setQuote] = useState<QuoteForm>({
    origin: 'BOM',
    destination: 'DXB',
    readyDate: getToday(),
    pieces: '4',
    weight: '240',
    volume: '1.2',
    cargoType: 'General cargo',
  });
  const [quoteError, setQuoteError] = useState('');

  // Rates sorting and filtering
  const [rateFilter, setRateFilter] = useState<'all' | 'recommended' | 'cheapest' | 'fastest' | 'direct'>('all');
  const [selectedRate, setSelectedRate] = useState<Rate>(initialMockRates[0]);
  const [expandedRateId, setExpandedRateId] = useState<string | null>(null);

  // Step 2 Piece Dimensions Table
  const [pieceLines, setPieceLines] = useState<PieceLine[]>([
    { id: 'p-1', pieces: 2, length: 120, width: 80, height: 90, weightPerPiece: 60 },
    { id: 'p-2', pieces: 2, length: 100, width: 60, height: 75, weightPerPiece: 60 },
  ]);

  // Step 2 & 3 Booking Details
  const [booking, setBooking] = useState<BookingForm>({
    shipperName: 'Rajesh Mehta',
    shipperEmail: 'r.mehta@apexindustrial.in',
    shipperPhone: '+91 98201 44820',
    shipperCompany: 'Apex Industrial Exports Ltd',
    shipperAddress: 'Plot 44, MIDC Andheri East, Mumbai, MH 400093',
    shipperGstin: '27AABCA1234F1Z8',
    consigneeName: 'Faisal Al-Mansoor',
    consigneeEmail: 'faisal@gulfdistributors.ae',
    consigneePhone: '+971 4 398 2211',
    consigneeCompany: 'Gulf Trading & Distribution LLC',
    consigneeAddress: 'Warehouse B-12, Al Quoz Industrial 3, Dubai, UAE',
    cargoDescription: 'Precision industrial fasteners and CNC steel brackets',
    hsCode: '7318.15',
    doorPickup: true,
  });

  const [bookingError, setBookingError] = useState('');
  const [reference, setReference] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [dgAccepted, setDgAccepted] = useState(false);

  // Physics calculations (IATA Volumetric standard)
  const actualWeight = Number(quote.weight) || 240;
  const cbmVolWeight = (Number(quote.volume) || 1.2) * 167;
  const totalVolumetricWeightFromLines = useMemo(() => {
    return Math.round(
      pieceLines.reduce((acc, p) => {
        const vol = ((Number(p.length) || 0) * (Number(p.width) || 0) * (Number(p.height) || 0)) / 6000;
        return acc + vol * (Number(p.pieces) || 0);
      }, 0) * 10
    ) / 10;
  }, [pieceLines]);

  const volumetricWeight = Math.round(Math.max(totalVolumetricWeightFromLines, cbmVolWeight) * 10) / 10;
  const chargeableWeight = Math.max(actualWeight, volumetricWeight);

  // Filtered rates list
  const filteredRates = useMemo(() => {
    let list = [...initialMockRates];
    if (rateFilter === 'recommended') {
      list = list.filter((r) => r.recommended);
    } else if (rateFilter === 'cheapest') {
      list.sort((a, b) => {
        const pA = isContractUser && a.contractTotal ? a.contractTotal : a.total;
        const pB = isContractUser && b.contractTotal ? b.contractTotal : b.total;
        return pA - pB;
      });
    } else if (rateFilter === 'fastest') {
      list.sort((a, b) => (a.direct ? 0 : 1) - (b.direct ? 0 : 1));
    } else if (rateFilter === 'direct') {
      list = list.filter((r) => r.direct);
    }
    return list;
  }, [rateFilter, isContractUser]);

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

  const updateQuote = (key: keyof QuoteForm, value: string) =>
    setQuote((current) => ({ ...current, [key]: value }));

  const updateBooking = (key: keyof BookingForm, value: any) =>
    setBooking((current) => ({ ...current, [key]: value }));

  const handleAddPieceLine = () => {
    const newId = `p-${Date.now()}`;
    setPieceLines((prev) => [
      ...prev,
      { id: newId, pieces: 1, length: 80, width: 60, height: 60, weightPerPiece: 30 },
    ]);
  };

  const handleRemovePieceLine = (id: string) => {
    if (pieceLines.length <= 1) return;
    setPieceLines((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdatePieceLine = (id: string, field: keyof PieceLine, val: number) => {
    setPieceLines((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  const submitQuote = (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !quote.origin ||
      !quote.destination ||
      quote.origin === quote.destination ||
      Number(quote.weight) <= 0 ||
      Number(quote.pieces) <= 0
    ) {
      setQuoteError('Add a valid origin, destination, piece count and weight to see live rates.');
      return;
    }
    setQuoteError('');
    setActiveStep(1);
    window.setTimeout(() => scrollToQuote(), 50);
  };

  const goToBooking = (rate: Rate) => {
    setSelectedRate(rate);
    setActiveStep(2);
    setBookingSubStep(0);
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
    }
    if (bookingSubStep === 1) {
      if (!booking.cargoDescription.trim() || !booking.hsCode.trim()) {
        setBookingError('Please enter a clear commodity description and 6-digit HS Code for customs processing.');
        return;
      }
    }
    setBookingSubStep((prev) => Math.min(2, prev + 1));
  };

  const confirmBooking = () => {
    if (!termsAccepted || !dgAccepted) {
      setBookingError('Please accept the standard terms of carriage and Dangerous Goods compliance declaration.');
      return;
    }
    setBookingError('');
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const newRef = `JFLL-AE-2026-${randomSuffix}`;
    setReference(newRef);

    const price = isContractUser && selectedRate.contractTotal ? selectedRate.contractTotal : selectedRate.total;
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

    setShipmentsList((prev) => [newShipment, ...prev]);
    setSelectedShipment(newShipment);
    setActiveStep(3);
    window.setTimeout(() => scrollToQuote(), 50);
  };

  const acceptCookies = () => {
    try {
      localStorage.setItem('jf-cookie-consent', 'accepted');
    } catch {
      // Local fallback
    }
    setCookieVisible(false);
  };

  const getBreakdown = (rate: Rate): RateBreakdown => {
    const isContract = isContractUser && Boolean(rate.contractTotal);
    const total = isContract ? rate.contractTotal! : rate.total;
    const factor = total / rate.total;
    return {
      baseFreight: Math.round(rate.base * factor),
      fuelSecurity: Math.round(rate.fuelSecurity * factor),
      originTHC: Math.round(rate.originTHC * factor),
      gstTax: Math.round(rate.tax * factor),
      total,
    };
  };

  const handleQuickTrackLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const query = trackQuery.trim().toUpperCase();
    const found = shipmentsList.find(
      (s) => s.reference.toUpperCase().includes(query) || s.awbNumber.toUpperCase().includes(query)
    );
    setTrackResult(found ?? null);
  };

  const handleApplyUidLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractUidInput.trim()) {
      setUidError('Please enter a valid Corporate UID.');
      return;
    }
    setUidError('');
    setIsContractUser(true);
    setIsUidModalOpen(false);
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
              onClick={() => setIsTrackModalOpen(true)}
              className="font-mulish focus-ring flex items-center gap-1.5 text-[12px] font-bold text-[#187e9c] transition hover:text-[#16243a]"
            >
              <Search size={13} />
              <span>Track</span>
            </button>
          </nav>

          <div className="hidden items-center gap-4 sm:flex">
            {/* Corporate UID Contract Login Status */}
            {isContractUser ? (
              <div className="flex items-center gap-2 rounded-full border border-[#d4e9e3] bg-[#eef8f5] px-3.5 py-1.5 font-mulish text-[11px] font-extrabold text-[#176579]">
                <UserCheck size={14} className="text-[#187e9c]" />
                <span className="truncate max-w-[140px]">{contractCompanyName}</span>
                <button
                  onClick={() => setIsContractUser(false)}
                  className="ml-1 text-[10px] font-bold text-[#908e92] hover:text-[#b44f47]"
                  title="Log out of Contract Account"
                >
                  (Exit)
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsUidModalOpen(true)}
                className="focus-ring flex items-center gap-1.5 rounded-full border border-[#c5d0d2] bg-white/80 px-3.5 py-2 font-mulish text-[11px] font-extrabold text-[#16243a] transition hover:bg-white"
                data-testid="button-contract-login"
              >
                <LockKeyhole size={13} className="text-[#187e9c]" />
                <span>Log in</span>
              </button>
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
                    setIsTrackModalOpen(true);
                  }}
                  className="flex items-center gap-2 text-left text-[#187e9c]"
                >
                  <Search size={15} /> Track Shipment
                </button>

                <div className="mt-2 pt-3 border-t border-[#dfe5e7] flex items-center justify-between">
                  {isContractUser ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-[#176579]">
                      <UserCheck size={14} /> {contractCompanyName}
                      <button
                        onClick={() => setIsContractUser(false)}
                        className="text-red-600 underline ml-2"
                      >
                        Log out
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setMobileMenu(false);
                        setIsUidModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#101820]"
                    >
                      <LockKeyhole size={14} className="text-[#187e9c]" /> Log in with Corporate UID
                    </button>
                  )}
                </div>
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
              <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Booking flow steps">
                {['Route & cargo', 'Compare rates', 'Shipment details', 'Booked'].map((step, index) => {
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
                      className={`flex min-w-max items-center gap-2 text-left transition ${
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
              <AnimatePresence mode="wait">
                {activeStep === 0 && (
                  <motion.form
                    key="quote-form"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    onSubmit={submitQuote}
                  >
                    <div className="grid gap-5 md:grid-cols-2">
                      <StyledSelect
                        id="origin"
                        label="Origin gateway (India)"
                        value={quote.origin}
                        onChange={(val) => updateQuote('origin', val)}
                        icon={<MapPin size={16} />}
                        options={locations.map((loc) => ({
                          value: loc.code,
                          label: `${loc.city} (${loc.code}) · ${loc.airport}`,
                        }))}
                      />

                      <StyledSelect
                        id="destination"
                        label="Destination gateway"
                        value={quote.destination}
                        onChange={(val) => updateQuote('destination', val)}
                        icon={<MapPin size={16} />}
                        options={locations.map((loc) => ({
                          value: loc.code,
                          label: `${loc.city} (${loc.code}) · ${loc.airport}`,
                        }))}
                      />

                      <Field
                        label="Ready date"
                        type="date"
                        value={quote.readyDate}
                        onChange={(val) => updateQuote('readyDate', val)}
                      />

                      <StyledSelect
                        id="cargoType"
                        label="Commodity type"
                        value={quote.cargoType}
                        onChange={(val) => updateQuote('cargoType', val as CargoType)}
                        icon={<Boxes size={16} />}
                        options={cargoTypes.map((t) => ({ value: t, label: t }))}
                      />

                      <Field
                        label="Pieces"
                        type="number"
                        value={quote.pieces}
                        onChange={(val) => updateQuote('pieces', val)}
                        placeholder="e.g. 4"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <Field
                          label="Gross weight (kg)"
                          type="number"
                          value={quote.weight}
                          onChange={(val) => updateQuote('weight', val)}
                          placeholder="e.g. 240"
                        />
                        <Field
                          label="Volume (CBM)"
                          type="number"
                          value={quote.volume}
                          onChange={(val) => updateQuote('volume', val)}
                          placeholder="e.g. 1.2"
                        />
                      </div>
                    </div>

                    {/* Volumetric Weight Check Banner */}
                    <div className="mt-5 flex items-center justify-between rounded-xl bg-[#f4f7f8] p-4 text-xs font-mulish border border-[#dfe5e7]">
                      <div>
                        <span className="font-extrabold text-[#176579] uppercase text-[10px] tracking-wider block">
                          Chargeable Weight Verification
                        </span>
                        <div className="mt-0.5 text-[#101820]">
                          Gross: <strong>{actualWeight} kg</strong> &middot; Volumetric (1:167):{' '}
                          <strong>{volumetricWeight} kg</strong>
                        </div>
                        <span className="text-[11px] text-[#65686d]">
                          Billing weight applied: <strong className="text-[#187e9c]">{chargeableWeight} kg</strong>
                        </span>
                      </div>
                      <Info size={18} className="text-[#187e9c]" />
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
                      <button
                        type="submit"
                        className="focus-ring w-full rounded-full bg-[#f2a63d] px-7 py-3.5 font-mulish text-[12px] font-extrabold text-[#10212b] transition hover:bg-[#f6bb63] sm:w-auto"
                        data-testid="button-search-rates"
                      >
                        Search live rates <ArrowRight size={15} className="ml-2 inline" />
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* STEP 1: COMPARE RATES */}
                {activeStep === 1 && (
                  <motion.div
                    key="rates"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
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
                            { value: 'all', label: 'All' },
                            { value: 'recommended', label: 'Recommended' },
                            { value: 'cheapest', label: 'Lowest Price' },
                            { value: 'fastest', label: 'Fastest' },
                            { value: 'direct', label: 'Direct Only' },
                          ].map((tab) => (
                            <button
                              key={tab.value}
                              type="button"
                              onClick={() => setRateFilter(tab.value as any)}
                              className={`rounded-full px-3 py-1 font-mulish text-[11px] font-extrabold transition cursor-pointer ${
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
                        {filteredRates.map((rate) => {
                          const finalPrice = isContractUser && rate.contractTotal ? rate.contractTotal : rate.total;
                          const isExpanded = expandedRateId === rate.id;
                          const breakdown = getBreakdown(rate);

                          return (
                            <motion.div
                              layout
                              key={rate.id}
                              className="rate-card rounded-2xl border border-[#dfe5e7] p-5 hover:border-[#187e9c] transition"
                            >
                              <div className="grid gap-4 lg:grid-cols-[1.1fr_.85fr_.72fr_auto] lg:items-center">
                                <div className="flex items-center gap-3">
                                  <span
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mulish text-[11px] font-extrabold text-[#101820]"
                                    style={{ backgroundColor: `${rate.accent}20`, color: rate.accent }}
                                  >
                                    {rate.carrier.slice(0, 2).toUpperCase()}
                                  </span>
                                  <div>
                                    <div className="flex items-center gap-2 font-semibold text-[#101820]">
                                      <span>{rate.carrier}</span>
                                      {rate.recommended && (
                                        <span className="rounded-full bg-[#eaf9fd] px-2 py-0.5 font-mulish text-[9px] font-extrabold uppercase tracking-wider text-[#187e9c]">
                                          Best fit
                                        </span>
                                      )}
                                      {rate.direct && (
                                        <span className="rounded-full bg-[#eef8f5] px-2 py-0.5 font-mulish text-[9px] font-extrabold uppercase tracking-wider text-[#176579]">
                                          Direct
                                        </span>
                                      )}
                                    </div>
                                    <div className="font-mulish mt-0.5 text-[11px] text-[#908e92]">
                                      {rate.code} &middot; {rate.service}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 text-xs font-mulish">
                                  <div>
                                    <div className="text-[10px] font-bold text-[#908e92]">DEPART</div>
                                    <strong>{rate.departure}</strong>
                                  </div>
                                  <div className="h-px w-6 bg-[#c7c6c8]" />
                                  <div>
                                    <div className="text-[10px] font-bold text-[#908e92]">ARRIVE</div>
                                    <strong>{rate.arrival}</strong>
                                  </div>
                                </div>

                                <div>
                                  <div className="font-mulish text-[10px] font-bold text-[#908e92]">TRANSIT</div>
                                  <div className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-[#101820]">
                                    <Clock3 size={13} className="text-[#187e9c]" /> {rate.transit}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between gap-5 border-t border-[#eef1f2] pt-4 lg:block lg:border-0 lg:pt-0 lg:text-right">
                                  <div>
                                    <div className="font-mulish text-[10px] font-bold text-[#908e92]">TOTAL, INR</div>
                                    <strong className="text-xl font-black text-[#101820]">
                                      {formatInr(finalPrice)}
                                    </strong>
                                    {isContractUser && rate.contractTotal && (
                                      <span className="block font-mulish text-[10px] font-bold text-[#16a34a]">
                                        Saved {formatInr(rate.total - rate.contractTotal)}
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => goToBooking(rate)}
                                    className="focus-ring mt-2 rounded-full bg-[#101820] px-4 py-2 font-mulish text-[11px] font-extrabold text-white transition hover:bg-[#263740]"
                                  >
                                    Select <ArrowRight size={13} className="ml-1 inline" />
                                  </button>
                                </div>
                              </div>

                              <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-[#eef1f2] pt-3 font-mulish text-[10px] font-bold text-[#65686d]">
                                <div className="flex flex-wrap items-center gap-3">
                                  <span className="text-[#187e9c]">Included:</span>
                                  {rate.included.map((item) => (
                                    <span key={item} className="flex items-center gap-1">
                                      <Check size={12} className="text-[#187e9c]" /> {item}
                                    </span>
                                  ))}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setExpandedRateId(isExpanded ? null : rate.id)}
                                  className="flex items-center gap-1 text-[#187e9c] hover:underline cursor-pointer"
                                >
                                  <span>{isExpanded ? 'Hide breakdown' : 'View breakdown'}</span>
                                  <ChevronDown size={13} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                              </div>

                              {/* Accordion Itemized Cost Breakdown */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl bg-[#f8fafc] p-3 text-[11px] font-mulish border border-[#eef2f3]"
                                  >
                                    <div>
                                      <span className="text-[#908e92] block text-[9px] font-extrabold uppercase">Base Freight</span>
                                      <strong>{formatInr(breakdown.baseFreight)}</strong>
                                    </div>
                                    <div>
                                      <span className="text-[#908e92] block text-[9px] font-extrabold uppercase">Fuel &amp; Security</span>
                                      <strong>{formatInr(breakdown.fuelSecurity)}</strong>
                                    </div>
                                    <div>
                                      <span className="text-[#908e92] block text-[9px] font-extrabold uppercase">Origin THC / AWB</span>
                                      <strong>{formatInr(breakdown.originTHC)}</strong>
                                    </div>
                                    <div>
                                      <span className="text-[#908e92] block text-[9px] font-extrabold uppercase">GST (18%)</span>
                                      <strong>{formatInr(breakdown.gstTax)}</strong>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Right: Sidebars */}
                      <div className="space-y-4">
                        {/* Contract Customer UID Card */}
                        <div className="rounded-2xl border border-[#dfe5e7] bg-[#f8fafc] p-5 font-mulish text-xs">
                          <div className="flex items-center gap-2 mb-2">
                            <LockKeyhole size={16} className="text-[#187e9c]" />
                            <strong className="text-sm text-[#101820]">Contract customer?</strong>
                          </div>
                          <p className="text-[#65686d] leading-relaxed mb-4">
                            Log in with your corporate UID to reveal your pre-negotiated volume allotments and contracted tariffs.
                          </p>

                          {isContractUser ? (
                            <div className="space-y-2">
                              <div className="rounded-xl bg-white p-3 border border-[#d4e9e3] text-[#176579] font-bold">
                                <div>{contractCompanyName}</div>
                                <div className="text-[10px] text-[#65686d]">UID: {contractUidInput}</div>
                              </div>
                              <button
                                onClick={() => setIsContractUser(false)}
                                className="w-full rounded-xl border border-red-200 py-2 text-red-600 hover:bg-red-50 text-[11px] font-extrabold"
                              >
                                Exit Contract Mode
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setIsUidModalOpen(true)}
                              className="focus-ring w-full rounded-xl bg-[#101820] py-2.5 font-mulish text-[11px] font-extrabold text-white transition hover:bg-[#263740]"
                            >
                              Log in with UID
                            </button>
                          )}
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
                  </motion.div>
                )}

                {/* STEP 2: SHIPMENT DETAILS (GUIDED 3-STEP FLOW) */}
                {activeStep === 2 && (
                  <motion.div
                    key="booking"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    className="space-y-6"
                  >
                    {/* Selected Rate Banner */}
                    <div className="rounded-2xl bg-[#f1f8f5] p-4 font-mulish border border-[#d4e9e3] flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[#176579]">
                          Selected Carrier Lift
                        </span>
                        <div className="text-sm font-extrabold text-[#101820] mt-0.5">
                          {selectedRate.carrier} &middot; {selectedRate.code} &middot; {selectedRate.departure}
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-[#176579]">
                        {formatInr(isContractUser && selectedRate.contractTotal ? selectedRate.contractTotal : selectedRate.total)} total
                      </span>
                    </div>

                    {/* Sub-step Stepper */}
                    <div className="flex items-center gap-3 border-b border-[#e2e5e6] pb-3 text-xs font-mulish font-bold">
                      <button
                        onClick={() => setBookingSubStep(0)}
                        className={`transition ${bookingSubStep === 0 ? 'text-[#187e9c] border-b-2 border-[#187e9c] pb-2' : 'text-[#908e92]'}`}
                      >
                        1. Shipper &amp; Consignee
                      </button>
                      <span className="text-[#dfe5e7]">&bull;</span>
                      <button
                        onClick={() => setBookingSubStep(1)}
                        className={`transition ${bookingSubStep === 1 ? 'text-[#187e9c] border-b-2 border-[#187e9c] pb-2' : 'text-[#908e92]'}`}
                      >
                        2. Cargo Pieces &amp; HS Code
                      </button>
                      <span className="text-[#dfe5e7]">&bull;</span>
                      <button
                        onClick={() => setBookingSubStep(2)}
                        className={`transition ${bookingSubStep === 2 ? 'text-[#187e9c] border-b-2 border-[#187e9c] pb-2' : 'text-[#908e92]'}`}
                      >
                        3. Review &amp; Confirm
                      </button>
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
                        <div className="space-y-4 rounded-2xl bg-[#f8fafc] p-5 border border-[#dfe5e7]">
                          <div className="font-mulish text-[11px] font-extrabold uppercase text-[#176579] flex items-center gap-2">
                            <Building2 size={15} /> Shipper (India Exporter)
                          </div>
                          <Field
                            label="Company Name *"
                            value={booking.shipperCompany}
                            onChange={(val) => updateBooking('shipperCompany', val)}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <Field
                              label="Contact Name *"
                              value={booking.shipperName}
                              onChange={(val) => updateBooking('shipperName', val)}
                            />
                            <Field
                              label="GSTIN *"
                              value={booking.shipperGstin}
                              onChange={(val) => updateBooking('shipperGstin', val)}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
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
                        <div className="space-y-4 rounded-2xl bg-[#f8fafc] p-5 border border-[#dfe5e7]">
                          <div className="font-mulish text-[11px] font-extrabold uppercase text-[#176579] flex items-center gap-2">
                            <Building2 size={15} /> Consignee (Destination Receiver)
                          </div>
                          <Field
                            label="Company Name *"
                            value={booking.consigneeCompany}
                            onChange={(val) => updateBooking('consigneeCompany', val)}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <Field
                              label="Contact Name *"
                              value={booking.consigneeName}
                              onChange={(val) => updateBooking('consigneeName', val)}
                            />
                            <Field
                              label="Phone *"
                              value={booking.consigneePhone}
                              onChange={(val) => updateBooking('consigneePhone', val)}
                            />
                          </div>
                          <Field
                            label="Email *"
                            type="email"
                            value={booking.consigneeEmail}
                            onChange={(val) => updateBooking('consigneeEmail', val)}
                          />
                          <Field
                            label="Delivery Address *"
                            value={booking.consigneeAddress}
                            onChange={(val) => updateBooking('consigneeAddress', val)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Sub-Step 1: Cargo Pieces & Dimensions */}
                    {bookingSubStep === 1 && (
                      <div className="space-y-5">
                        <div className="flex items-center justify-between">
                          <span className="font-mulish text-xs font-extrabold uppercase tracking-wider text-[#64748b]">
                            Piece Dimensions (cm) &amp; Weight (kg)
                          </span>
                          <button
                            type="button"
                            onClick={handleAddPieceLine}
                            className="font-mulish text-xs font-bold text-[#187e9c] hover:underline flex items-center gap-1"
                          >
                            <Plus size={14} /> Add Piece Row
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          {pieceLines.map((line) => (
                            <div
                              key={line.id}
                              className="grid grid-cols-6 gap-3 items-center p-3 rounded-xl border border-[#dfe5e7] bg-[#f8fafc] text-xs font-mulish"
                            >
                              <div>
                                <label className="block text-[10px] text-[#64748b] mb-1 font-bold">Pieces</label>
                                <input
                                  type="number"
                                  className="booking-input p-2 text-xs"
                                  value={line.pieces}
                                  onChange={(e) => handleUpdatePieceLine(line.id, 'pieces', Number(e.target.value))}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-[#64748b] mb-1 font-bold">Length (cm)</label>
                                <input
                                  type="number"
                                  className="booking-input p-2 text-xs"
                                  value={line.length}
                                  onChange={(e) => handleUpdatePieceLine(line.id, 'length', Number(e.target.value))}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-[#64748b] mb-1 font-bold">Width (cm)</label>
                                <input
                                  type="number"
                                  className="booking-input p-2 text-xs"
                                  value={line.width}
                                  onChange={(e) => handleUpdatePieceLine(line.id, 'width', Number(e.target.value))}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-[#64748b] mb-1 font-bold">Height (cm)</label>
                                <input
                                  type="number"
                                  className="booking-input p-2 text-xs"
                                  value={line.height}
                                  onChange={(e) => handleUpdatePieceLine(line.id, 'height', Number(e.target.value))}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-[#64748b] mb-1 font-bold">Wt/pc (kg)</label>
                                <input
                                  type="number"
                                  className="booking-input p-2 text-xs"
                                  value={line.weightPerPiece}
                                  onChange={(e) => handleUpdatePieceLine(line.id, 'weightPerPiece', Number(e.target.value))}
                                />
                              </div>
                              <div className="text-right pt-3">
                                {pieceLines.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemovePieceLine(line.id)}
                                    className="text-red-500 hover:text-red-700 p-2"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 pt-4 border-t border-[#e2e5e6]">
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
                          />
                        </div>
                      </div>
                    )}

                    {/* Sub-Step 2: Review & Confirm */}
                    {bookingSubStep === 2 && (
                      <div className="space-y-5">
                        <div className="grid gap-5 md:grid-cols-2">
                          <div className="rounded-2xl border border-[#dfe5e7] bg-[#f8fafc] p-4 text-xs font-mulish space-y-2">
                            <strong className="block text-sm text-[#101820]">Routing &amp; Schedule</strong>
                            <div className="text-[#65686d]">Carrier: <strong className="text-[#101820]">{selectedRate.carrier} ({selectedRate.code})</strong></div>
                            <div className="text-[#65686d]">Gateways: <strong className="text-[#101820]">{quote.origin} &rarr; {quote.destination}</strong></div>
                            <div className="text-[#65686d]">Departure: <strong className="text-[#101820]">{selectedRate.departure}</strong></div>
                            <div className="text-[#65686d]">Cutoff: <strong className="text-[#101820]">{selectedRate.cutoff}</strong></div>
                          </div>

                          <div className="rounded-2xl border border-[#dfe5e7] bg-[#f8fafc] p-4 text-xs font-mulish space-y-2">
                            <strong className="block text-sm text-[#101820]">Charges Summary</strong>
                            {(() => {
                              const b = getBreakdown(selectedRate);
                              const total = booking.doorPickup ? b.total + 2400 : b.total;
                              return (
                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-[#65686d]">
                                    <span>Base Freight:</span>
                                    <strong className="text-[#101820]">{formatInr(b.baseFreight)}</strong>
                                  </div>
                                  <div className="flex justify-between text-[#65686d]">
                                    <span>Surcharges &amp; THC:</span>
                                    <strong className="text-[#101820]">{formatInr(b.fuelSecurity + b.originTHC)}</strong>
                                  </div>
                                  {booking.doorPickup && (
                                    <div className="flex justify-between text-[#187e9c]">
                                      <span>Door Pickup:</span>
                                      <strong>₹2,400</strong>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-[#65686d]">
                                    <span>GST (18%):</span>
                                    <strong className="text-[#101820]">{formatInr(b.gstTax)}</strong>
                                  </div>
                                  <div className="pt-2 border-t border-[#dfe5e7] flex justify-between font-extrabold text-sm text-[#101820]">
                                    <span>Total Payable:</span>
                                    <span className="text-[#187e9c]">{formatInr(total)}</span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>

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
                              I declare that this cargo contains no undeclared Dangerous Goods or restricted items.
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
                              I accept Jet Freight Logistics Ltd Standard Trading Conditions of Carriage.
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
                        className="font-mulish text-[11px] font-extrabold text-[#176579] hover:underline"
                      >
                        <ChevronLeft size={14} className="mr-1 inline" /> Back
                      </button>

                      {bookingSubStep < 2 ? (
                        <button
                          type="button"
                          onClick={nextBookingSubStep}
                          className="focus-ring rounded-full bg-[#f2a63d] px-7 py-3 font-mulish text-[12px] font-extrabold text-[#10212b] transition hover:bg-[#f6bb63]"
                        >
                          Continue <ArrowRight size={14} className="ml-1 inline" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={confirmBooking}
                          className="focus-ring rounded-full bg-[#187e9c] px-8 py-3.5 font-mulish text-[12px] font-extrabold text-white transition hover:bg-[#156b84]"
                        >
                          Confirm &amp; Lock Allocation <Check size={14} className="ml-1 inline" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: BOOKED / CONFIRMATION */}
                {activeStep === 3 && (
                  <motion.div
                    key="confirmation"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
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
                      <div className="mt-2 flex items-center justify-between">
                        <strong className="text-2xl tracking-[.03em] text-[#101820]">{reference}</strong>
                        <button
                          type="button"
                          onClick={handleCopyReference}
                          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold text-[#64748b] hover:bg-[#e4ebed] hover:text-[#101820] transition cursor-pointer"
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
                        <strong className="text-right text-[#101820]">{selectedRate.carrier}</strong>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                      <button
                        onClick={() => {
                          setIsContractUser(true);
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
                  </motion.div>
                )}
              </AnimatePresence>
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
                    Tell us origin and destination hubs, ready date, piece dimensions, and cargo type. Our engine automatically computes gross vs. volumetric chargeable weight using the IATA standard 1:6 ratio, applying enterprise tariffs for Corporate UID holders.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 font-mulish text-[11px] font-bold text-[#556972]">
                    <span className="rounded-lg bg-[#f4f7f8] px-2.5 py-1 border border-[#dfe5e7]">IATA 1:6 Volumetric Ratio</span>
                    <span className="rounded-lg bg-[#f4f7f8] px-2.5 py-1 border border-[#dfe5e7]">Corporate UID Tariff Matching</span>
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
                    Compare verified commercial schedules across primary carriers. Inspect detailed landed cost breakdowns—base freight, fuel security surcharges (FSC), terminal handling charges (THC), and GST—with strict warehouse cutoff countdowns.
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
                {isContractUser ? (
                  <>
                    <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#d4e9e3] bg-[#eef8f5] px-3.5 py-1.5 font-mulish text-xs font-extrabold text-[#176579]">
                      <Building2 size={13} className="text-[#187e9c]" />
                      <span className="truncate max-w-[150px]">{contractCompanyName}</span>
                      <button
                        onClick={() => setIsContractUser(false)}
                        className="ml-1 text-[11px] font-bold text-[#908e92] hover:text-[#b44f47]"
                        title="Lock Operations Console"
                      >
                        (Lock)
                      </button>
                    </div>
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
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsTrackModalOpen(true)}
                      className="focus-ring rounded-full border border-[#dfe5e7] bg-white px-4 py-2.5 font-mulish text-xs font-extrabold text-[#16243a] transition hover:bg-[#f4f7f8] flex items-center gap-1.5"
                    >
                      <Search size={13} className="text-[#187e9c]" />
                      <span>Quick Track AWB</span>
                    </button>
                    <button
                      onClick={() => setIsUidModalOpen(true)}
                      className="focus-ring rounded-full bg-[#187e9c] px-5 py-2.5 font-mulish text-xs font-extrabold text-white transition hover:bg-[#156b84] flex items-center gap-1.5 shadow-sm"
                    >
                      <LockKeyhole size={13} />
                      <span>Log in to Access</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {isContractUser ? (
              <>
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

                            <div className="mt-2 flex items-center justify-between">
                              <div>
                                <strong className="text-sm text-[#101820]">
                                  {shipment.origin} &rarr; {shipment.destination} &middot; {shipment.carrier}
                                </strong>
                                <span className="block font-mulish text-xs text-[#65686d] mt-0.5">
                                  Flight {shipment.flight} &middot; {shipment.chargeableWeight} kg &middot; {shipment.commodity}
                                </span>
                              </div>
                              <span className="text-sm font-extrabold text-[#101820]">
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
                      <h3 className="mt-2 text-lg font-extrabold text-[#101820]">
                        {selectedShipment.origin} &rarr; {selectedShipment.destination} ({selectedShipment.carrier} {selectedShipment.flight})
                      </h3>
                      <div className="mt-1 flex items-center gap-3 font-mulish text-xs text-[#65686d]">
                        <span>Ready: {selectedShipment.readyDate}</span>
                        <span>&middot;</span>
                        <span>Cutoff: {selectedShipment.cutoff}</span>
                        <span>&middot;</span>
                        <span className="font-bold text-[#101820]">{selectedShipment.chargeableWeight} kg Chargeable</span>
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
              </>
            ) : (
              /* ================================================================
                 LOGGED-OUT VIEW: SECURE OPERATIONS GATEWAY & PREVIEW PORTAL
                 ================================================================ */
              <div className="space-y-8">
                {/* Secure Operations Gate Card */}
                <div className="rounded-2xl border border-[#d4e9e3] bg-gradient-to-br from-[#f8fbfa] via-white to-[#f0f7f6] p-7 md:p-9 shadow-xs">
                  <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#eef8f5] px-3.5 py-1 font-mulish text-[11px] font-extrabold text-[#176579] mb-4">
                        <ShieldCheck size={14} className="text-[#187e9c]" />
                        <span>Corporate Operational Security &amp; Customs Confidentiality</span>
                      </div>
                      <h3 className="text-2xl font-bold tracking-[-.04em] text-[#101820] sm:text-3xl">
                        Active Corridors &amp; Legal Document Vault
                      </h3>
                      <p className="mt-3 font-mulish text-sm leading-6 text-[#65686d]">
                        To uphold IATA e-freight commercial privacy and Indian Customs EDI (ICES) data protection, live milestone feeds, airline cargo cutoff timers, Master e-AWBs, and GST Tax Invoices are restricted to authenticated corporate accounts.
                      </p>

                      <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-bold text-[#101820]">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-[#187e9c]" />
                          <span>ICES EDI Customs Milestones</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-[#187e9c]" />
                          <span>Encrypted Master e-AWB Vault</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-[#187e9c]" />
                          <span>Direct Warehouse Cutoff Alerts</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#dfe5e7] bg-white p-6 shadow-sm">
                      <div className="flex items-center gap-3 pb-4 border-b border-[#eef2f3]">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#101820] text-[#f2a63d]">
                          <LockKeyhole size={18} />
                        </div>
                        <div>
                          <strong className="block text-sm text-[#101820]">Authenticate Operations Access</strong>
                          <span className="font-mulish text-xs text-[#908e92]">Log in or track a single consignment</span>
                        </div>
                      </div>

                      <div className="mt-5 space-y-3">
                        <button
                          onClick={() => setIsUidModalOpen(true)}
                          className="focus-ring w-full flex items-center justify-center gap-2 rounded-xl bg-[#187e9c] px-5 py-3 font-mulish text-xs font-extrabold text-white transition hover:bg-[#156b84] shadow-sm"
                          data-testid="button-console-login"
                        >
                          <LockKeyhole size={14} />
                          <span>Log in with Corporate UID</span>
                        </button>

                        <button
                          onClick={() => setIsTrackModalOpen(true)}
                          className="focus-ring w-full flex items-center justify-center gap-2 rounded-xl border border-[#dfe5e7] bg-white px-5 py-2.5 font-mulish text-xs font-extrabold text-[#16243a] transition hover:bg-[#f4f7f8]"
                          data-testid="button-console-quick-track"
                        >
                          <Search size={14} className="text-[#187e9c]" />
                          <span>Quick Track Single AWB</span>
                        </button>

                        <div className="pt-2 text-center">
                          <button
                            onClick={() => setIsContractUser(true)}
                            className="inline-flex items-center gap-1.5 font-mulish text-xs font-bold text-[#187e9c] hover:underline"
                            data-testid="button-console-demo"
                          >
                            <Sparkles size={13} className="text-[#f2a63d]" />
                            <span>Explore Sample Operations Console (Demo Mode) &rarr;</span>
                          </button>
                        </div>
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

                {/* Masked High-Fidelity Console Preview Teaser */}
                <div className="relative rounded-2xl border border-[#dfe5e7] bg-white p-6 shadow-xs overflow-hidden">
                  {/* Subtle Masked Content in Background */}
                  <div className="pointer-events-none select-none opacity-40 blur-[1px]">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {[
                        { label: 'Active Shipments', val: '3', sub: 'Air export corridors' },
                        { label: 'AWB Pending', val: '1', sub: 'Within 2h SLA window' },
                        { label: 'In Transit', val: '1', sub: 'DEL → LHR (AI 161)' },
                        { label: 'Customs Cleared', val: '1', sub: 'LEO Endorsed' },
                      ].map((stat, i) => (
                        <div key={i} className="rounded-2xl border border-[#dfe5e7] bg-[#f8fbfa] p-4">
                          <span className="font-mulish text-[10px] font-extrabold uppercase text-[#908e92]">{stat.label}</span>
                          <div className="text-xl font-black text-[#101820] mt-1">{stat.val}</div>
                          <span className="font-mulish text-[11px] text-[#556972] mt-0.5 block">{stat.sub}</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[1.1fr_1.3fr]">
                      <div className="rounded-xl border border-[#dfe5e7] p-4 bg-[#fafbfb]">
                        <div className="flex items-center justify-between mb-3 border-b border-[#eef2f3] pb-2">
                          <span className="font-extrabold text-sm text-[#101820]">Active Bookings (Masked)</span>
                          <span className="font-mulish text-[10px] text-[#908e92]">Protected Vault</span>
                        </div>
                        <div className="space-y-2">
                          <div className="rounded-lg border border-[#187e9c] bg-[#eef8f5] p-3 text-xs">
                            <span className="font-black text-[#187e9c]">JFLL-AE-2026-•••••</span>
                            <span className="block font-bold text-[#101820] mt-1">BOM → DXB · Emirates SkyCargo</span>
                          </div>
                          <div className="rounded-lg border border-[#dfe5e7] bg-white p-3 text-xs">
                            <span className="font-black text-[#908e92]">JFLL-AE-2026-•••••</span>
                            <span className="block font-bold text-[#101820] mt-1">DEL → LHR · Air India Cargo</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#dfe5e7] p-4 bg-[#fafbfb]">
                        <div className="flex items-center justify-between mb-3 border-b border-[#eef2f3] pb-2">
                          <span className="font-extrabold text-sm text-[#101820]">Live Corridors &amp; Milestones</span>
                          <span className="font-mulish text-[10px] text-[#187e9c] bg-white px-2 py-0.5 rounded border border-[#d4e9e3]">AWB 176-••••-4921</span>
                        </div>
                        <div className="space-y-2 font-mulish text-xs text-[#65686d]">
                          <div className="flex items-center gap-2"><Check size={12} className="text-[#187e9c]" /> Booking Confirmed</div>
                          <div className="flex items-center gap-2"><Check size={12} className="text-[#187e9c]" /> AWB Verified &amp; Master Issued</div>
                          <div className="flex items-center gap-2 text-[#f2a63d] font-bold"><Clock3 size={12} /> Customs LEO Handover In-Progress</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Frosted Glass Overlay CTA */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/75 backdrop-blur-[2px] p-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#101820] text-[#f2a63d] shadow-md mb-3">
                      <LockKeyhole size={22} />
                    </div>
                    <h4 className="text-lg font-extrabold text-[#101820]">
                      Operations Console Locked for Unauthenticated Visitors
                    </h4>
                    <p className="mt-1.5 max-w-[500px] font-mulish text-xs leading-5 text-[#65686d]">
                      Log in with your corporate credentials to view real-time cargo cutoffs, monitor live Customs LEO status, and generate certified MAWB / GST invoices.
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={() => setIsUidModalOpen(true)}
                        className="focus-ring rounded-full bg-[#187e9c] px-6 py-2.5 font-mulish text-xs font-extrabold text-white transition hover:bg-[#156b84] shadow-sm"
                      >
                        Log in with Corporate UID
                      </button>
                      <button
                        onClick={() => setIsContractUser(true)}
                        className="focus-ring rounded-full border border-[#c7c6c8] bg-white px-5 py-2.5 font-mulish text-xs font-extrabold text-[#101820] hover:bg-[#f4f7f8]"
                      >
                        Explore in Demo Mode
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
          MODAL 1: CONTRACT CUSTOMER UID LOGIN MODAL
          ==================================================================== */}
      <AnimatePresence>
        {isUidModalOpen && (
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
                <button onClick={() => setIsUidModalOpen(false)} className="text-[#908e92] hover:text-[#101820]">
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
                  onClick={() => {
                    setContractUidInput('JFLL-CORP-4820');
                    setContractCompanyName('Apex Industrial Exports Ltd');
                    setIsContractUser(true);
                    setIsUidModalOpen(false);
                  }}
                  className="rounded-lg bg-[#187e9c] px-3 py-1.5 font-mulish text-[11px] font-extrabold text-white hover:bg-[#156b84] transition cursor-pointer shrink-0"
                >
                  Use Demo UID
                </button>
              </div>

              {uidError && (
                <div className="mt-3 rounded-lg bg-red-50 p-2 text-xs font-bold text-red-600">{uidError}</div>
              )}

              <form onSubmit={handleApplyUidLogin} className="mt-4 space-y-3">
                <Field
                  label="Corporate UID / GSTIN"
                  value={contractUidInput}
                  onChange={(val) => setContractUidInput(val)}
                  placeholder="JFLL-CORP-XXXX"
                />
                <Field
                  label="Company Name"
                  value={contractCompanyName}
                  onChange={(val) => setContractCompanyName(val)}
                  placeholder="Apex Industrial Exports Ltd"
                />

                <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#eef2f3] pt-4">
                  <button
                    type="button"
                    onClick={() => setIsUidModalOpen(false)}
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

      {/* ====================================================================
          MODAL 2: DIRECT TRACKING LOOKUP MODAL
          ==================================================================== */}
      <AnimatePresence>
        {isTrackModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#dfe5e7]"
            >
              <div className="flex items-center justify-between border-b border-[#eef2f3] pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#101820] text-[#f2a63d]">
                    <Search size={18} />
                  </span>
                  <h3 className="font-extrabold text-base text-[#101820]">Track Your Air Export</h3>
                </div>
                <button onClick={() => setIsTrackModalOpen(false)} className="text-[#908e92] hover:text-[#101820] cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleQuickTrackLookup} className="mt-4 flex gap-2">
                <input
                  type="text"
                  className="booking-input text-xs font-bold uppercase flex-1"
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  placeholder="Enter Ref (e.g. JFLL-AE-2026-04815) or AWB"
                  data-testid="input-quick-track"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#101820] px-5 py-2.5 font-mulish text-xs font-extrabold text-white transition hover:bg-[#263740] cursor-pointer"
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
                    onClick={() => {
                      setTrackQuery(chip.code);
                      const found = shipmentsList.find(
                        (s) =>
                          s.reference.toUpperCase().includes(chip.code.toUpperCase()) ||
                          s.awbNumber.toUpperCase().includes(chip.code.toUpperCase())
                      );
                      setTrackResult(found ?? null);
                    }}
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
                  <div className="pt-2 border-t border-[#d4e9e3] text-[#101820] font-bold">
                    Latest Event: {trackResult.milestones[0]?.title} &middot; {trackResult.milestones[0]?.timestamp}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedShipment(trackResult);
                      setIsContractUser(true);
                      setIsTrackModalOpen(false);
                      scrollToSection('shipments');
                    }}
                    className="mt-3 text-xs font-extrabold text-[#187e9c] hover:underline block"
                  >
                    View Full Milestone History in Operations Console &rarr;
                  </button>
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-[#dfe5e7] bg-[#f8fafc] p-4 text-xs font-mulish text-[#64748b] text-center">
                  No active shipment found matching &ldquo;{trackQuery}&rdquo;. Try another reference or contact support.
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          MODAL 3: DOCUMENT PREVIEW MODAL
          ==================================================================== */}
      <AnimatePresence>
        {activeDocumentPreview && (
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
                  <h3 className="font-extrabold text-sm text-[#101820]">{activeDocumentPreview.title}</h3>
                </div>
                <button
                  onClick={() => setActiveDocumentPreview(null)}
                  className="text-[#908e92] hover:text-[#101820] cursor-pointer"
                  aria-label="Close document preview"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="my-5 rounded-xl border border-dashed border-[#c5d0d2] bg-[#f8f9fa] p-5 text-center font-mulish text-xs text-[#556972]">
                <FileCheck size={36} className="mx-auto text-[#187e9c] mb-2" />
                <strong className="block text-sm text-[#101820]">{activeDocumentPreview.type}</strong>
                <p className="mt-1">Generated electronically by Jet Freight Operations Engine</p>
                <span className="mt-2 inline-block rounded bg-white px-2.5 py-1 text-[11px] font-bold text-[#187e9c] border border-[#e2e5e6]">
                  Reference: {activeDocumentPreview.reference}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-[#eef2f3] pt-4">
                <button
                  type="button"
                  onClick={() => setActiveDocumentPreview(null)}
                  className="font-mulish text-xs font-bold text-[#556972] hover:text-[#101820] cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert(`Simulated PDF download for ${activeDocumentPreview.title}`);
                    setActiveDocumentPreview(null);
                  }}
                  className="rounded-xl bg-[#101820] px-5 py-2.5 font-mulish text-xs font-extrabold text-white flex items-center gap-1.5 hover:bg-[#263740] transition cursor-pointer"
                >
                  <Download size={14} /> Download PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
