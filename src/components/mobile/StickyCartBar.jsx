import React from 'react';
import { ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useApp } from '../../contexts/AppContext';
import { useLang } from '../../contexts/LangContext';

export default function StickyCartBar() {
  const { itemCount, subtotal } = useCart();
  const { setCartOpen } = useApp();
  const { lang, tr } = useLang();
  const isAr = lang === 'ar';

  if (itemCount === 0) return null;

  const Arrow = isAr ? ArrowLeft : ArrowRight;

  // Offset from the sidebar so the bar sits only over the items panel
  // Sidebar width: w-20 = 80px (mobile), sm:w-28 = 112px (sm+)
  const sidebarW = 80; // px — conservative mobile value; sm handled below via class

  return (
    <div
      className="fixed bottom-0 z-30 px-3 pb-3 pointer-events-none sm:pb-4"
      style={isAr
        ? { left: 0, right: sidebarW }   // RTL: sidebar on right
        : { left: sidebarW, right: 0 }   // LTR: sidebar on left
      }
    >
      <button
        onClick={() => setCartOpen(true)}
        className="w-full flex items-center justify-between bg-charcoal text-white rounded-2xl px-4 py-3.5
                   shadow-2xl shadow-black/30 pointer-events-auto active:scale-[0.98] transition-transform"
      >
        <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className="bg-brand-500 rounded-xl p-1.5">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <div className={isAr ? 'text-right' : 'text-left'}>
            <p className="text-[11px] text-white/60 leading-none">{tr.cart.title}</p>
            <p className="text-sm font-semibold leading-tight">
              {itemCount} {itemCount === 1 ? tr.cart.item : tr.cart.items}
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
          <span className="font-bold text-brand-400">{subtotal.toFixed(2)} QAR</span>
          <Arrow className="w-4 h-4 text-white/50" />
        </div>
      </button>
    </div>
  );
}
