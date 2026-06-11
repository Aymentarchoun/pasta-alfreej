import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar, TrendingUp, ShoppingBag, Banknote,
  CreditCard, Bike, UtensilsCrossed, ChevronDown,
} from 'lucide-react';
import { getOrders } from '../adminStore';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('en-QA', { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-QA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

const MODE_LABEL  = { delivery: 'Delivery', takeaway: 'Take Away', dinein: 'Dine In' };
const MODE_ICON   = {
  delivery: <Bike className="w-3.5 h-3.5" />,
  takeaway: <ShoppingBag className="w-3.5 h-3.5" />,
  dinein:   <UtensilsCrossed className="w-3.5 h-3.5" />,
};
const BRANCH_COLOR = { sheraton: 'text-[#d4832a]', maamoura: 'text-blue-600' };

function HistoryCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const bc = BRANCH_COLOR[order.branch] || 'text-gray-700';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        {/* Branch */}
        <div className="flex-shrink-0 w-14 text-center">
          <p className={`text-xs font-black uppercase tracking-wide ${bc}`}>
            {order.branch?.slice(0, 4).toUpperCase()}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">{fmtTime(order.timestamp)}</p>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-800 text-sm">{order.contact?.name}</p>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              {MODE_ICON[order.mode]} {MODE_LABEL[order.mode]}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''} · #{order.id.slice(-6)}
          </p>
        </div>

        {/* Total + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-bold text-[#d4832a] text-sm">{order.total?.toFixed(2)} QAR</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3">
          {/* Items */}
          <div className="space-y-1.5">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-start justify-between text-sm gap-2">
                <div className="flex-1">
                  <span className="font-medium text-gray-700">
                    {item.qty > 1 && <span className="text-[#d4832a] font-bold mr-1">{item.qty}×</span>}
                    {item.nameEn}
                  </span>
                  {item.size?.labelEn && item.size.labelEn !== 'Regular' && item.size.labelEn !== 'Full Deal' && (
                    <span className="text-xs text-gray-400 ml-1">· {item.size.labelEn}</span>
                  )}
                  {item.addons?.length > 0 && (
                    <p className="text-xs text-gray-400 ml-0">+ {item.addons.map(a => a.labelEn).join(', ')}</p>
                  )}
                </div>
                <span className="text-gray-600 font-medium flex-shrink-0">
                  {(item.size?.price * item.qty).toFixed(0)} QAR
                </span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="border-t border-gray-100 pt-2.5 space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Subtotal</span><span>{order.subtotal?.toFixed(2)} QAR</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>Delivery</span><span>+{order.deliveryFee} QAR</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-gray-800">
              <span>Total</span><span className="text-[#d4832a]">{order.total?.toFixed(2)} QAR</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
              {order.payMethod === 'cash'
                ? <><Banknote className="w-3.5 h-3.5 text-green-600" /> Cash</>
                : <><CreditCard className="w-3.5 h-3.5 text-indigo-500" /> Card</>}
              {order.contact?.phone && <span className="ml-2">· {order.contact.phone}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderHistory({ session }) {
  const [date,         setDate]         = useState(today());
  const [orders,       setOrders]       = useState([]);
  const [branchFilter, setBranchFilter] = useState('all'); // 'all' | 'maamoura' | 'sheraton'

  const isManager = !session.branch;

  const load = useCallback(async () => {
    try {
      const branch = session.branch || (branchFilter !== 'all' ? branchFilter : undefined);
      const all = await getOrders({ branch, date });
      setOrders(all);
    } catch (e) {
      console.error('Failed to load order history', e);
    }
  }, [date, session.branch, branchFilter]);

  useEffect(() => { load(); }, [load]);

  // Stats
  const done      = orders.filter(o => o.status === 'done');
  const revenue   = done.reduce((s, o) => s + (o.total || 0), 0);
  const byMode    = orders.reduce((acc, o) => { acc[o.mode] = (acc[o.mode] || 0) + 1; return acc; }, {});
  const byBranch  = orders.reduce((acc, o) => { acc[o.branch] = (acc[o.branch] || 0) + 1; return acc; }, {});

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Order History</h1>
          <p className="text-gray-400 text-sm mt-0.5">{fmtDate(date + 'T12:00:00')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={date}
            max={today()}
            onChange={e => setDate(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white
                       focus:outline-none focus:ring-2 focus:ring-[#d4832a] text-gray-700"
          />
        </div>
      </div>

      {/* Branch filter tabs — manager only */}
      {isManager && (
        <div className="flex gap-2 mb-5">
          {[
            { id: 'all',      label: 'All Branches' },
            { id: 'maamoura', label: 'Maamoura' },
            { id: 'sheraton', label: 'Sheraton' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setBranchFilter(opt.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border
                ${branchFilter === opt.id
                  ? opt.id === 'maamoura'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : opt.id === 'sheraton'
                      ? 'bg-[#d4832a] border-[#d4832a] text-white'
                      : 'bg-gray-800 border-gray-800 text-white'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-400 font-medium">Total Orders</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{orders.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-400 font-medium">Completed</p>
          <p className="text-2xl font-black text-green-600 mt-1">{done.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-400 font-medium">Revenue</p>
          <p className="text-2xl font-black text-[#d4832a] mt-1">
            {revenue.toFixed(0)} <span className="text-sm font-semibold">QAR</span>
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-400 font-medium">Delivery</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{byMode.delivery || 0}</p>
        </div>
      </div>

      {/* Branch breakdown (for kitchen/manager seeing all) */}
      {!session.branch && orders.length > 0 && (
        <div className="flex gap-3 mb-5">
          {Object.entries(byBranch).map(([branch, count]) => (
            <div key={branch} className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 shadow-sm">
              <p className={`text-xs font-black uppercase tracking-widest
                ${branch === 'sheraton' ? 'text-[#d4832a]' : 'text-blue-600'}`}>
                {branch}
              </p>
              <p className="text-lg font-bold text-gray-800">{count} orders</p>
            </div>
          ))}
        </div>
      )}

      {/* Orders list */}
      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No orders for this date</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <HistoryCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
