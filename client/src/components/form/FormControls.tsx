import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';

export function Field({
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
      <span
        className="font-mulish mb-1.5 sm:mb-2 block text-[10px] sm:text-[11px] font-extrabold uppercase tracking-normal sm:tracking-[.08em] text-[#555c61] truncate"
        title={label}
      >
        {label}
      </span>
      <input
        data-testid={`input-${label.toLowerCase().replaceAll(' ', '-')}`}
        className={`booking-input text-xs font-semibold text-[#101820] min-h-[44px] ${invalid ? 'invalid' : ''}`}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalid}
      />
      {helper ? (
        <span className="font-mulish mt-1.5 block text-[11px] text-[#908e92]">
          {helper}
        </span>
      ) : null}
    </label>
  );
}

export function StyledSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  icon,
  compact = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  icon?: React.ReactNode;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

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
    <div
      ref={wrapperRef}
      className={`relative ${compact ? 'flex items-center gap-2' : ''}`}
    >
      <label
        htmlFor={id}
        className="font-mulish block text-[11px] font-extrabold uppercase tracking-[.08em] text-[#4d5b62] mb-2"
      >
        {label}
      </label>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="booking-input select-trigger flex items-center gap-2.5 text-left w-full cursor-pointer min-h-[44px]"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {icon ? <span className="select-icon shrink-0 text-[#187e9c]">{icon}</span> : null}
        <span
          className={`min-w-0 flex-1 truncate text-xs ${
            !selected ? 'text-[#908e92] font-normal' : 'font-semibold text-[#101820]'
          }`}
        >
          {selected?.label || placeholder || 'Select an option'}
        </span>
        <ChevronDown
          size={16}
          className={`select-chevron shrink-0 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 2, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="select-dropdown absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-60 overflow-y-auto rounded-xl border border-[#dfe5e7] bg-white p-1.5 shadow-xl ring-1 ring-black/5"
            role="listbox"
            aria-label={label}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`select-option flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs font-mulish transition cursor-pointer ${
                  option.value === value
                    ? 'bg-[#101820] text-white font-bold'
                    : 'text-[#101820] hover:bg-[#f4f7f8]'
                }`}
                role="option"
                aria-selected={option.value === value}
              >
                <span className="truncate pr-2">{option.label}</span>
                {option.value === value ? (
                  <Check size={14} className="shrink-0 text-[#23c2f2]" />
                ) : null}
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function CustomDatePicker({
  id,
  label,
  value,
  onChange,
  placeholder = 'Select cargo ready date...',
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const parts = value.split('-').map(Number);
      if (parts.length === 3) return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date();
  });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleKey);
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const formattedDisplay = useMemo(() => {
    if (!value) return '';
    try {
      const parts = value.split('-').map(Number);
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const monthNames = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        return `${dayNames[d.getDay()]}, ${String(d.getDate()).padStart(
          2,
          '0'
        )} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      }
    } catch {
      return value;
    }
    return value;
  }, [value]);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const monthNamesFull = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const prevMonth = () => setViewDate(new Date(viewYear, viewMonth - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewYear, viewMonth + 1, 1));

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const formatDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const handleSelectDay = (day: number) => {
    const selected = new Date(viewYear, viewMonth, day);
    onChange(formatDateStr(selected));
    setOpen(false);
  };

  const handleQuickSelect = (offsetDays: number) => {
    const target = new Date();
    target.setDate(target.getDate() + offsetDays);
    setViewDate(target);
    onChange(formatDateStr(target));
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <label
        htmlFor={id}
        className="font-mulish block text-[11px] font-extrabold uppercase tracking-[.08em] text-[#4d5b62] mb-2"
      >
        {label}
      </label>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="booking-input select-trigger flex items-center gap-2.5 text-left w-full cursor-pointer min-h-[44px]"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Calendar size={16} className="text-[#187e9c] shrink-0" />
        <span
          className={`min-w-0 flex-1 truncate text-xs ${
            !value ? 'text-[#908e92] font-normal' : 'font-semibold text-[#101820]'
          }`}
        >
          {formattedDisplay || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`select-chevron shrink-0 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute left-0 top-[calc(100%+6px)] z-50 w-full min-w-[310px] max-w-[340px] rounded-2xl border border-[#dfe5e7] bg-white p-4 shadow-xl ring-1 ring-black/5"
            role="dialog"
            aria-label="Choose Ready Date"
          >
            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 pb-3 border-b border-[#f0f2f3]">
              <span className="text-[10px] font-bold text-[#8896a1] uppercase tracking-wider mr-1">
                Quick:
              </span>
              <button
                type="button"
                onClick={() => handleQuickSelect(0)}
                className="rounded-full bg-[#f4f7f8] px-2.5 py-1 text-[11px] font-bold text-[#101820] hover:bg-[#e7edf0] transition cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect(1)}
                className="rounded-full bg-[#f4f7f8] px-2.5 py-1 text-[11px] font-bold text-[#101820] hover:bg-[#e7edf0] transition cursor-pointer"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect(3)}
                className="rounded-full bg-[#f4f7f8] px-2.5 py-1 text-[11px] font-bold text-[#101820] hover:bg-[#e7edf0] transition cursor-pointer"
              >
                +3 Days
              </button>
            </div>

            {/* Month & Year Navigation Header */}
            <div className="flex items-center justify-between py-2.5">
              <button
                type="button"
                onClick={prevMonth}
                aria-label="Previous month"
                className="rounded-lg p-1.5 text-[#556972] hover:bg-[#f4f7f8] hover:text-[#101820] transition cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="font-extrabold text-[13px] text-[#101820]">
                {monthNamesFull[viewMonth]} {viewYear}
              </div>
              <button
                type="button"
                onClick={nextMonth}
                aria-label="Next month"
                className="rounded-lg p-1.5 text-[#556972] hover:bg-[#f4f7f8] hover:text-[#101820] transition cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Day Names Row */}
            <div className="grid grid-cols-7 gap-1 text-center font-mulish text-[10px] font-extrabold text-[#908e92] uppercase py-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1 mt-1">
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const cellDate = new Date(viewYear, viewMonth, dayNum);
                cellDate.setHours(0, 0, 0, 0);
                const isPast = cellDate < today;
                const dateStr = formatDateStr(cellDate);
                const isSelected = value === dateStr;
                const isCurrentToday = cellDate.getTime() === today.getTime();

                return (
                  <button
                    key={dayNum}
                    type="button"
                    disabled={isPast}
                    onClick={() => handleSelectDay(dayNum)}
                    className={`h-8 w-8 rounded-xl font-mulish text-[12px] font-bold transition flex items-center justify-center cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#101820] text-white shadow-xs'
                        : isPast
                        ? 'text-[#cbd5e1] cursor-not-allowed'
                        : isCurrentToday
                        ? 'bg-[#f4f7f8] text-[#187e9c] ring-1 ring-[#187e9c]/40 font-extrabold hover:bg-[#e7edf0]'
                        : 'text-[#101820] hover:bg-[#f4f7f8] hover:text-[#187e9c]'
                    }`}
                  >
                    {dayNum}
                    {isCurrentToday && !isSelected && (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#187e9c]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer with Clear */}
            {value && (
              <div className="mt-3 flex items-center justify-between border-t border-[#f0f2f3] pt-2 text-[11px] font-mulish font-bold">
                <span className="text-[#64748b] truncate max-w-[180px]">
                  {formattedDisplay}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    setOpen(false);
                  }}
                  className="text-[#b44f47] hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
