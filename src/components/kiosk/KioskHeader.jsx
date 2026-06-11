import React from 'react';
import { ShoppingCart, RotateCcw, UtensilsCrossed, ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useApp } from '../../contexts/AppContext';

export default function KioskHeader({ onReset }) {
  const { itemCount, subtotal, dineMode } = useCart();
  const { setCartOpen } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-charcoal text-white px-8 py-4 flex items-center justify-between shadow-2xl">
      {/* Brand */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight leading-none">
          La Pasta <span className="text-brand-400">Alfreej</span>
        </h1>
        <div className="flex items-center gap-2 mt-0.5">
          {dineMode === 'dine-in'
            ? <UtensilsCrossed className="w-3.5 h-3.5 text-brand-400" />
            : <ShoppingBag className="w-3.5 h-3.5 text-brand-400" />
          }
          <span className="text-white/50 text-sm capitalize">{dineMode ?? 'Select mode'}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Reset */}
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-white/40 hover:text-white/80
                     border border-white/10 rounded-xl px-4 py-2.5 text-sm
                     kiosk-touch-target transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Start Over
        </button>

        {/* Cart */}
        <button
          onClick={() => setCartOpen(true)}
          className="relative flex items-center gap-3 bg-brand-500 hover:bg-brand-600
                     rounded-2xl px-6 py-3 kiosk-touch-target transition-colors active:scale-95"
        >
          <ShoppingCart className="w-5 h-5 text-white" />
          <span className="font-bold text-white text-lg">
            {subtotal > 0 ? `${subtotal.toFixed(2)} QAR` : 'Cart'}
          </span>
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full
                             flex items-center justify-center text-white text-xs font-bold">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
