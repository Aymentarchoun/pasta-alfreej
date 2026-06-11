import React, { useState } from 'react';
import {
  X, Plus, Minus, Trash2, Check, Star,
  ShoppingBag, Bike, UtensilsCrossed,
  ChevronLeft, ChevronRight, Navigation,
  Phone, User, Banknote, Link,
} from 'lucide-react';
import { addOrder } from '../admin/adminStore';

// ─── Inline Instagram SVG (Lucide has no brand icons) ─────────────────────────
function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}
import { useCart } from '../contexts/CartContext';
import { useApp } from '../contexts/AppContext';
import { useLang } from '../contexts/LangContext';

// ─── Branch data ──────────────────────────────────────────────────────────────
const BRANCHES = {
  sheraton: {
    id: 'sheraton',
    nameEn: 'Sheraton Hotel Park',
    nameAr: 'شيراتون بارك',
    phone: '+97450090160',
    emoji: '🏨',
  },
  maamoura: {
    id: 'maamoura',
    nameEn: 'Maamoura Kitchen',
    nameAr: 'مطبخ المعمورة',
    phone: '+97450090960',
    emoji: '🍽',
  },
};

// ─── Step progress indicator ──────────────────────────────────────────────────
function StepBar({ current, isAr }) {
  // steps: mode(1) → branch(2) → details(3) → contact(4)
  const steps = ['mode', 'branch', 'details', 'contact'];
  const idx = steps.indexOf(current);

  return (
    <div className={`flex items-center gap-1 px-5 py-2 bg-gray-50 border-b border-gray-100
      ${isAr ? 'flex-row-reverse' : ''}`}>
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0
            ${i < idx ? 'bg-green-500 text-white' : i === idx ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
            {i < idx ? <Check className="w-3 h-3" /> : i + 1}
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 rounded-full ${i < idx ? 'bg-green-400' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Reusable step header ─────────────────────────────────────────────────────
function StepHeader({ title, onBack, isAr }) {
  const { toggle } = useLang();
  const BackIcon = isAr ? ChevronRight : ChevronLeft;
  return (
    <div className={`flex items-center gap-2 px-4 py-3.5 border-b border-gray-100 flex-shrink-0
      ${isAr ? 'flex-row-reverse' : ''}`}>
      <button onClick={onBack} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0">
        <BackIcon className="w-5 h-5 text-charcoal" />
      </button>
      <h2 className="font-bold text-charcoal text-base leading-tight flex-1 min-w-0 truncate">{title}</h2>
      <button
        onClick={toggle}
        className="flex-shrink-0 bg-gray-100 hover:bg-gray-200 border border-gray-200
                   rounded-full px-3 py-1.5 text-xs font-bold text-charcoal transition-colors"
      >
        {isAr ? 'EN' : 'ع'}
      </button>
    </div>
  );
}

// ─── Cart item row ────────────────────────────────────────────────────────────
function CartItem({ entry, isAr }) {
  const { dispatch } = useCart();
  const name       = isAr ? entry.item.nameAr : entry.item.nameEn;
  const sizeLabel  = isAr ? entry.size.labelAr : entry.size.labelEn;
  const sauceLabel = entry.sauce ? (isAr ? entry.sauce.labelAr : entry.sauce.labelEn) : null;
  const addonLabels = entry.addons.map(a => isAr ? a.labelAr : a.labelEn).join(' · ');

  const linePrice =
    (entry.size.price +
      entry.addons.reduce((s, a) => s + a.price, 0) +
      (entry.mealUpsell ? 18 : 0)) * entry.qty;

  return (
    <div className="flex gap-3 py-3.5 border-b border-gray-100">
      <img src={entry.item.image} alt={name}
           className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className={`flex items-start justify-between gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
          <p className={`font-semibold text-charcoal text-sm leading-tight ${isAr ? 'text-right' : ''}`}>
            {name}
          </p>
          <button onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: entry.cartId })}
                  className="text-gray-300 hover:text-red-400 transition-colors shrink-0 mt-0.5">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <p className={`text-gray-400 text-xs mt-0.5 leading-relaxed ${isAr ? 'text-right' : ''}`}>
          {sizeLabel}
          {sauceLabel && ` · ${sauceLabel}`}
          {addonLabels && ` · ${addonLabels}`}
          {entry.mealUpsell && (isAr ? ' · + وجبة' : ' · + Meal')}
        </p>
        {entry.instructions && (
          <p className="text-gray-300 text-xs mt-0.5 italic">"{entry.instructions}"</p>
        )}
        <div className={`flex items-center justify-between mt-2 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => dispatch({ type: 'DEC_QTY', payload: entry.cartId })}
                    className="w-6 h-6 bg-white rounded flex items-center justify-center shadow-sm">
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-sm font-bold w-4 text-center">{entry.qty}</span>
            <button onClick={() => dispatch({ type: 'INC_QTY', payload: entry.cartId })}
                    className="w-6 h-6 bg-brand-500 rounded flex items-center justify-center shadow-sm">
              <Plus className="w-3 h-3 text-white" />
            </button>
          </div>
          <span className="font-bold text-brand-600 text-sm">{linePrice.toFixed(2)} QAR</span>
        </div>
      </div>
    </div>
  );
}

// ─── STEP 1: Mode ─────────────────────────────────────────────────────────────
function ModeStep({ onBack, onNext, isAr }) {
  const [mode, setMode] = useState(null);

  const options = [
    {
      id: 'delivery',
      icon: <Bike className="w-6 h-6" />,
      labelEn: 'Delivery',         labelAr: 'توصيل',
      descEn:  '+10 QAR delivery fee', descAr: '+10 ريال رسوم توصيل',
      color: 'bg-orange-500',
    },
    {
      id: 'takeaway',
      icon: <ShoppingBag className="w-6 h-6" />,
      labelEn: 'Take Away',        labelAr: 'استلام من الفرع',
      descEn:  'Pick up your order', descAr: 'استلم طلبك من الفرع',
      color: 'bg-brand-500',
    },
    {
      id: 'dinein',
      icon: <UtensilsCrossed className="w-6 h-6" />,
      labelEn: 'Dine In',          labelAr: 'تناول في المطعم',
      descEn:  'Sheraton only',    descAr: 'شيراتون فقط',
      color: 'bg-emerald-600',
    },
  ];

  return (
    <div className="flex flex-col h-full" dir={isAr ? 'rtl' : 'ltr'}>
      <StepHeader title={isAr ? 'كيف تريد طلبك؟' : 'How would you like your order?'} onBack={onBack} isAr={isAr} />
      <StepBar current="mode" isAr={isAr} />

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
        {options.map(opt => {
          const active = mode === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setMode(opt.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all
                ${active ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}
                ${isAr ? 'flex-row-reverse text-right' : 'text-left'}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors
                ${active ? opt.color + ' text-white' : 'bg-gray-100 text-gray-400'}`}>
                {opt.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${active ? 'text-brand-700' : 'text-charcoal'}`}>
                  {isAr ? opt.labelAr : opt.labelEn}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">{isAr ? opt.descAr : opt.descEn}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                ${active ? 'border-brand-500 bg-brand-500' : 'border-gray-300'}`}>
                {active && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={() => mode && onNext(mode)}
          disabled={!mode}
          className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-gray-200 disabled:text-gray-400
                     text-white font-bold rounded-2xl py-4 transition-all active:scale-95"
        >
          {isAr ? 'التالي' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

// ─── STEP 2: Branch ───────────────────────────────────────────────────────────
function BranchStep({ mode, onBack, onNext, isAr }) {
  const [branch, setBranch] = useState(mode === 'dinein' ? 'sheraton' : null);

  // Dine in = Sheraton only
  const availableBranches = mode === 'dinein'
    ? [BRANCHES.sheraton]
    : [BRANCHES.sheraton, BRANCHES.maamoura];

  return (
    <div className="flex flex-col h-full" dir={isAr ? 'rtl' : 'ltr'}>
      <StepHeader title={isAr ? 'اختر الفرع' : 'Choose Branch'} onBack={onBack} isAr={isAr} />
      <StepBar current="branch" isAr={isAr} />

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
        {mode === 'dinein' && (
          <div className={`flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200
            rounded-xl text-emerald-700 text-xs font-semibold ${isAr ? 'flex-row-reverse' : ''}`}>
            <UtensilsCrossed className="w-4 h-4 shrink-0" />
            {isAr ? 'الجلوس متاح في شيراتون فقط' : 'Dine In is available at Sheraton only'}
          </div>
        )}

        {availableBranches.map(b => {
          const active = branch === b.id;
          return (
            <button
              key={b.id}
              onClick={() => setBranch(b.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all
                ${active ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}
                ${isAr ? 'flex-row-reverse text-right' : 'text-left'}`}
            >
              <span className="text-3xl shrink-0">{b.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${active ? 'text-brand-700' : 'text-charcoal'}`}>
                  {isAr ? b.nameAr : b.nameEn}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">{b.phone}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                ${active ? 'border-brand-500 bg-brand-500' : 'border-gray-300'}`}>
                {active && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={() => branch && onNext(branch)}
          disabled={!branch}
          className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-gray-200 disabled:text-gray-400
                     text-white font-bold rounded-2xl py-4 transition-all active:scale-95"
        >
          {isAr ? 'التالي' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

// ─── STEP 3: Details (location + payment for delivery; counter info for others)
function DetailsStep({ mode, branch, subtotal, onBack, onNext, isAr }) {
  // Delivery state
  const [gpsStatus, setGpsStatus]     = useState('idle'); // idle | loading | ok | error
  const [gpsCoords, setGpsCoords]     = useState(null);
  const [manualAddr, setManualAddr]   = useState('');
  const [payMethod,  setPayMethod]    = useState(null);   // 'cash' | 'card'

  const deliveryFee = 10;
  const total = mode === 'delivery' ? subtotal + deliveryFee : subtotal;

  function detectGPS() {
    if (!navigator.geolocation) { setGpsStatus('error'); return; }
    setGpsStatus('loading');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGpsCoords({ lat: pos.coords.latitude.toFixed(5), lng: pos.coords.longitude.toFixed(5) });
        setGpsStatus('ok');
      },
      () => setGpsStatus('error'),
      { timeout: 10000 }
    );
  }

  const hasLocation = gpsStatus === 'ok' || manualAddr.trim().length > 3;
  const canContinue = mode === 'delivery' ? (hasLocation && !!payMethod) : true;

  const payOptions = [
    {
      id: 'cash',
      icon: <Banknote className="w-6 h-6" />,
      labelEn: 'Cash on Delivery',
      labelAr: 'الدفع عند الاستلام',
      descEn: 'Pay the driver when order arrives',
      descAr: 'ادفع للسائق عند وصول الطلب',
      bg: 'bg-emerald-600',
    },
    {
      id: 'card',
      icon: <Link className="w-6 h-6" />,
      labelEn: 'Pay by Card',
      labelAr: 'الدفع ببطاقة',
      descEn: 'Payment link sent to your phone',
      descAr: 'رابط دفع يُرسل لهاتفك',
      bg: 'bg-indigo-600',
    },
  ];

  return (
    <div className="flex flex-col h-full" dir={isAr ? 'rtl' : 'ltr'}>
      <StepHeader
        title={mode === 'delivery'
          ? (isAr ? 'الموقع وطريقة الدفع' : 'Location & Payment')
          : (isAr ? 'تفاصيل الطلب' : 'Order Details')}
        onBack={onBack}
        isAr={isAr}
      />
      <StepBar current="details" isAr={isAr} />

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

        {/* Summary pill */}
        <div className={`flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3
          ${isAr ? 'flex-row-reverse' : ''}`}>
          <span className="text-2xl">{BRANCHES[branch].emoji}</span>
          <div className={`flex-1 min-w-0 ${isAr ? 'text-right' : ''}`}>
            <p className="text-xs text-gray-400 font-medium">
              {mode === 'delivery' ? (isAr ? 'توصيل من' : 'Delivery from') :
               mode === 'takeaway' ? (isAr ? 'استلام من' : 'Pick up from') :
               (isAr ? 'جلوس في' : 'Dine In at')}
            </p>
            <p className="font-bold text-charcoal text-sm">
              {isAr ? BRANCHES[branch].nameAr : BRANCHES[branch].nameEn}
            </p>
          </div>
          {mode === 'delivery' && (
            <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200
                             px-2 py-1 rounded-full shrink-0">
              +{deliveryFee} QAR
            </span>
          )}
        </div>

        {/* ── DELIVERY: location + payment ── */}
        {mode === 'delivery' && (
          <>
            {/* Location */}
            <div>
              <p className={`text-sm font-bold text-charcoal mb-3 ${isAr ? 'text-right' : ''}`}>
                📍 {isAr ? 'موقع التوصيل' : 'Delivery Location'}
              </p>

              {/* GPS button */}
              <button
                onClick={detectGPS}
                disabled={gpsStatus === 'loading'}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all mb-3
                  ${gpsStatus === 'ok'
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-200 hover:border-brand-300'}
                  ${isAr ? 'flex-row-reverse' : ''}`}
              >
                <Navigation className={`w-5 h-5 shrink-0 ${gpsStatus === 'ok' ? 'text-green-600' : 'text-gray-400'}`} />
                <div className={`flex-1 min-w-0 ${isAr ? 'text-right' : ''}`}>
                  <p className={`text-sm font-semibold ${gpsStatus === 'ok' ? 'text-green-700' : 'text-charcoal'}`}>
                    {gpsStatus === 'loading' ? (isAr ? 'جارٍ التحديد…' : 'Detecting…') :
                     gpsStatus === 'ok'      ? (isAr ? 'تم تحديد موقعك ✓' : 'Location detected ✓') :
                     gpsStatus === 'error'   ? (isAr ? 'تعذّر التحديد' : 'Could not detect') :
                     (isAr ? 'استخدام موقعي الحالي' : 'Use my current location')}
                  </p>
                  {gpsStatus === 'ok' && gpsCoords && (
                    <p className="text-xs text-green-600 mt-0.5">{gpsCoords.lat}, {gpsCoords.lng}</p>
                  )}
                  {gpsStatus === 'error' && (
                    <p className="text-xs text-red-400 mt-0.5">
                      {isAr ? 'أدخل العنوان يدوياً' : 'Please enter address manually'}
                    </p>
                  )}
                </div>
                {gpsStatus === 'loading' && (
                  <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin shrink-0" />
                )}
              </button>

              {/* Manual address */}
              <textarea
                value={manualAddr}
                onChange={e => setManualAddr(e.target.value)}
                placeholder={isAr ? 'أو اكتب عنوانك هنا: الشارع، المبنى، المنطقة…' : 'Or type your address: street, building, area…'}
                rows={2}
                dir={isAr ? 'rtl' : 'ltr'}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-charcoal
                           placeholder:text-gray-300 resize-none focus:outline-none
                           focus:ring-2 focus:ring-brand-300 focus:border-transparent"
              />
            </div>

            {/* Payment method */}
            <div>
              <p className={`text-sm font-bold text-charcoal mb-3 ${isAr ? 'text-right' : ''}`}>
                💳 {isAr ? 'طريقة الدفع' : 'Payment Method'}
              </p>
              <div className="space-y-3">
                {payOptions.map(opt => {
                  const active = payMethod === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setPayMethod(opt.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all
                        ${active ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}
                        ${isAr ? 'flex-row-reverse text-right' : 'text-left'}`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors
                        ${active ? opt.bg + ' text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {opt.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm ${active ? 'text-brand-700' : 'text-charcoal'}`}>
                          {isAr ? opt.labelAr : opt.labelEn}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">{isAr ? opt.descAr : opt.descEn}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                        ${active ? 'border-brand-500 bg-brand-500' : 'border-gray-300'}`}>
                        {active && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Total with delivery fee */}
            <div className={`flex items-center justify-between bg-orange-50 border border-orange-200
              rounded-2xl px-4 py-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className={isAr ? 'text-right' : ''}>
                <p className="text-xs text-gray-400">{isAr ? 'المجموع + رسوم التوصيل' : 'Subtotal + Delivery'}</p>
                <p className="text-xs text-gray-400">{subtotal.toFixed(2)} + {deliveryFee} QAR</p>
              </div>
              <p className="text-lg font-bold text-brand-600">{total.toFixed(2)} QAR</p>
            </div>
          </>
        )}

        {/* ── TAKEAWAY / DINE IN: pay on counter ── */}
        {(mode === 'takeaway' || mode === 'dinein') && (
          <>
            <div className={`flex items-center gap-4 bg-emerald-50 border border-emerald-200
              rounded-2xl px-5 py-4 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
              <span className="text-4xl shrink-0">🧾</span>
              <div>
                <p className="font-bold text-emerald-800 text-sm">
                  {isAr ? 'الدفع على الكاشير' : 'Payment on Counter'}
                </p>
                <p className="text-emerald-700 text-xs mt-0.5">
                  {isAr
                    ? 'سيتم تحضير طلبك وتسجيله عند الكاشير. يُمكنك الدفع نقداً أو ببطاقة في الفرع.'
                    : 'Your order will be prepared. Pay with cash or card at the counter.'}
                </p>
              </div>
            </div>

            {/* Total */}
            <div className={`flex items-center justify-between bg-gray-50 border border-gray-200
              rounded-2xl px-4 py-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <p className="font-bold text-charcoal">{isAr ? 'الإجمالي' : 'Total'}</p>
              <p className="text-lg font-bold text-brand-600">{total.toFixed(2)} QAR</p>
            </div>
          </>
        )}
      </div>

      <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={() => canContinue && onNext({ payMethod, gpsCoords, manualAddr, total })}
          disabled={!canContinue}
          className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-gray-200 disabled:text-gray-400
                     text-white font-bold rounded-2xl py-4 transition-all active:scale-95"
        >
          {isAr ? 'التالي' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

// ─── STEP 4: Contact details ──────────────────────────────────────────────────
function ContactStep({ total, mode, branch, payMethod, onBack, onNext, isAr }) {
  const [name,  setName]  = useState('');
  const [phone, setPhone] = useState('');

  const canSubmit = name.trim().length > 1 && phone.replace(/\D/g, '').length >= 8;

  return (
    <div className="flex flex-col h-full" dir={isAr ? 'rtl' : 'ltr'}>
      <StepHeader title={isAr ? 'بياناتك' : 'Your Details'} onBack={onBack} isAr={isAr} />
      <StepBar current="contact" isAr={isAr} />

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        <p className={`text-sm text-gray-400 ${isAr ? 'text-right' : ''}`}>
          {isAr
            ? 'نحتاج إلى اسمك ورقم هاتفك لتأكيد الطلب.'
            : 'We need your name and phone number to confirm the order.'}
        </p>

        {/* Name */}
        <div>
          <label className={`flex items-center gap-2 text-sm font-semibold text-charcoal mb-2
            ${isAr ? 'flex-row-reverse' : ''}`}>
            <User className="w-4 h-4 text-brand-500" />
            {isAr ? 'الاسم' : 'Name'}
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={isAr ? 'اسمك الكامل' : 'Your full name'}
            dir={isAr ? 'rtl' : 'ltr'}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-charcoal
                       placeholder:text-gray-300 focus:outline-none
                       focus:ring-2 focus:ring-brand-300 focus:border-transparent"
          />
        </div>

        {/* Phone */}
        <div>
          <label className={`flex items-center gap-2 text-sm font-semibold text-charcoal mb-2
            ${isAr ? 'flex-row-reverse' : ''}`}>
            <Phone className="w-4 h-4 text-brand-500" />
            {isAr ? 'رقم الهاتف' : 'Phone Number'}
          </label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+974 xxxx xxxx"
            dir="ltr"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-charcoal
                       placeholder:text-gray-300 focus:outline-none
                       focus:ring-2 focus:ring-brand-300 focus:border-transparent"
          />
          {payMethod === 'card' && (
            <p className={`text-xs text-indigo-500 mt-1.5 ${isAr ? 'text-right' : ''}`}>
              💳 {isAr
                ? 'سيصلك رابط الدفع على هذا الرقم'
                : 'Payment link will be sent to this number'}
            </p>
          )}
        </div>

        {/* Order summary */}
        <div className={`bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2`}>
          <p className={`text-xs font-bold text-charcoal uppercase tracking-wide ${isAr ? 'text-right' : ''}`}>
            {isAr ? 'ملخص الطلب' : 'Order Summary'}
          </p>
          <div className={`flex justify-between text-sm ${isAr ? 'flex-row-reverse' : ''}`}>
            <span className="text-gray-500">
              {mode === 'delivery' ? (isAr ? 'توصيل' : 'Delivery') :
               mode === 'takeaway' ? (isAr ? 'استلام' : 'Take Away') :
               (isAr ? 'جلوس' : 'Dine In')}
            </span>
            <span className="font-semibold text-charcoal">
              {isAr ? BRANCHES[branch].nameAr : BRANCHES[branch].nameEn}
            </span>
          </div>
          {payMethod && (
            <div className={`flex justify-between text-sm ${isAr ? 'flex-row-reverse' : ''}`}>
              <span className="text-gray-500">{isAr ? 'الدفع' : 'Payment'}</span>
              <span className="font-semibold text-charcoal">
                {payMethod === 'cash'
                  ? (isAr ? 'كاش' : 'Cash')
                  : (isAr ? 'بطاقة' : 'Card')}
              </span>
            </div>
          )}
          <div className={`flex justify-between font-bold text-charcoal border-t border-gray-200 pt-2
            ${isAr ? 'flex-row-reverse' : ''}`}>
            <span>{isAr ? 'الإجمالي' : 'Total'}</span>
            <span className="text-brand-600">{total.toFixed(2)} QAR</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={() => canSubmit && onNext({ name: name.trim(), phone: phone.trim() })}
          disabled={!canSubmit}
          className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-gray-200 disabled:text-gray-400
                     text-white font-bold rounded-2xl py-4 transition-all active:scale-95"
        >
          {isAr ? 'تأكيد الطلب' : 'Confirm Order'}
        </button>
      </div>
    </div>
  );
}

// ─── DONE: Confirmation screen ────────────────────────────────────────────────
function DoneStep({ name, mode, branch, payMethod, total, onClose, isAr }) {
  return (
    <div className="flex flex-col h-full overflow-y-auto px-6 py-8 text-center"
         dir={isAr ? 'rtl' : 'ltr'}>
      {/* Big checkmark */}
      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
        <Check className="w-10 h-10 text-white" strokeWidth={3} />
      </div>

      <h2 className="font-bold text-charcoal text-xl mb-1">
        {isAr ? `شكراً ${name}!` : `Thank you, ${name}!`}
      </h2>
      <p className="text-gray-400 text-sm mb-5">
        {isAr ? 'تم استلام طلبك بنجاح' : 'Your order has been placed successfully'}
      </p>

      {/* Detail pills */}
      <div className="space-y-2.5 w-full mb-6 text-left">
        <div className={`flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3
          ${isAr ? 'flex-row-reverse text-right' : ''}`}>
          <span className="text-xl shrink-0">{BRANCHES[branch].emoji}</span>
          <div className={isAr ? 'text-right' : ''}>
            <p className="text-xs text-gray-400">
              {mode === 'delivery' ? (isAr ? 'توصيل من' : 'Delivery from') :
               mode === 'takeaway' ? (isAr ? 'استلام من' : 'Pick up from') :
               (isAr ? 'جلوس في' : 'Dine In at')}
            </p>
            <p className="font-bold text-charcoal text-sm">
              {isAr ? BRANCHES[branch].nameAr : BRANCHES[branch].nameEn}
            </p>
          </div>
        </div>

        {payMethod === 'card' && (
          <div className={`flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3
            ${isAr ? 'flex-row-reverse text-right' : ''}`}>
            <Link className="w-5 h-5 text-indigo-600 shrink-0" />
            <p className="text-indigo-700 text-sm font-medium">
              {isAr
                ? 'سيصلك رابط الدفع على هاتفك قريباً'
                : 'A payment link will be sent to your phone shortly'}
            </p>
          </div>
        )}

        <div className={`flex items-center justify-between bg-brand-50 border border-brand-100
          rounded-2xl px-4 py-3 ${isAr ? 'flex-row-reverse' : ''}`}>
          <span className="text-sm font-bold text-charcoal">{isAr ? 'الإجمالي' : 'Total'}</span>
          <span className="text-lg font-bold text-brand-600">{total.toFixed(2)} QAR</span>
        </div>
      </div>

      {/* Back to menu */}
      <button
        onClick={onClose}
        className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl py-3.5 transition-all active:scale-95 mb-3"
      >
        {isAr ? 'العودة إلى القائمة' : 'Back to Menu'}
      </button>

      {/* Google Review */}
      <a
        href="https://maps.app.goo.gl/8izX6iVMN6B7XakF9"
        target="_blank"
        rel="noopener noreferrer"
        className={`w-full flex items-center justify-center gap-2 border-2 border-yellow-300
                    bg-yellow-50 hover:bg-yellow-100 text-yellow-800 font-bold rounded-2xl py-3.5
                    transition-all active:scale-95 mb-3 ${isAr ? 'flex-row-reverse' : ''}`}
      >
        <Star className="w-5 h-5 text-yellow-500 fill-yellow-400 flex-shrink-0" />
        {isAr ? 'قيّمنا على Google' : 'Review us on Google'}
      </a>

      {/* Social — Instagram */}
      <a
        href="https://www.instagram.com/pasta.alfreej.qatar/"
        target="_blank"
        rel="noopener noreferrer"
        className={`w-full flex items-center justify-center gap-2 border-2 border-pink-200
                    bg-gradient-to-r from-purple-50 to-pink-50
                    hover:from-purple-100 hover:to-pink-100
                    text-pink-700 font-bold rounded-2xl py-3.5
                    transition-all active:scale-95 ${isAr ? 'flex-row-reverse' : ''}`}
      >
        <InstagramIcon className="w-5 h-5 flex-shrink-0" />
        {isAr ? 'تابعنا على Instagram' : 'Follow us on Instagram'}
      </a>
    </div>
  );
}

// ─── Main CartDrawer ──────────────────────────────────────────────────────────
export default function CartDrawer() {
  const { items, subtotal, itemCount, dispatch: cartDispatch } = useCart();
  const { cartOpen, setCartOpen, setSelectedBranch } = useApp();
  const { lang, tr, toggle } = useLang();
  const isAr = lang === 'ar';

  // Wizard state
  const [step,      setStep]      = useState('cart');
  const [mode,      setMode]      = useState(null);
  const [branch,    setBranch]    = useState(null);
  const [details,   setDetails]   = useState(null);   // { payMethod, gpsCoords, manualAddr, total }
  const [contact,   setContact]   = useState(null);   // { name, phone }

  if (!cartOpen) return null;

  function close() {
    setCartOpen(false);
    // Reset wizard on close
    setTimeout(() => {
      setStep('cart');
      setMode(null); setBranch(null); setDetails(null); setContact(null);
    }, 300);
  }

  async function handleDone(contactData) {
    setContact(contactData);

    const order = {
      id:          'ORD-' + Date.now(),
      timestamp:   new Date().toISOString(),
      status:      'new',
      branch:      branch,
      mode:        mode,
      contact:     contactData,
      payMethod:   details?.payMethod,
      gpsCoords:   details?.gpsCoords || null,
      manualAddr:  details?.manualAddr || null,
      items:       items.map(entry => ({
        cartId:      entry.cartId,
        nameEn:      entry.item.nameEn,
        nameAr:      entry.item.nameAr,
        size:        entry.size,
        addons:      entry.addons,
        mealUpsell:  entry.mealUpsell,
        instructions:entry.instructions,
        qty:         entry.qty,
      })),
      subtotal,
      deliveryFee: mode === 'delivery' ? 10 : 0,
      total:       mode === 'delivery' ? subtotal + 10 : subtotal,
    };
    try {
      await addOrder(order);
    } catch (e) {
      console.error('Order save failed', e);
    }
    cartDispatch({ type: 'CLEAR_CART' });
    setStep('done');
  }

  // Final total (computed at end for DoneStep)
  const finalTotal = details?.total ?? subtotal;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={step === 'done' ? close : undefined} />

      <div
        className={`absolute inset-y-0 flex flex-col bg-white shadow-2xl w-full sm:w-[26rem]
          ${isAr ? 'left-0' : 'right-0'}`}
        dir={isAr ? 'rtl' : 'ltr'}
      >

        {/* ── CART VIEW ── */}
        {step === 'cart' && (
          <>
            <div className={`flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 flex-shrink-0
              ${isAr ? 'flex-row-reverse' : ''}`}>
              <h2 className="font-bold text-charcoal text-lg flex-1 min-w-0">
                {tr.cart.title}
                {itemCount > 0 && (
                  <span className="ms-2 text-brand-500 font-normal text-base">({itemCount})</span>
                )}
              </h2>
              {/* Language toggle — always visible inside cart */}
              <button
                onClick={toggle}
                className="flex-shrink-0 bg-gray-100 hover:bg-gray-200 border border-gray-200
                           rounded-full px-3 py-1.5 text-xs font-bold text-charcoal transition-colors"
              >
                {isAr ? 'EN' : 'ع'}
              </button>
              <button onClick={close} className="p-2 rounded-full hover:bg-gray-100 flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                  <span className="text-6xl">🍝</span>
                  <p className="text-gray-400 text-sm">
                    {tr.cart.empty}<br />{tr.cart.emptyHint}
                  </p>
                </div>
              ) : (
                items.map(entry => (
                  <CartItem key={entry.cartId} entry={entry} isAr={isAr} />
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-gray-100 px-5 py-4 space-y-3 flex-shrink-0">
                <div className={`flex justify-between font-bold text-charcoal ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span>{tr.cart.total}</span>
                  <span className="text-brand-600">{subtotal.toFixed(2)} QAR</span>
                </div>
                <button
                  onClick={() => setStep('mode')}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl py-4 transition-all active:scale-95"
                >
                  {tr.cart.checkout} · {subtotal.toFixed(2)} QAR
                </button>
              </div>
            )}
          </>
        )}

        {/* ── STEP 1: Mode ── */}
        {step === 'mode' && (
          <ModeStep
            onBack={() => setStep('cart')}
            onNext={(m) => { setMode(m); setStep('branch'); }}
            isAr={isAr}
          />
        )}

        {/* ── STEP 2: Branch ── */}
        {step === 'branch' && (
          <BranchStep
            mode={mode}
            onBack={() => setStep('mode')}
            onNext={(b) => { setBranch(b); setSelectedBranch(b); setStep('details'); }}
            isAr={isAr}
          />
        )}

        {/* ── STEP 3: Details ── */}
        {step === 'details' && (
          <DetailsStep
            mode={mode}
            branch={branch}
            subtotal={subtotal}
            onBack={() => setStep('branch')}
            onNext={(d) => { setDetails(d); setStep('contact'); }}
            isAr={isAr}
          />
        )}

        {/* ── STEP 4: Contact ── */}
        {step === 'contact' && (
          <ContactStep
            total={details?.total ?? subtotal}
            mode={mode}
            branch={branch}
            payMethod={details?.payMethod}
            onBack={() => setStep('details')}
            onNext={handleDone}
            isAr={isAr}
          />
        )}

        {/* ── DONE ── */}
        {step === 'done' && contact && (
          <DoneStep
            name={contact.name}
            mode={mode}
            branch={branch}
            payMethod={details?.payMethod}
            total={finalTotal}
            onClose={() => {
              cartDispatch({ type: 'CLEAR_CART' });
              close();
            }}
            isAr={isAr}
          />
        )}
      </div>
    </div>
  );
}
