import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Phone, MapPin, X, ExternalLink } from 'lucide-react';
import { useLang } from '../../contexts/LangContext';

// ── Constants ──────────────────────────────────────────────────────────────────
export const HEADER_H = 160; // px — single source of truth

const LOCATIONS = {
  sheraton: {
    key: 'sheraton',
    nameEn: 'Sheraton Hotel Park',
    nameAr: 'شيراتون بارك',
    phone: '+97450090160',
    map: 'https://maps.app.goo.gl/G25NnZUtLUeZYm9AA',
  },
  maamoura: {
    key: 'maamoura',
    nameEn: 'Maamoura Kitchen',
    nameAr: 'مطبخ المعمورة',
    phone: '+97450090960',
    map: 'https://maps.app.goo.gl/K7GrqFE2r3swpZAg8',
  },
};

const DELIVERY_APPS = [
  {
    key: 'talabat',
    name: 'Talabat',
    logo: '/logo-talabat.png',
    color: '#FF6600',
    url: 'https://www.talabat.com/qatar/restaurant/763518/pasta-alfreej?aid=1635',
  },
  {
    key: 'snoonu',
    name: 'Snoonu',
    logo: '/logo-snoonu.png',
    color: '#6C2BD9',
    url: 'https://snoonu.com/restaurants/pasta-alfreej',
  },
  {
    key: 'rafeeq',
    name: 'Rafeeq',
    logo: '/logo-rafeeq.png',
    color: '#00A86B',
    url: 'https://www.gorafeeq.com/en/home/restaurants/pasta-alfreej-277',
  },
];

// ── Map Popup ──────────────────────────────────────────────────────────────────
function MapPopup({ location, onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:w-96 bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h3 className="font-bold text-charcoal text-base">{location.nameEn}</h3>
            <p className="text-gray-400 text-xs mt-0.5">{location.nameAr}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="mx-5 mb-3 rounded-xl bg-gray-100 h-44 flex flex-col items-center justify-center gap-3 border border-gray-200">
          <MapPin className="w-10 h-10 text-brand-500" />
          <p className="text-charcoal font-semibold text-sm">{location.nameEn}</p>
          <a href={location.map} target="_blank" rel="noopener noreferrer"
             className="bg-brand-500 text-white text-sm font-bold px-5 py-2 rounded-full flex items-center gap-2 hover:bg-brand-600 transition-colors">
            <MapPin className="w-4 h-4" /> Open in Google Maps
          </a>
        </div>
        <div className="px-5 pb-6">
          <a href={`tel:${location.phone}`}
             className="w-full flex items-center justify-center gap-2 bg-charcoal text-white font-bold text-sm py-3.5 rounded-xl hover:bg-black transition-colors">
            <Phone className="w-4 h-4" /> {location.phone}
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Delivery Apps Popup ────────────────────────────────────────────────────────
function DeliveryPopup({ onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:w-96 bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-charcoal text-base">Order via Delivery App</h3>
            <p className="text-gray-400 text-xs mt-0.5">اطلب عبر تطبيقات التوصيل</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* App cards */}
        <div className="p-4 flex flex-col gap-3">
          {DELIVERY_APPS.map(app => (
            <a
              key={app.key}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-3.5 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md active:scale-[0.98] transition-all bg-white"
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100 flex items-center justify-center p-1">
                <img src={app.logo} alt={app.name} className="w-full h-full object-contain"
                     onError={e => { e.currentTarget.style.display='none'; }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-charcoal text-base">{app.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">Tap to order on {app.name}</p>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                   style={{ backgroundColor: app.color + '15' }}>
                <ExternalLink className="w-4 h-4" style={{ color: app.color }} />
              </div>
            </a>
          ))}
        </div>

        <div className="px-5 pb-6">
          <button onClick={onClose}
                  className="w-full py-3 rounded-xl bg-gray-100 text-gray-500 font-semibold text-sm hover:bg-gray-200 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Header ────────────────────────────────────────────────────────────────
export default function MobileHeader() {
  const { lang, toggle } = useLang();
  const isAr = lang === 'ar';

  const [selectedKey, setSelectedKey] = useState('sheraton');
  const [dropOpen, setDropOpen]       = useState(false);
  const [mapOpen, setMapOpen]         = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const dropRef = useRef(null);

  const selected = LOCATIONS[selectedKey];
  const orderFromLabel = isAr ? 'اطلب من' : 'Order from';

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <>
      {/* ── Fixed header ──────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-40 overflow-visible"
              style={{ height: HEADER_H }}>

        {/* Background photo */}
        <img src="/header-bg.png" alt="" aria-hidden="true"
             className="absolute inset-0 w-full h-full object-cover"
             style={{ objectPosition: '42% 28%' }} />

        {/* Very light overlay — image is already dark, just darken top/bottom strips */}
        <div className="absolute inset-0"
             style={{
               background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.05) 65%, rgba(0,0,0,0.65) 100%)'
             }} />

        {/* ── TOP ROW ─────────────────────────────────────────────────────── */}
        <div className={`relative z-10 flex items-start justify-between px-3 pt-2.5 gap-2
          ${isAr ? 'flex-row-reverse' : ''}`}>

          {/* Order-from picker — stacked: trigger on top, icons below */}
          <div className="flex flex-col gap-1.5 flex-shrink-0" ref={dropRef}>
            <div className="relative">
              <button
                onClick={() => setDropOpen(o => !o)}
                className={`flex flex-col ${isAr ? 'items-end' : 'items-start'}`}
              >
                <span className="text-white/60 text-[9px] font-semibold uppercase tracking-widest leading-none mb-0.5">
                  {orderFromLabel}
                </span>
                <div className={`flex items-center gap-1 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="text-white text-sm font-bold leading-tight max-w-[140px] truncate">
                    {isAr ? selected.nameAr : selected.nameEn}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-white flex-shrink-0 transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Dropdown */}
              {dropOpen && (
                <div className={`absolute bg-white rounded-2xl shadow-2xl border border-gray-100
                                 overflow-hidden z-[100] min-w-[230px]
                                 ${isAr ? 'right-0' : 'left-0'}`}
                     style={{ top: HEADER_H - 30 }}>

                  {/* Branch options */}
                  {Object.values(LOCATIONS).map(loc => (
                    <button
                      key={loc.key}
                      onClick={() => { setSelectedKey(loc.key); setDropOpen(false); }}
                      className={`w-full px-4 py-3.5 flex items-center gap-3 transition-colors
                        ${isAr ? 'flex-row-reverse text-right' : 'text-left'}
                        ${selectedKey === loc.key
                          ? 'bg-brand-50 border-l-4 border-brand-500'
                          : 'hover:bg-gray-50 border-l-4 border-transparent'
                        }`}
                    >
                      <MapPin className={`w-4 h-4 flex-shrink-0 ${selectedKey === loc.key ? 'text-brand-500' : 'text-gray-400'}`} />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className={`text-sm font-bold leading-tight truncate
                          ${selectedKey === loc.key ? 'text-brand-700' : 'text-charcoal'}`}>
                          {isAr ? loc.nameAr : loc.nameEn}
                        </span>
                        <span className="text-[11px] text-gray-400 truncate">
                          {isAr ? loc.nameEn : loc.nameAr}
                        </span>
                      </div>
                    </button>
                  ))}

                  {/* Divider */}
                  <div className="border-t border-gray-100 mx-3" />

                  {/* Delivery apps option */}
                  <button
                    onClick={() => { setDropOpen(false); setDeliveryOpen(true); }}
                    className={`w-full px-4 py-3.5 flex items-center gap-3 hover:bg-orange-50
                      border-l-4 border-transparent hover:border-orange-400 transition-colors
                      ${isAr ? 'flex-row-reverse text-right' : 'text-left'}`}
                  >
                    {/* App mini-logos row */}
                    <div className="flex -space-x-1.5 flex-shrink-0">
                      {DELIVERY_APPS.map(app => (
                        <div key={app.key} className="w-5 h-5 rounded-full bg-white border border-gray-200 overflow-hidden flex items-center justify-center">
                          <img src={app.logo} alt={app.name} className="w-full h-full object-contain p-0.5"
                               onError={e => { e.currentTarget.style.display='none'; }} />
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-bold text-charcoal leading-tight">
                        {isAr ? 'تطبيقات التوصيل' : 'Delivery Apps'}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {isAr ? 'طلب عبر سنونو، طلبات، رفيق' : 'Snoonu · Talabat · Rafeeq'}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  </button>
                </div>
              )}
            </div>

            {/* Phone + Map icons — below the dropdown, no logo overlap */}
            <div className={`flex items-center gap-1.5 ${isAr ? 'justify-end' : 'justify-start'}`}>
              <a href={`tel:${selected.phone}`}
                 className="flex items-center gap-1 bg-white/20 hover:bg-white/35 rounded-full px-2 py-1 transition-colors"
                 title={selected.phone}>
                <Phone className="w-3 h-3 text-white" />
                <span className="text-white text-[10px] font-medium">{selected.phone}</span>
              </a>
              <button onClick={() => setMapOpen(true)}
                      className="w-7 h-7 bg-white/20 hover:bg-white/35 rounded-full flex items-center justify-center transition-colors"
                      title="View on map">
                <MapPin className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>

          {/* Logo — centered */}
          <div className="absolute left-1/2 -translate-x-1/2 top-1.5 pointer-events-none">
            <img src="/logo-light.png" alt="Pasta Alfreej"
                 className="h-24 w-auto object-contain"
                 style={{ mixBlendMode: 'screen' }}
                 onError={e => { e.currentTarget.style.display = 'none'; }} />
          </div>

          {/* Language toggle */}
          <button onClick={toggle}
                  className="shrink-0 mt-1 bg-white/20 hover:bg-white/35 border border-white/40
                             rounded-full px-3 py-1.5 text-xs font-bold text-white transition-colors">
            {isAr ? 'EN' : 'ع'}
          </button>
        </div>

        {/* ── BOTTOM STATUS BAR ───────────────────────────────────────────── */}
        <div className="absolute bottom-0 inset-x-0 px-4 py-1.5 bg-black/50 flex items-center gap-2 overflow-hidden">
          <span className="text-green-400 text-[10px] flex-shrink-0">⬤</span>
          <span className="text-white/80 text-[10px] sm:text-xs truncate" dir={isAr ? 'rtl' : 'ltr'}>
            {isAr
              ? 'أحسن باستا في قطر والبيتزا الإيطالية الأصيلة · طعم إيطالي بلمسة قطرية'
              : "Qatar's finest pasta & authentic Italian pizza · Italian flavor with a Qatari touch"}
          </span>
        </div>
      </header>

      {mapOpen      && <MapPopup      location={selected} onClose={() => setMapOpen(false)} />}
      {deliveryOpen && <DeliveryPopup                     onClose={() => setDeliveryOpen(false)} />}
    </>
  );
}
