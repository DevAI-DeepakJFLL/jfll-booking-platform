import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('artifacts/jetfreight-digital/src/App.tsx');
const content = fs.readFileSync(filePath, 'utf8');

// 1. Add heroConsoleTab state
const stateNeedle = 'const [quote, setQuote] = useState<QuoteForm>({';
const stateAddition = `const [heroConsoleTab, setHeroConsoleTab] = useState<'quote' | 'track'>('quote');\n  const [heroTrackInput, setHeroTrackInput] = useState<string>('JFLL-AE-2026-04815');\n  const [heroTrackRecord, setHeroTrackRecord] = useState<ShipmentRecord | null>(mockShipments[0]);\n  `;

if (!content.includes('heroConsoleTab')) {
  if (!content.includes(stateNeedle)) {
    throw new Error('Could not find stateNeedle: ' + stateNeedle);
  }
}

// 2. Identify the boundary from old hero to end of quote section
const heroStartStr = '<section className="hero-wash">';
const quoteEndStr = '</section>\n\n        {/* ====================================================================\n            NEW SECTION: ONE CONNECTED FREIGHT JOURNEY';

const heroStartIndex = content.indexOf(heroStartStr);
if (heroStartIndex === -1) {
  throw new Error('Could not find heroStartStr');
}

// Find the section #quote that follows
const quoteSectionStr = '<section id="quote"';
const quoteSectionIndex = content.indexOf(quoteSectionStr, heroStartIndex);
if (quoteSectionIndex === -1) {
  throw new Error('Could not find quoteSectionStr');
}

// Find where </section> closes that #quote section
const journeySectionStr = '<section id="journey"';
const journeySectionIndex = content.indexOf(journeySectionStr, quoteSectionIndex);
if (journeySectionIndex === -1) {
  throw new Error('Could not find journeySectionStr');
}

// The closing </section> is right before the journey comment
const beforeJourney = content.lastIndexOf('</section>', journeySectionIndex);
if (beforeJourney === -1 || beforeJourney < quoteSectionIndex) {
  throw new Error('Could not find closing section before journey');
}
const quoteEndIndex = beforeJourney + '</section>'.length;

// Extract the wizard inner block from lines 1267 to 2102
// Wizard starts at: <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Booking flow steps">
const wizardStartStr = '<div className="mb-8 flex items-center gap-2 overflow-x-auto pb-1"';
const wizardStartIndex = content.indexOf(wizardStartStr, quoteSectionIndex);
if (wizardStartIndex === -1) {
  throw new Error('Could not find wizardStartIndex');
}

// Wizard ends right before the closing </div>\n          </div>\n        </section> of #quote
// specifically right after </AnimatePresence>
const wizardEndStr = '</AnimatePresence>';
const wizardEndIndex = content.lastIndexOf(wizardEndStr, quoteEndIndex) + wizardEndStr.length;

const wizardInnerCode = content.slice(wizardStartIndex, wizardEndIndex);

console.log('Successfully extracted wizard code block length:', wizardInnerCode.length);

// Now construct the new Unified Split-Hero Section:
const newHeroSection = `<section className="hero-wash">
          <div className="atlas-hero-stage pb-12 lg:pb-20">
            <div className="hero-orbit" aria-hidden="true" />
            <span className="hero-spark left-[17%] top-[38%]" aria-hidden="true" />
            <span className="hero-spark right-[21%] top-[21%] scale-75" aria-hidden="true" />

            {/* Subtle background aircraft watermark */}
            <div className="hero-aircraft-wrap opacity-25 pointer-events-none" aria-hidden="true">
              <AtlasAircraft />
            </div>

            <div className="relative z-10 mx-auto max-w-[1360px] px-4 pt-[104px] sm:px-8 sm:pt-[124px] lg:px-10">
              <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
                
                {/* ========================================================
                    LEFT COLUMN: BRAND PROMISE & TRUST PROOF (lg:col-span-5)
                    ======================================================== */}
                <motion.div
                  className="hero-copy w-full lg:col-span-5 pt-2"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65 }}
                >
                  <div className="section-kicker mb-4 flex items-center gap-2 !text-[#176579]">
                    <span className="h-px w-8 bg-[#f2a63d]" />
                    <span>India to everywhere &middot; Atlas air desk</span>
                  </div>

                  <h1 className="hero-title text-balance font-semibold text-[#16243a]">
                    Cargo moves better when{' '}
                    <span className="font-editorial font-normal italic text-[#187e9c]">clarity</span> leads.
                  </h1>

                  <p className="mt-5 max-w-[460px] text-[15px] leading-relaxed text-[#42515c] sm:text-[16px]">
                    Instant spot rates, direct airline allocations, and transparent milestones for Indian air freight.
                    Quote in seconds, book with certainty.
                  </p>

                  {/* Corporate UID Contract Status / Login Banner */}
                  <div className="mt-6">
                    {isContractUser ? (
                      <div className="inline-flex items-center gap-2 rounded-xl border border-[#d4e9e3] bg-[#eef8f5] px-4 py-2 font-mulish text-xs font-extrabold text-[#176579]">
                        <UserCheck size={15} className="text-[#187e9c]" />
                        <span>Corporate Rate Active: <strong>{contractCompanyName}</strong></span>
                        <button
                          onClick={() => setIsContractUser(false)}
                          className="ml-2 text-[11px] font-bold text-[#908e92] hover:text-[#b44f47]"
                          title="Log out"
                        >
                          (Exit)
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsUidModalOpen(true)}
                        className="focus-ring inline-flex items-center gap-2 rounded-xl border border-[#c5d0d2] bg-white/90 px-4 py-2.5 font-mulish text-xs font-bold text-[#16243a] hover:bg-white transition shadow-2xs"
                        data-testid="button-hero-uid-login"
                      >
                        <LockKeyhole size={14} className="text-[#187e9c]" />
                        <span>Have a Corporate UID? Unlock contract rates</span>
                        <ArrowRight size={13} className="text-[#f2a63d]" />
                      </button>
                    )}
                  </div>

                  {/* Quick corridor selection */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      selectNetworkRoute('BOM', 'DXB');
                      setHeroConsoleTab('quote');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        selectNetworkRoute('BOM', 'DXB');
                        setHeroConsoleTab('quote');
                      }
                    }}
                    className="hero-corridor mt-6 flex max-w-[360px] items-center gap-3 pt-4 cursor-pointer group transition hover:opacity-90"
                    title="Click to populate BOM → DXB route"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#16243a] text-[#f2a63d] group-hover:scale-105 transition-transform">
                      <Plane size={15} />
                    </span>
                    <div>
                      <div className="font-mulish text-[9px] font-extrabold uppercase tracking-[.12em] text-[#587078] group-hover:text-[#187e9c] transition-colors">
                        Primary corridor &middot; Quick select
                      </div>
                      <strong className="text-sm text-[#16243a]">BOM &rarr; DXB &middot; daily widebody</strong>
                    </div>
                  </div>

                  {/* 4 Trust Badges Grid */}
                  <div className="mt-8 grid grid-cols-2 gap-3 max-w-[420px]">
                    {[
                      ['Since 1986', '38+ yrs logistics'],
                      ['IATA Agent', 'Certified cargo'],
                      ['NSE Listed', 'JETFREIGHT'],
                      ['150+ Hubs', 'Direct gateways'],
                    ].map(([value, label]) => (
                      <div key={label} className="rounded-xl border border-[rgba(43,57,83,.14)] bg-white/60 backdrop-blur-md p-3">
                        <strong className="block text-[15px] tracking-[-.04em] text-[#16243a]">{value}</strong>
                        <span className="font-mulish text-[9px] font-extrabold uppercase tracking-[.08em] text-[#5f6d74]">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* ========================================================
                    RIGHT COLUMN: LIVE BOOKING & TRACKING CONSOLE (lg:col-span-7)
                    ======================================================== */}
                <motion.div
                  id="quote"
                  className="w-full lg:col-span-7 scroll-mt-24 z-10"
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.15 }}
                >
                  <div className="rounded-[26px] bg-white p-5 sm:p-7 text-[#101820] shadow-[0_24px_64px_rgba(16,24,32,.12)] border border-[#dfe5e7]">
                    
                    {/* Top Mode Tabs: [ ✈️ Instant Quote & Booking ]  [ 🔍 Track Shipment ] */}
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#eef2f3] pb-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setHeroConsoleTab('quote')}
                          className={\`flex items-center gap-2 rounded-full px-4 py-2 font-mulish text-[12px] font-extrabold transition cursor-pointer \${
                            heroConsoleTab === 'quote'
                              ? 'bg-[#101820] text-white shadow-xs'
                              : 'bg-[#f4f7f8] text-[#556972] hover:bg-[#e7edf0]'
                          }\`}
                        >
                          <Plane size={14} className={heroConsoleTab === 'quote' ? 'text-[#f2a63d]' : ''} />
                          <span>Instant Quote &amp; Booking</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setHeroConsoleTab('track')}
                          className={\`flex items-center gap-2 rounded-full px-4 py-2 font-mulish text-[12px] font-extrabold transition cursor-pointer \${
                            heroConsoleTab === 'track'
                              ? 'bg-[#101820] text-white shadow-xs'
                              : 'bg-[#f4f7f8] text-[#556972] hover:bg-[#e7edf0]'
                          }\`}
                        >
                          <Search size={14} className={heroConsoleTab === 'track' ? 'text-[#187e9c]' : ''} />
                          <span>Track Shipment</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2 font-mulish text-[11px] font-bold text-[#176579]">
                        <span className="h-2 w-2 rounded-full bg-[#f2a63d] animate-pulse" />
                        <span>Live Tariffs</span>
                      </div>
                    </div>

                    {/* HERO CONSOLE TAB CONTENT */}
                    {heroConsoleTab === 'quote' ? (
                      <>
                        ${wizardInnerCode}
                      </>
                    ) : (
                      /* QUICK TRACKING TAB */
                      <div className="space-y-6 py-2">
                        <div>
                          <div className="font-mulish text-[11px] font-extrabold uppercase tracking-wider text-[#176579]">
                            Instant Milestone Tracking
                          </div>
                          <h3 className="text-xl font-bold text-[#16243a] mt-1">
                            Track live status with Booking Ref or AWB
                          </h3>
                          <p className="font-mulish text-xs text-[#65686d] mt-1">
                            Enter your reference number to inspect EDI Let Export Order, Sahar complex tender, and airline milestones.
                          </p>
                        </div>

                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const query = heroTrackInput.trim().toUpperCase();
                            const found = shipmentsList.find(
                              (s) => s.reference.toUpperCase().includes(query) || s.awbNumber.toUpperCase().includes(query)
                            );
                            setHeroTrackRecord(found ?? null);
                          }}
                          className="flex gap-2"
                        >
                          <input
                            type="text"
                            value={heroTrackInput}
                            onChange={(e) => setHeroTrackInput(e.target.value)}
                            placeholder="e.g. JFLL-AE-2026-04815 or 176-9283-4011"
                            className="booking-input flex-1 uppercase"
                          />
                          <button
                            type="submit"
                            className="focus-ring rounded-xl bg-[#101820] px-6 py-3 font-mulish text-xs font-extrabold text-white hover:bg-[#263740] transition"
                          >
                            Track
                          </button>
                        </form>

                        {/* Quick samples pills */}
                        <div className="flex flex-wrap items-center gap-2 font-mulish text-[11px]">
                          <span className="text-[#908e92]">Quick lookups:</span>
                          {mockShipments.slice(0, 3).map((s) => (
                            <button
                              key={s.reference}
                              type="button"
                              onClick={() => {
                                setHeroTrackInput(s.reference);
                                setHeroTrackRecord(s);
                              }}
                              className="rounded-full bg-[#f4f7f8] px-3 py-1 font-bold text-[#187e9c] hover:bg-[#e7edf0] transition"
                            >
                              {s.reference}
                            </button>
                          ))}
                        </div>

                        {/* Tracking Result Card */}
                        {heroTrackRecord ? (
                          <div className="rounded-2xl border border-[#dfe5e7] bg-[#fbfdfd] p-4 text-xs font-mulish">
                            <div className="flex items-center justify-between border-b border-[#eef2f3] pb-3">
                              <div>
                                <span className="font-bold text-[#187e9c]">{heroTrackRecord.reference}</span>
                                <span className="ml-2 text-[#908e92]">&middot; AWB {heroTrackRecord.awbNumber}</span>
                              </div>
                              <span className="rounded-full bg-[#eef8f5] px-2.5 py-0.5 text-[10px] font-extrabold text-[#176579]">
                                {heroTrackRecord.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-b border-[#eef2f3]">
                              <div>
                                <span className="text-[#908e92] text-[10px] uppercase font-bold block">Carrier</span>
                                <strong>{heroTrackRecord.carrier}</strong>
                              </div>
                              <div>
                                <span className="text-[#908e92] text-[10px] uppercase font-bold block">Route</span>
                                <strong>{heroTrackRecord.origin} &rarr; {heroTrackRecord.destination}</strong>
                              </div>
                              <div>
                                <span className="text-[#908e92] text-[10px] uppercase font-bold block">Weight</span>
                                <strong>{heroTrackRecord.chargeableWeight} kg</strong>
                              </div>
                              <div>
                                <span className="text-[#908e92] text-[10px] uppercase font-bold block">Flight</span>
                                <strong>{heroTrackRecord.flight}</strong>
                              </div>
                            </div>

                            {/* Milestones mini-timeline */}
                            <div className="mt-3 space-y-2">
                              {heroTrackRecord.milestones.slice(0, 3).map((m, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <div className={\`h-2 w-2 rounded-full mt-1 shrink-0 \${m.completed ? 'bg-[#16a34a]' : m.current ? 'bg-[#f2a63d]' : 'bg-[#d1d5db]'}\`} />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <strong className="text-[#101820] text-[11px]">{m.title}</strong>
                                      <span className="text-[#908e92] text-[10px]">{m.timestamp}</span>
                                    </div>
                                    <p className="text-[#65686d] text-[11px]">{m.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl bg-[#fff4f3] text-[#b44f47] text-xs font-mulish font-bold">
                            No shipment found matching that reference or AWB.
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </motion.div>

              </div>
            </div>
          </div>
        </section>`;

// Replace old Hero + old Section 01 with newHeroSection
let updatedContent = content.slice(0, heroStartIndex) + newHeroSection + content.slice(quoteEndIndex);

// Add the state if not present
if (!updatedContent.includes('heroConsoleTab')) {
  updatedContent = updatedContent.replace(stateNeedle, stateAddition + stateNeedle);
}

fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log('App.tsx updated successfully!');
