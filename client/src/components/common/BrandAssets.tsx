import React from 'react';

export function Logo({ onClick }: { onClick?: () => void }) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
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

export function AtlasAircraft() {
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
