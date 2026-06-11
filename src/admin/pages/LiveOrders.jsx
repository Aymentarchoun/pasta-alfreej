import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell, BellOff, CheckCircle, Clock, ChefHat,
  Bike, UtensilsCrossed, ShoppingBag,
  Phone, MapPin, CreditCard, Banknote,
  RefreshCw, Volume2, VolumeX, Printer,
} from 'lucide-react';
import { getOrders, updateOrderStatus } from '../adminStore';
import { printReceipt } from '../printReceipt';

// ── Branch display config ──────────────────────────────────────────────────────
const BRANCH_CONFIG = {
  sheraton: { label: 'SHERATON', color: '#d4832a', bg: '#fdf3e3', border: '#f4dba8' },
  maamoura: { label: 'MAAMOURA', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
};

const STATUS_FLOW = ['new', 'preparing', 'ready', 'done'];

const STATUS_CONFIG = {
  new:       { label: 'New Order',   color: 'bg-red-500',    text: 'text-red-600',    bg: 'bg-red-50',    next: 'preparing', nextLabel: 'Start Preparing' },
  preparing: { label: 'Preparing',   color: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-orange-50', next: 'ready',     nextLabel: 'Mark Ready' },
  ready:     { label: 'Ready',       color: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50',  next: 'done',      nextLabel: 'Mark Done' },
  done:      { label: 'Done',        color: 'bg-gray-400',   text: 'text-gray-500',   bg: 'bg-gray-50',   next: null,        nextLabel: null },
};

const MODE_ICON = {
  delivery: <Bike className="w-4 h-4" />,
  takeaway: <ShoppingBag className="w-4 h-4" />,
  dinein:   <UtensilsCrossed className="w-4 h-4" />,
};

const MODE_LABEL = {
  delivery: 'Delivery',
  takeaway: 'Take Away',
  dinein:   'Dine In',
};

// ── Play notification sound ────────────────────────────────────────────────────
function playSound() {
  try {
    const audio = new Audio('/sounds/notification.m4a');
    audio.volume = 0.9;
    audio.play().catch(() => {});
  } catch (_) {}
}

// ── Format timestamp ───────────────────────────────────────────────────────────
function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('en-QA', { hour: '2-digit', minute: '2-digit' });
}

// ── Order Card ─────────────────────────────────────────────────────────────────
function OrderCard({ order, onStatusChange }) {
  if (!order?.id) return null;
  const branch = BRANCH_CONFIG[order.branch] || BRANCH_CONFIG.sheraton;
  const sc     = STATUS_CONFIG[order.status] || STATUS_CONFIG.new;
  const isNew  = order.status === 'new';

  return (
    <div
      className={`bg-white rounded-2xl shadow-md overflow-hidden border-2 transition-all
        ${isNew ? 'border-red-300 animate-pulse-slow' : 'border-transparent'}`}
    >
      {/* Branch banner */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ backgroundColor: branch.bg, borderBottom: `2px solid ${branch.border}` }}
      >
        <span
          className="font-black text-3xl tracking-widest uppercase"
          style={{ color: branch.color, letterSpacing: '0.15em' }}
        >
          {branch.label}
        </span>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs text-gray-500 font-medium">{fmtTime(order.timestamp)}</p>
            <p className="text-[11px] text-gray-400 font-mono">#{order.id.slice(-6)}</p>
          </div>
          <button
            onClick={() => printReceipt(order)}
            title="Print receipt (80mm)"
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/70 hover:bg-white
                       border border-gray-200 text-gray-600 hover:text-gray-900 transition-all
                       active:scale-95 shadow-sm"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status badge + mode */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-1">
        <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full
          ${sc.bg} ${sc.text}`}>
          <span className={`w-2 h-2 rounded-full ${sc.color}`} />
          {sc.label}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
          {MODE_ICON[order.mode]}
          {MODE_LABEL[order.mode]}
        </span>
        {order.payMethod === 'card' && (
          <span className="flex items-center gap-1 text-xs text-indigo-600 font-medium">
            <CreditCard className="w-3.5 h-3.5" />
            Card
          </span>
        )}
        {order.payMethod === 'cash' && (
          <span className="flex items-center gap-1 text-xs text-green-700 font-medium">
            <Banknote className="w-3.5 h-3.5" />
            Cash
          </span>
        )}
      </div>

      {/* Items */}
      <div className="px-4 py-2 space-y-1.5 border-b border-gray-100">
        {(order.items || []).map((item, i) => (
          <div key={i} className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-gray-800">
                {item.qty > 1 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-[#d4832a]
                                   text-white text-[10px] font-bold rounded-full mr-1.5">
                    {item.qty}
                  </span>
                )}
                {item.nameEn}
              </span>
              {item.size && item.size.labelEn !== 'Regular' && item.size.labelEn !== 'Full Deal' && (
                <span className="text-xs text-gray-400 ml-1">· {item.size.labelEn}</span>
              )}
              {item.addons && item.addons.length > 0 && (
                <p className="text-xs text-gray-400 mt-0.5 ml-1">
                  + {item.addons.map(a => a.labelEn).join(', ')}
                </p>
              )}
              {item.mealUpsell && (
                <p className="text-xs text-green-600 mt-0.5 ml-1">+ Meal Upgrade</p>
              )}
              {item.instructions && (
                <p className="text-xs text-amber-600 mt-0.5 ml-1 italic">
                  Note: {item.instructions}
                </p>
              )}
            </div>
            <span className="text-sm font-bold text-gray-700 flex-shrink-0">
              {((item.size?.price ?? 0) * (item.qty ?? 1)).toFixed(0)} QAR
            </span>
          </div>
        ))}
      </div>

      {/* Contact + address */}
      <div className="px-4 py-2.5 space-y-1.5 border-b border-gray-100">
        <div className="flex items-center gap-2 text-sm">
          <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="font-semibold text-gray-700">{order.contact?.name}</span>
          <span className="text-gray-500">{order.contact?.phone}</span>
        </div>
        {order.mode === 'delivery' && order.gpsCoords && order.gpsCoords.lat != null && (
          <a
            href={`https://maps.google.com/?q=${order.gpsCoords.lat},${order.gpsCoords.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 text-xs text-blue-600 hover:underline"
          >
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>
              {Number(order.gpsCoords.lat).toFixed(5)}, {Number(order.gpsCoords.lng).toFixed(5)}
            </span>
          </a>
        )}
        {order.mode === 'delivery' && order.manualAddr && (
          <div className="flex items-start gap-2 text-xs text-blue-600">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>{order.manualAddr}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-gray-100">
        <div className="space-y-0.5">
          <p className="text-xs text-gray-400">Subtotal</p>
          {order.deliveryFee > 0 && (
            <p className="text-xs text-gray-400">Delivery fee</p>
          )}
          <p className="text-sm font-bold text-gray-800">Total</p>
        </div>
        <div className="text-right space-y-0.5">
          <p className="text-xs text-gray-500">{order.subtotal?.toFixed(2)} QAR</p>
          {order.deliveryFee > 0 && (
            <p className="text-xs text-gray-500">+{order.deliveryFee} QAR</p>
          )}
          <p className="text-sm font-bold text-[#d4832a]">{order.total?.toFixed(2)} QAR</p>
        </div>
      </div>

      {/* Action button */}
      {sc.next && (
        <div className="px-4 py-3">
          <button
            onClick={() => onStatusChange(order.id, sc.next)}
            className={`w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.98]
              ${sc.next === 'preparing' ? 'bg-orange-500 hover:bg-orange-600' :
                sc.next === 'ready'     ? 'bg-green-600 hover:bg-green-700'   :
                                          'bg-gray-500 hover:bg-gray-600'}`}
          >
            {sc.nextLabel}
          </button>
        </div>
      )}
    </div>
  );
}

// ── LiveOrders page ────────────────────────────────────────────────────────────
export default function LiveOrders({ session }) {
  const [orders,     setOrders]     = useState([]);
  const [soundOn,    setSoundOn]    = useState(true);
  const [filter,     setFilter]     = useState('active'); // 'active' | 'all'
  const lastCountRef = useRef(0);

  const loadOrders = useCallback(async () => {
    try {
      const all = await getOrders({ branch: session.branch || undefined });
      setOrders(all);
      return all;
    } catch (e) {
      console.error('Failed to load orders', e);
      return [];
    }
  }, [session.branch]);

  useEffect(() => {
    loadOrders().then(initial => {
      lastCountRef.current = initial.filter(o => o.status === 'new').length;
    });

    // Poll every 5 seconds for new orders
    const interval = setInterval(async () => {
      const updated = await loadOrders();
      const newCount = updated.filter(o => o.status === 'new').length;
      if (newCount > lastCountRef.current && soundOn) {
        playSound();
      }
      lastCountRef.current = newCount;
    }, 5000);

    return () => clearInterval(interval);
  }, [loadOrders, soundOn]);

  async function handleStatusChange(orderId, newStatus) {
    await updateOrderStatus(orderId, newStatus);
    loadOrders();
  }

  const displayed = filter === 'active'
    ? orders.filter(o => o.status !== 'done')
    : orders;

  const newCount = orders.filter(o => o.status === 'new').length;

  return (
    <div className="p-4 sm:p-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            Live Orders
            {newCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 bg-red-500
                               text-white text-xs font-bold rounded-full px-2 animate-bounce">
                {newCount}
              </span>
            )}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {session.branch ? `Branch: ${session.branch.toUpperCase()}` : 'All Branches'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound toggle */}
          <button
            onClick={() => { setSoundOn(v => !v); if (!soundOn) playSound(); }}
            title={soundOn ? 'Mute notifications' : 'Unmute notifications'}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all
              ${soundOn
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundOn ? 'Sound ON' : 'Sound OFF'}</span>
          </button>

          {/* Refresh */}
          <button
            onClick={loadOrders}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-all"
            title="Refresh orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { key: 'active', label: 'Active Orders' },
          { key: 'all',    label: 'All Today' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all
              ${filter === key
                ? 'bg-[#d4832a] text-white shadow-sm'
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
          >
            {label}
            {key === 'active' && displayed.length > 0 && filter === 'active' && (
              <span className="ml-2 bg-white/30 text-white text-xs px-1.5 rounded-full">
                {displayed.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders grid */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <ChefHat className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-semibold">No active orders</p>
          <p className="text-gray-400 text-sm mt-1">
            New orders will appear here automatically
          </p>
          <button
            onClick={() => { setSoundOn(true); playSound(); }}
            className="mt-4 flex items-center gap-2 text-sm text-[#d4832a] font-semibold
                       hover:underline"
          >
            <Bell className="w-4 h-4" />
            Test notification sound
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayed.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
