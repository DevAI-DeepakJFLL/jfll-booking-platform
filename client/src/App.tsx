'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Globe2,
  MapPin,
  Menu,
  Plane,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
  Search,
  Building2,
  UserCheck,
  FileCheck,
  Boxes,
} from 'lucide-react';
import { fetchLiveOrCalculatedRates } from './services/rate-discovery.service';
import {
  formatAirlineName,
  formatInr,
  parseTransitMinutes,
  parseDepartureMinutes,
  calculateVolumetricWeight,
  calculateCbm,
} from './lib/freight-domain';
import { getApiEndpoint } from './lib/utils';
import { Logo, AtlasAircraft } from './components/common/BrandAssets';
import { QuickTrackModal } from './components/modals/QuickTrackModal';
import { DocumentPreviewModal } from './components/modals/DocumentPreviewModal';
import { QuoteFormStep } from './components/quote/QuoteFormStep';
import { HeavyCargoInquiry } from './components/rates/HeavyCargoInquiry';
import { RatesComparisonGrid } from './components/rates/RatesComparisonGrid';
import { BookingConfirmation } from './components/booking/BookingConfirmation';
import { BookingWizard } from './components/booking/BookingWizard';
import { OperationsDashboard } from './components/operations/OperationsDashboard';
import { destLocations, locations, cargoCategoryOptions } from './data/locations';
import { mockShipments } from './data/mock-shipments';
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
  const [cloudSyncStatus, setCloudSyncStatus] = useState<{
    status: 'idle' | 'syncing' | 'synced' | 'error';
    message?: string;
    messageId?: string;
  }>({ status: 'idle' });

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

  // Filtered rates list - using O(1) precalculated numeric keys
  const filteredRates = useMemo(() => {
    let list = [...dynamicRates];
    if (rateFilter === 'all') {
      // Natural chronological flight schedule order - O(1) pure numeric comparison
      list.sort((a, b) => (a.departureMinutes ?? parseDepartureMinutes(a.departure)) - (b.departureMinutes ?? parseDepartureMinutes(b.departure)));
    } else if (rateFilter === 'cheapest') {
      list.sort((a, b) => {
        const diff = a.total - b.total;
        return sortAsc ? diff : -diff;
      });
    } else if (rateFilter === 'fastest') {
      list.sort((a, b) => {
        const diff = (a.transitMinutes ?? parseTransitMinutes(a.transit)) - (b.transitMinutes ?? parseTransitMinutes(b.transit));
        return sortAsc ? diff : -diff;
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

  const updateBooking = <K extends keyof BookingForm>(key: K, value: BookingForm[K]) =>
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
      if (booking.shipperIec.trim() && booking.shipperIec.trim() !== 'JFLL-ASSISTED' && booking.shipperIec.trim().length !== 10) {
        setBookingError('Please enter a valid 10-digit DGFT IEC, or leave it blank to request JFLL customs clearance assistance.');
        return;
      }
      if (!booking.shipperIec.trim()) {
        updateBooking('shipperIec', 'JFLL-ASSISTED');
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
      if (!booking.cargoDescription.trim()) {
        setBookingError('Please enter a clear commodity description.');
        return;
      }
      if (!booking.hsCode.trim()) {
        updateBooking('hsCode', 'Pending Classification (JFLL Customs Desk)');
      }
      if (quote.cargoType === 'Dangerous goods' && (!booking.dgUnNumber || !booking.dgUnNumber.trim())) {
        updateBooking('dgUnNumber', 'Pending Classification (JFLL Hazmat Desk)');
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

    // Asynchronously notify backend API / cloud persistence
    setCloudSyncStatus({
      status: 'syncing',
      message: 'Persisting booking to AWS DynamoDB & dispatching confirmation email...',
    });

    try {
      const backendUrl = getApiEndpoint('/api/bookings');
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Booking API] Submitting booking request to:', backendUrl);
      }

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
          shipperAddress: booking.shipperAddress,
          shipperGstin: booking.shipperGstin,
          shipperIec: booking.shipperIec || 'JFLL-ASSISTED',
          consignee: booking.consigneeName,
          consigneeName: booking.consigneeName,
          consigneeCompany: booking.consigneeCompany,
          consigneeEmail: booking.consigneeEmail,
          consigneePhone: booking.consigneePhone,
          consigneeAddress: booking.consigneeAddress,
          commodity: booking.cargoDescription || quote.cargoType,
          cargoDescription: booking.cargoDescription,
          hsCode: booking.hsCode || 'Pending Classification (JFLL Customs Desk)',
          dgUnNumber: booking.dgUnNumber || (quote.cargoType === 'Dangerous goods' ? 'Pending Classification (JFLL Hazmat Desk)' : undefined),
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
      })
        .then(async (res) => {
          if (!res.ok) {
            const errText = await res.text();
            console.error(`[Booking API] Server returned HTTP ${res.status}:`, errText);
            setCloudSyncStatus({
              status: 'error',
              message: `Server returned HTTP ${res.status}: ${errText}`,
            });
            return;
          }
          const data = await res.json();
          if (process.env.NODE_ENV !== 'production') {
            console.log('[Booking API] Booking successfully saved on backend:', data);
          }
          const isDynamo = data.storage ? data.storage.driver === 'dynamodb' && data.storage.success : true;
          const storageMsg = isDynamo
            ? 'Saved durably to Amazon DynamoDB.'
            : data.storage?.error
            ? `DynamoDB sync notice: ${data.storage.error}`
            : 'Saved to cloud storage fallback.';

          setCloudSyncStatus({
            status: 'synced',
            message: storageMsg,
            messageId: data.emailDelivery?.messageId || (data.emailDelivery?.success ? 'Dispatched' : undefined),
          });
        })
        .catch((err) => {
          console.error('[Booking API] Network error during booking dispatch:', err);
          setCloudSyncStatus({
            status: 'error',
            message: `Connection error: ${err.message || 'Failed to reach cloud endpoint'}`,
          });
        });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('[Booking API] Failed to trigger booking notification:', errMsg);
      setCloudSyncStatus({
        status: 'error',
        message: `Failed to dispatch: ${errMsg}`,
      });
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
                  <QuoteFormStep
                    quote={quote}
                    updateQuote={updateQuote}
                    destLocations={destLocations}
                    cargoCategoryOptions={cargoCategoryOptions}
                    quoteError={quoteError}
                    actualWeight={actualWeight}
                    volumetricWeight={volumetricWeight}
                    chargeableWeight={chargeableWeight}
                    dimVolWeight={dimVolWeight}
                    dimCbm={dimCbm}
                    hasWorkedWithJfll={hasWorkedWithJfll}
                    setHasWorkedWithJfll={setHasWorkedWithJfll}
                    jfllIdentifier={jfllIdentifier}
                    setJfllIdentifier={setJfllIdentifier}
                    booking={booking}
                    setBooking={setBooking}
                    submitQuote={submitQuote}
                  />
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
                    <RatesComparisonGrid
                      quote={quote}
                      chargeableWeight={chargeableWeight}
                      dynamicRates={dynamicRates}
                      filteredRates={filteredRates}
                      rateFilter={rateFilter}
                      setRateFilter={setRateFilter}
                      sortAsc={sortAsc}
                      setSortAsc={setSortAsc}
                      directCount={directCount}
                      isSearchingRates={isSearchingRates}
                      selectedRate={selectedRate}
                      onSelectRate={goToBooking}
                      onModifySearch={() => setActiveStep(0)}
                      formatInr={formatInr}
                      formatAirlineName={formatAirlineName}
                      locations={locations}
                    />
                  ))}

                {/* STEP 2: SHIPMENT DETAILS (GUIDED 3-STEP FLOW) */}
                {activeStep === 2 && (
                  <BookingWizard
                    booking={booking}
                    updateBooking={updateBooking}
                    bookingSubStep={bookingSubStep}
                    setBookingSubStep={setBookingSubStep}
                    bookingError={bookingError}
                    selectedRate={selectedRate}
                    quote={quote}
                    chargeableWeight={chargeableWeight}
                    pieceLines={pieceLines}
                    handleAddPieceLine={handleAddPieceLine}
                    handleRemovePieceLine={handleRemovePieceLine}
                    handleUpdatePieceLine={handleUpdatePieceLine}
                    dgAccepted={dgAccepted}
                    setDgAccepted={setDgAccepted}
                    termsAccepted={termsAccepted}
                    setTermsAccepted={setTermsAccepted}
                    onBackToStep1={() => setActiveStep(1)}
                    onNextSubStep={nextBookingSubStep}
                    onConfirmBooking={confirmBooking}
                    isSubmitting={false}
                    formatInr={formatInr}
                    formatAirlineName={formatAirlineName}
                    locations={locations}
                  />
                )}

                {/* STEP 3: BOOKED / CONFIRMATION */}
                {activeStep === 3 && (
                  <BookingConfirmation
                    booking={booking}
                    reference={reference}
                    quote={quote}
                    selectedRate={selectedRate}
                    copiedReference={copiedReference}
                    onCopyReference={handleCopyReference}
                    cloudSyncStatus={cloudSyncStatus}
                    onGoToOperations={() => scrollToSection('shipments')}
                    onStartAnotherQuote={() => {
                      setActiveStep(0);
                      scrollToQuote();
                    }}
                  />
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
        <OperationsDashboard
          shipmentsList={shipmentsList}
          selectedShipment={selectedShipment}
          setSelectedShipment={setSelectedShipment}
          isContractUser={isContractUser}
          contractCompanyName={contractCompanyName}
          onOpenTrackModal={openTrackModal}
          onBookNewShipment={() => {
            setActiveStep(0);
            scrollToQuote();
          }}
          onPreviewDocument={(doc) => setActiveDocumentPreview(doc)}
          formatInr={formatInr}
        />

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
