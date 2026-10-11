'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CARRIER_CODE_MAP } from '../lib/freight-domain';

export interface AirlineLogoProps {
  carrier: string;
  carrierCode?: string;
  className?: string;
}

export function AirlineLogo({
  carrier,
  carrierCode,
  className = 'h-12 w-12',
}: AirlineLogoProps) {
  const [hasError, setHasError] = useState(false);

  const code = useMemo(() => {
    if (carrierCode && typeof carrierCode === 'string' && carrierCode.trim().length <= 3) {
      return carrierCode.trim().toUpperCase();
    }
    const raw = (carrier || '').trim().toUpperCase();
    if (CARRIER_CODE_MAP[raw]) return CARRIER_CODE_MAP[raw];
    const alphaRaw = raw.replace(/[^A-Z0-9]/g, '');
    for (const [key, val] of Object.entries(CARRIER_CODE_MAP)) {
      const alphaKey = key.replace(/[^A-Z0-9]/g, '');
      if (alphaKey === alphaRaw || alphaRaw.startsWith(alphaKey) || alphaKey.startsWith(alphaRaw)) {
        return val;
      }
    }
    return raw.slice(0, 2) || 'JF';
  }, [carrier, carrierCode]);

  const [basePath, setBasePath] = useState(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/booking-frontend')) {
      return '/booking-frontend';
    }
    return '';
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/booking-frontend')) {
      setBasePath('/booking-frontend');
    }
  }, []);

  if (hasError || !code) {
    return (
      <div className={`flex ${className} shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#101820] to-[#263740] text-white shadow-xs border border-[#101820]/10`}>
        <span className="font-mono text-xs font-black tracking-wider">
          {code || 'JF'}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex ${className} shrink-0 items-center justify-center rounded-xl bg-white border border-[#dfe5e7] shadow-2xs p-1.5 overflow-hidden transition-all`}>
      <img
        src={`${basePath}/airlines/${code}.png`}
        alt={carrier}
        loading="lazy"
        onError={() => setHasError(true)}
        className="h-full w-full object-contain"
      />
    </div>
  );
}

export default AirlineLogo;
