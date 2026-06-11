import React, { useState, useEffect } from 'react';
import { Plus, Flame, Leaf, Sparkles } from 'lucide-react';
import { categories as BASE_CATS, menuItems as BASE_ITEMS } from '../data/menuData';
import { getLiveMenu } from '../admin/adminStore';
import { useLang } from '../contexts/LangContext';
import { useApp } from '../contexts/AppContext';
import CustomizationModal from './CustomizationModal';

// ─── Sidebar Category Item ─────────────────────────────────────────────────────
function SidebarItem({ cat, active, onClick, label, items }) {
  const firstItem = (items || []).find(i => i.category === cat.id);

  return (
    <button
      onClick={onClick}
      className={`w-full flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl transition-all
        ${active
          ? 'bg-orange-50 border border-orange-200'
          : 'hover:bg-gray-50 border border-transparent'
        }`}
    >
      {/* Circular thumbnail */}
      <div className={`rounded-full overflow-hidden flex-shrink-0 border-2 transition-colors
        w-13 h-13 sm:w-16 sm:h-16
        ${active ? 'border-brand-500' : 'border-gray-200'}`}
      >
        {firstItem?.image ? (
          <img src={firstItem.image} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xl">
            {cat.emoji}
          </div>
        )}
      </div>

      {/* Label */}
      <span
        className={`leading-tight text-center font-semibold
          text-[10px] sm:text-xs
          ${active ? 'text-brand-600' : 'text-gray-500'}`}
        style={{ maxWidth: 80, wordBreak: 'break-word' }}
      >
        {label}
      </span>
    </button>
  );
}

// ─── Menu Card ────────────────────────────────────────────────────────────────
function MenuCard({ item, onSelect, lang }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const isAr  = lang === 'ar';
  const name  = isAr ? item.nameAr : item.nameEn;
  const price = item.sizes[0].price;

  return (
    <button
      onClick={() => onSelect(item)}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100
                 shadow-sm hover:shadow-lg hover:-translate-y-0.5
                 active:scale-[0.97] transition-all duration-200 text-left flex flex-col w-full"
    >
      {/* Square image */}
      <div className="relative bg-gray-50 overflow-hidden w-full" style={{ aspectRatio: '1/1' }}>
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
        )}
        <img
          src={item.image}
          alt={name}
          onLoad={() => setImgLoaded(true)}
          style={{ opacity: imgLoaded ? 1 : 0 }}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="lazy"
        />
        {item.badge && (
          <span className="absolute top-1.5 left-1.5 bg-brand-500 text-white
                           text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
        {item.isNew && (
          <span className="absolute top-1.5 right-1.5 bg-charcoal/80 text-white
                           text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full
                           flex items-center gap-0.5">
            <Sparkles className="w-2 h-2" />
            {isAr ? 'جديد' : 'New'}
          </span>
        )}
        <div className="absolute bottom-1.5 left-1.5 flex gap-1">
          {item.isSpicy && (
            <span className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
              <Flame className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
            </span>
          )}
          {item.isVeg && (
            <span className="w-4 h-4 sm:w-5 sm:h-5 bg-green-600 rounded-full flex items-center justify-center shadow-sm">
              <Leaf className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
            </span>
          )}
        </div>
      </div>

      {/* Text info */}
      <div className={`flex-1 flex flex-col px-2 sm:px-3 pt-2 pb-2.5 gap-1 ${isAr ? 'text-right items-end' : ''}`}>
        <h3 className="font-semibold text-charcoal text-xs sm:text-sm leading-tight line-clamp-2">
          {name}
        </h3>
        <div className={`flex items-center justify-between mt-auto pt-1.5 w-full
          ${isAr ? 'flex-row-reverse' : ''}`}>
          <span className={`flex items-baseline gap-1 ${isAr ? 'flex-row-reverse' : ''}`}>
            {item.originalPrice && (
              <span className="text-gray-300 text-[10px] line-through">{item.originalPrice}</span>
            )}
            <span className="font-bold text-charcoal text-xs sm:text-sm">
              {price} <span className="text-gray-400 font-normal text-[10px]">QAR</span>
            </span>
          </span>
          <div className="w-6 h-6 sm:w-7 sm:h-7 bg-brand-500 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
            <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" strokeWidth={3} />
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── MenuScreen ───────────────────────────────────────────────────────────────
export default function MenuScreen() {
  const { lang, tr } = useLang();
  const { selectedBranch } = useApp();
  const isAr = lang === 'ar';
  const [activeCat,    setActiveCat]    = useState('signatures');
  const [selectedItem, setSelectedItem] = useState(null);

  // Live menu — merges base data with admin overrides, filtered by selected branch
  const [liveItems, setLiveItems] = useState(() => getLiveMenu(BASE_ITEMS, BASE_CATS, false, selectedBranch).items);
  const [liveCats,  setLiveCats]  = useState(() => getLiveMenu(BASE_ITEMS, BASE_CATS, false, selectedBranch).cats);

  useEffect(() => {
    function refresh() {
      const { items, cats } = getLiveMenu(BASE_ITEMS, BASE_CATS, false, selectedBranch);
      setLiveItems(items);
      setLiveCats(cats);
    }
    refresh();
    window.addEventListener('pa_menu_update', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('pa_menu_update', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [selectedBranch]);

  const menuItems  = liveItems;
  const categories = liveCats;

  const filtered = menuItems.filter(i => i.category === activeCat);
  const catLabel = (id) => tr.categories[id] || id;

  return (
    <div className="bg-white" style={{ height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>

      {/* ── Dual-scroll body — sidebar and content scroll independently ──── */}
      <div
        className={`flex flex-1 min-h-0 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}
      >
        {/* ── SIDEBAR — scrolls independently ── */}
        <aside
          className={`flex-shrink-0 bg-white overflow-y-auto
            w-20 sm:w-28 ${isAr ? 'border-l border-gray-100' : 'border-r border-gray-100'}`}
          style={{ overscrollBehavior: 'contain' }}
        >
          <div className="py-2 px-1 space-y-0.5">
            {categories.map(cat => (
              <SidebarItem
                key={cat.id}
                cat={cat}
                active={activeCat === cat.id}
                onClick={() => setActiveCat(cat.id)}
                label={catLabel(cat.id)}
                items={menuItems}
              />
            ))}
          </div>
        </aside>

        {/* ── MAIN CONTENT — scrolls independently ── */}
        <main
          className="flex-1 min-w-0 overflow-y-auto"
          style={{ overscrollBehavior: 'contain' }}
        >
          {/* Item grid */}
          <div className="grid grid-cols-2 gap-px bg-gray-100 pt-px">
            {filtered.map(item => (
              <div key={item.id} className="bg-white p-2 sm:p-3">
                <MenuCard item={item} onSelect={setSelectedItem} lang={lang} />
              </div>
            ))}
          </div>

          {/* Blank space below the last section */}
          <div className="h-28" aria-hidden="true" />

          {/* Skyline footer — full-bleed across the whole screen width */}
          <footer
            className={`bg-white pt-6 w-screen ${isAr ? '-mr-20 sm:-mr-28' : '-ml-20 sm:-ml-28'}`}
          >
            <div className="px-4 pb-5 text-center space-y-1">
              <p className="text-brand-600 font-bold text-sm leading-snug" dir="rtl">
                أحسن باستا في قطر و البتزا الإيطالية الأصيلة في مكان واحد
              </p>
              <p className="text-gray-400 text-xs" dir="rtl">
                باستا الفريج — طعم إيطالي بلمسة قطرية
              </p>
              <p className="text-gray-300 text-[10px] pt-1">
                Qatar's finest pasta & authentic Italian pizza · Italian flavor with a Qatari touch
              </p>
            </div>
            <img
              src="/skyline.png"
              alt="Doha Skyline"
              className="w-full object-contain object-bottom"
              style={{ maxHeight: 120 }}
            />
          </footer>
        </main>
      </div>

      {selectedItem && (
        <CustomizationModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
