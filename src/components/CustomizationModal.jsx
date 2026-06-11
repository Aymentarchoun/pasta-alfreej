import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check, Flame, Leaf, Sparkles, Tag, ChevronRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLang } from '../contexts/LangContext';
import { mealUpsell, menuItems, globalAddons, pizzaAddons, composeAddons, drinkAddons } from '../data/menuData';
import { resolveItemAddons } from '../admin/adminStore';

const ALL_ADDON_POOL = [
  ...globalAddons, ...pizzaAddons, ...composeAddons, ...drinkAddons,
].filter((a, i, arr) => arr.findIndex(x => x.id === a.id) === i);

// ─── Cross-sell strip shown after adding ──────────────────────────────────────
function YouMayLike({ relatedIds, onSelectItem, lang, tr }) {
  const isAr = lang === 'ar';
  const related = (relatedIds || [])
    .map(id => menuItems.find(m => m.id === id))
    .filter(Boolean)
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <div className={`px-4 pt-3 pb-2 border-t border-gray-100 bg-gray-50 ${isAr ? 'text-right' : ''}`}>
      <p className="text-[10px] font-bold text-charcoal uppercase tracking-widest mb-2.5">
        {tr.modal.youMayLike}
      </p>
      <div className={`flex gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
        {related.map(item => {
          const name  = isAr ? item.nameAr : item.nameEn;
          const price = item.sizes[0].price;
          return (
            <button
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="flex-1 flex flex-col items-center gap-1.5 bg-white rounded-2xl p-2
                         border border-gray-100 hover:border-brand-300 hover:shadow-md
                         active:scale-[0.97] transition-all min-w-0"
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                <img src={item.image} alt={name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <p className="text-[10px] font-semibold text-charcoal text-center leading-tight line-clamp-2"
                 style={{ maxWidth: 72 }}>
                {name}
              </p>
              <span className="text-[10px] font-bold text-brand-600">{price} QAR</span>
              <div className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center mt-0.5">
                <Plus className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Pasta Shape picker (Step 1 for Compose) ─────────────────────────────────
function PastaShapePicker({ shapes, selected, onSelect, isAr }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {shapes.map(shape => {
        const active = selected?.id === shape.id;
        const label  = isAr ? shape.labelAr : shape.labelEn;
        return (
          <button
            key={shape.id}
            onClick={() => onSelect(shape)}
            className={`flex flex-col items-center gap-1 rounded-xl p-1.5 border-2 transition-all
              ${active
                ? 'border-brand-500 bg-brand-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
          >
            {/* Pasta photo */}
            <div className={`w-full rounded-lg overflow-hidden flex-shrink-0 border
              ${active ? 'ring-2 ring-brand-400' : 'border-gray-100'}`}
              style={{ aspectRatio: '1/1' }}
            >
              {shape.image ? (
                <img src={shape.image} alt={label} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-lg">🍝</div>
              )}
            </div>
            {/* Checkmark overlay */}
            {active && (
              <div className="absolute" style={{ marginTop: -4 }}>
                <div className="w-4 h-4 bg-brand-500 rounded-full flex items-center justify-center shadow">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
            )}
            <span className={`text-[9px] sm:text-[10px] font-semibold leading-tight text-center mt-0.5
              ${active ? 'text-brand-700' : 'text-gray-600'}`}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Sauce Circle picker (Step 2 for Compose) ────────────────────────────────
function SaucePicker({ sauces, selected, onSelect, isAr }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {sauces.map(sauce => {
        const active = selected?.id === sauce.id;
        const label  = isAr ? sauce.labelAr : sauce.labelEn;
        return (
          <button
            key={sauce.id}
            onClick={() => onSelect(sauce)}
            className={`flex flex-col items-center gap-1.5 rounded-xl p-2 border-2 transition-all
              ${active
                ? 'border-brand-500 bg-brand-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
          >
            {/* Colored circle */}
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                ${active ? 'scale-110 shadow-lg' : ''}
                ${sauce.border ? 'border-2 border-gray-300' : ''}`}
              style={{ backgroundColor: sauce.color }}
            >
              {active && (
                <Check
                  className="w-4 h-4"
                  style={{ color: sauce.border ? '#374151' : '#fff' }}
                  strokeWidth={3}
                />
              )}
            </div>
            <span className={`text-[9px] sm:text-[10px] font-semibold text-center leading-tight
              ${active ? 'text-brand-700' : 'text-gray-600'}`}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function CustomizationModal({ item: initialItem, onClose }) {
  const { dispatch } = useCart();
  const { lang, tr } = useLang();
  const isAr = lang === 'ar';

  const [item,          setItem]          = useState(initialItem);
  const [transition,    setTransition]    = useState(false);
  const [selectedSize,  setSelectedSize]  = useState(item.sizes[0]);
  const [selectedSauce, setSelectedSauce] = useState(item.sauces ? item.sauces[0] : null);
  const [selectedAddons,setSelectedAddons]= useState([]);
  const [withMeal,      setWithMeal]      = useState(false);
  const [instructions,  setInstructions]  = useState('');
  const [qty,           setQty]           = useState(1);
  const [imgLoaded,     setImgLoaded]     = useState(false);
  const [added,         setAdded]         = useState(false);

  const name    = isAr ? item.nameAr   : item.nameEn;
  const desc    = isAr ? item.descriptionAr : item.descriptionEn;
  const isOffer   = item.category === 'offers';
  const isCompose = !!item.sauces;   // Compose Your Meal has sauces array
  const effectiveAddons = resolveItemAddons(item, ALL_ADDON_POOL);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Switch to a related item (from cross-sell strip)
  function switchToRelated(newItem) {
    setTransition(true);
    setTimeout(() => {
      setItem(newItem);
      setSelectedSize(newItem.sizes[0]);
      setSelectedSauce(newItem.sauces ? newItem.sauces[0] : null);
      setSelectedAddons([]);
      setWithMeal(false);
      setInstructions('');
      setQty(1);
      setImgLoaded(false);
      setAdded(false);
      setTransition(false);
    }, 180);
  }

  function toggleAddon(addon) {
    setSelectedAddons(prev =>
      prev.find(a => a.id === addon.id)
        ? prev.filter(a => a.id !== addon.id)
        : [...prev, addon]
    );
  }

  const addonsTotal = selectedAddons.reduce((s, a) => s + a.price, 0);
  const mealExtra   = withMeal ? mealUpsell.price : 0;
  const lineTotal   = (selectedSize.price + addonsTotal + mealExtra) * qty;

  function handleAdd() {
    dispatch({
      type: 'ADD_ITEM',
      payload: { item, size: selectedSize, sauce: selectedSauce, addons: selectedAddons, mealUpsell: withMeal, instructions, qty },
    });
    setAdded(true);
  }

  const addonLabel = (a) => isAr ? a.labelAr : a.labelEn;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className={`relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg
                    max-h-[94vh] flex flex-col overflow-hidden animate-slide-up
                    transition-opacity duration-200 ${transition ? 'opacity-0' : 'opacity-100'}`}
      >
        {/* ── Hero image — portrait 3:4 ────────────────────────────────────── */}
        <div className="relative w-full flex-shrink-0 bg-gray-100 overflow-hidden"
             style={{ aspectRatio: '3 / 4', maxHeight: '62vh' }}>
          {!imgLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
          )}
          <img
            src={item.image}
            alt={name}
            onLoad={() => setImgLoaded(true)}
            style={{ opacity: imgLoaded ? 1 : 0 }}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            {isOffer && (
              <span className="flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                <Tag className="w-3 h-3" /> {isAr ? 'عرض' : 'OFFER'}
              </span>
            )}
            {item.badge && !isOffer && (
              <span className="flex items-center gap-1 bg-brand-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {item.badge}
              </span>
            )}
            {item.isNew && (
              <span className="flex items-center gap-1 bg-charcoal/80 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                <Sparkles className="w-3 h-3" /> {isAr ? 'جديد' : 'New'}
              </span>
            )}
            {item.isSpicy && (
              <span className="flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                <Flame className="w-3 h-3" /> {isAr ? 'حار' : 'Spicy'}
              </span>
            )}
            {item.isVeg && (
              <span className="flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                <Leaf className="w-3 h-3" /> {isAr ? 'نباتي' : 'Veg'}
              </span>
            )}
          </div>

          {/* Close */}
          <button onClick={onClose}
                  className="absolute top-3 right-3 bg-white/90 rounded-full p-2 shadow-md">
            <X className="w-5 h-5 text-charcoal" />
          </button>

          {/* Title overlay at bottom of image */}
          <div className={`absolute bottom-0 inset-x-0 px-4 pb-3 pt-6
            bg-gradient-to-t from-black/60 to-transparent ${isAr ? 'text-right' : ''}`}>
            <h2 className="font-display font-bold text-white text-lg leading-tight drop-shadow">{name}</h2>
          </div>
        </div>

        {/* Scrollable content */}
        <div className={`flex-1 overflow-y-auto px-5 py-4 ${isAr ? 'text-right' : ''}`}>

          {/* Description */}
          <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>

          {/* Offer savings banner */}
          {isOffer && item.originalPrice && (
            <div className="mt-3 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              <span className="text-gray-400 text-sm line-through">{item.originalPrice} QAR</span>
              <span className="text-red-600 font-bold text-sm">→</span>
              <span className="text-red-600 font-bold">{item.sizes[0].price} QAR</span>
              <span className="ms-auto text-yellow-600 text-xs font-bold">
                {isAr ? item.savingAr : item.savingEn}
              </span>
            </div>
          )}

          {/* ── COMPOSE: Step 1 — Pasta Shape ───────────────────────────── */}
          {isCompose ? (
            <>
              {/* Step 1 */}
              <div className="mt-5">
                <div className={`flex items-center gap-2 mb-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs font-bold
                                   flex items-center justify-center flex-shrink-0">1</span>
                  <h3 className="text-sm font-bold text-charcoal">
                    {isAr ? 'اختر شكل الباستا' : 'Choose Pasta Shape'}
                  </h3>
                  <span className="ms-auto text-xs font-bold text-brand-600">32 QAR</span>
                </div>
                <PastaShapePicker
                  shapes={item.sizes}
                  selected={selectedSize}
                  onSelect={setSelectedSize}
                  isAr={isAr}
                />
              </div>

              {/* Step 2 — Sauce */}
              <div className="mt-6">
                <div className={`flex items-center gap-2 mb-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs font-bold
                                   flex items-center justify-center flex-shrink-0">2</span>
                  <h3 className="text-sm font-bold text-charcoal">
                    {isAr ? 'اختر الصوص' : 'Choose Your Sauce'}
                  </h3>
                </div>
                <SaucePicker
                  sauces={item.sauces}
                  selected={selectedSauce}
                  onSelect={setSelectedSauce}
                  isAr={isAr}
                />
              </div>

              {/* Step 3 — Extras */}
              {effectiveAddons.length > 0 && (
                <div className="mt-6">
                  <div className={`flex items-center gap-2 mb-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs font-bold
                                     flex items-center justify-center flex-shrink-0">3</span>
                    <h3 className="text-sm font-bold text-charcoal">
                      {isAr ? 'إضافات' : 'Extras'}{' '}
                      <span className="text-gray-400 font-normal text-xs">
                        ({isAr ? 'اختياري' : 'optional'})
                      </span>
                    </h3>
                  </div>
                  <div className="flex flex-col gap-2">
                    {effectiveAddons.map(addon => {
                      const active = !!selectedAddons.find(a => a.id === addon.id);
                      return (
                        <button
                          key={addon.id}
                          onClick={() => toggleAddon(addon)}
                          className={`flex items-center justify-between px-4 py-2.5 rounded-xl border-2 transition-all text-sm
                            ${active ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-4 h-4 rounded flex items-center justify-center
                              ${active ? 'bg-brand-500' : 'bg-white border border-gray-300'}`}>
                              {active && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className={active ? 'text-brand-700 font-medium' : 'text-charcoal'}>
                              {addonLabel(addon)}
                            </span>
                          </div>
                          <span className={`font-semibold ${active ? 'text-brand-600' : 'text-gray-400'}`}>
                            +{addon.price} QAR
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* ── REGULAR: Size ─────────────────────────────────────────── */}
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-charcoal mb-3">{tr.modal.size}</h3>
                <div className="flex flex-col gap-2">
                  {item.sizes.map(size => {
                    const active = selectedSize.id === size.id;
                    return (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-sm
                          ${active ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                            ${active ? 'border-brand-500' : 'border-gray-300'}`}>
                            {active && <div className="w-2 h-2 rounded-full bg-brand-500" />}
                          </div>
                          <span className={`font-medium ${active ? 'text-brand-700' : 'text-charcoal'}`}>
                            {isAr ? size.labelAr : size.labelEn}
                          </span>
                        </div>
                        <span className={`font-bold ${active ? 'text-brand-600' : 'text-gray-500'}`}>
                          {size.price} QAR
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── REGULAR: Add-ons ──────────────────────────────────────── */}
              {effectiveAddons.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-sm font-semibold text-charcoal mb-3">
                    {tr.modal.extras}{' '}
                    <span className="text-gray-400 font-normal">({tr.modal.optional})</span>
                  </h3>
                  <div className="flex flex-col gap-2">
                    {effectiveAddons.map(addon => {
                      const active = !!selectedAddons.find(a => a.id === addon.id);
                      return (
                        <button
                          key={addon.id}
                          onClick={() => toggleAddon(addon)}
                          className={`flex items-center justify-between px-4 py-2.5 rounded-xl border-2 transition-all text-sm
                            ${active ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-4 h-4 rounded flex items-center justify-center
                              ${active ? 'bg-brand-500' : 'bg-white border border-gray-300'}`}>
                              {active && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className={active ? 'text-brand-700 font-medium' : 'text-charcoal'}>
                              {addonLabel(addon)}
                            </span>
                          </div>
                          <span className={`font-semibold ${active ? 'text-brand-600' : 'text-gray-400'}`}>
                            {addon.price === 0 ? (isAr ? 'مجاني' : 'Free') : `+${addon.price} QAR`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Make it a Meal ─────────────────────────────────────────────── */}
          {item.hasMealUpsell && (
            <button
              onClick={() => setWithMeal(v => !v)}
              className={`mt-5 w-full flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all
                ${withMeal
                  ? 'border-brand-500 bg-gradient-to-r from-brand-50 to-orange-50'
                  : 'border-dashed border-gray-300 hover:border-brand-300'
                }`}
            >
              <div className={isAr ? 'text-right' : ''}>
                <p className={`font-semibold text-sm ${withMeal ? 'text-brand-700' : 'text-charcoal'}`}>
                  🍽 {isAr ? mealUpsell.labelAr : mealUpsell.labelEn}
                </p>
                <p className="text-gray-400 text-xs">{isAr ? mealUpsell.descAr : mealUpsell.descEn}</p>
              </div>
              <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <span className={`font-bold text-sm ${withMeal ? 'text-brand-600' : 'text-gray-400'}`}>
                  +{mealUpsell.price} QAR
                </span>
                <div className={`w-5 h-5 rounded flex items-center justify-center
                  ${withMeal ? 'bg-brand-500' : 'bg-white border border-gray-300'}`}>
                  {withMeal && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
            </button>
          )}

          {/* ── Special Instructions ──────────────────────────────────────── */}
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-charcoal mb-2">{tr.modal.instructions}</h3>
            <textarea
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder={tr.modal.instructionsPlaceholder}
              rows={2}
              dir={isAr ? 'rtl' : 'ltr'}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-charcoal
                         placeholder:text-gray-300 resize-none focus:outline-none
                         focus:ring-2 focus:ring-brand-300 focus:border-transparent"
            />
          </div>

          {/* ── Qty + Add button ──────────────────────────────────────────── */}
          <div className={`mt-5 mb-2 flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold text-charcoal text-base min-w-[1.5rem] text-center">{qty}</span>
              <button
                onClick={() => setQty(q => q + 1)}
                className="w-8 h-8 rounded-lg bg-brand-500 shadow-sm flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={added}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3
                         font-bold text-sm text-white transition-all active:scale-95
                         ${added ? 'bg-green-500' : 'bg-brand-500 hover:bg-brand-600'}`}
            >
              {added ? (
                <><Check className="w-4 h-4" /> {tr.modal.added}</>
              ) : (
                `${tr.modal.addToOrder} · ${lineTotal.toFixed(2)} QAR`
              )}
            </button>
          </div>
        </div>

        {/* ── Cross-sell + action bar — only after adding ──────────────────── */}
        {added && (
          <>
            <YouMayLike
              relatedIds={item.related}
              onSelectItem={switchToRelated}
              lang={lang}
              tr={tr}
            />
            <div className={`px-5 py-4 bg-gray-50 border-t border-gray-100
                             flex justify-between items-center gap-3`}>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white
                           text-gray-500 font-semibold text-sm hover:bg-gray-100 transition-colors"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
              <button
                onClick={onClose}
                className={`flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-brand-500 text-white
                            font-bold text-sm hover:bg-brand-600 transition-colors ${isAr ? 'flex-row-reverse' : ''}`}
              >
                {isAr ? 'عرض الطلب' : 'View Order'}
                <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
