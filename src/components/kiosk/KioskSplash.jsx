import React from 'react';
import { UtensilsCrossed, ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

export default function KioskSplash({ onSelect }) {
  const { dispatch } = useCart();

  function select(mode) {
    dispatch({ type: 'SET_DINE_MODE', payload: mode });
    onSelect(mode);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-charcoal"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #2a1f0e 0%, #1a1a1a 70%)',
      }}
    >
      {/* Logo */}
      <div className="mb-16 text-center">
        <h1 className="font-display text-6xl font-bold text-white tracking-tight leading-none">
          La Pasta
        </h1>
        <h2 className="font-display text-5xl font-bold text-brand-400 tracking-tight mt-1">
          Alfreej
        </h2>
        <p className="text-white/40 mt-4 text-lg tracking-widest uppercase">
          Artisan Italian · Doha
        </p>
      </div>

      {/* Touch prompt */}
      <p className="text-white/50 text-2xl mb-10 tracking-wide animate-pulse-slow">
        How would you like to dine?
      </p>

      {/* Mode buttons */}
      <div className="flex gap-8">
        <button
          onClick={() => select('dine-in')}
          className="group flex flex-col items-center gap-5 bg-white/5 hover:bg-brand-500
                     border-2 border-white/10 hover:border-brand-400 rounded-3xl
                     px-14 py-12 kiosk-touch-target transition-all duration-200
                     active:scale-95"
        >
          <UtensilsCrossed className="w-16 h-16 text-white/70 group-hover:text-white transition-colors" />
          <span className="text-white text-2xl font-bold tracking-wide">Dine In</span>
          <span className="text-white/40 text-sm group-hover:text-white/60">Eat here</span>
        </button>

        <button
          onClick={() => select('takeaway')}
          className="group flex flex-col items-center gap-5 bg-white/5 hover:bg-brand-500
                     border-2 border-white/10 hover:border-brand-400 rounded-3xl
                     px-14 py-12 kiosk-touch-target transition-all duration-200
                     active:scale-95"
        >
          <ShoppingBag className="w-16 h-16 text-white/70 group-hover:text-white transition-colors" />
          <span className="text-white text-2xl font-bold tracking-wide">Takeaway</span>
          <span className="text-white/40 text-sm group-hover:text-white/60">Take with you</span>
        </button>
      </div>

      {/* Language note */}
      <p className="absolute bottom-10 text-white/20 text-sm">
        Touch to begin your order
      </p>
    </div>
  );
}
