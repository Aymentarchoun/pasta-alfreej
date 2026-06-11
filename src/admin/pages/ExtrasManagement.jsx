import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Eye, EyeOff, Trash2, X, Save, Check, AlertCircle,
} from 'lucide-react';
import {
  getExtrasOverrides, setExtraOverride, removeExtraOverride,
  getCustomExtras, saveCustomExtras,
} from '../adminStore';
import { globalAddons, pizzaAddons, composeAddons, drinkAddons } from '../../data/menuData';

const POOLS = [
  { id: 'global',  label: 'Pasta & Risotto',  color: 'bg-orange-100 text-orange-700', base: globalAddons },
  { id: 'pizza',   label: 'Pizza',            color: 'bg-red-100 text-red-700',       base: pizzaAddons },
  { id: 'compose', label: 'Compose Your Meal', color: 'bg-green-100 text-green-700',  base: composeAddons },
  { id: 'drink',   label: 'Drinks',           color: 'bg-blue-100 text-blue-700',     base: drinkAddons },
];

// ── Inline Edit Row ───────────────────────────────────────────────────────────
function AddonRow({ addon, poolColor, overrides, onSave, onToggleHide, onDelete }) {
  const [editing, setEditing] = useState(false);
  const ov = overrides[addon.id] || {};

  const displayEn = ov.labelEn ?? addon.labelEn;
  const displayAr = ov.labelAr ?? addon.labelAr;
  const displayPrice = ov.price ?? addon.price;
  const isHidden = !!ov.hidden;

  const [form, setForm] = useState({ labelEn: displayEn, labelAr: displayAr, price: displayPrice });

  function handleSave() {
    onSave(addon.id, {
      labelEn: form.labelEn,
      labelAr: form.labelAr,
      price: parseFloat(form.price) || 0,
    });
    setEditing(false);
  }

  return (
    <div className={`bg-white rounded-xl border px-4 py-3 transition-all
      ${isHidden ? 'opacity-50 border-gray-200' : 'border-gray-100 shadow-sm'}`}>
      {editing ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label-sm">Name (EN)</label>
              <input
                type="text"
                value={form.labelEn}
                onChange={e => setForm(f => ({ ...f, labelEn: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-sm">Name (AR)</label>
              <input
                type="text"
                value={form.labelAr}
                onChange={e => setForm(f => ({ ...f, labelAr: e.target.value }))}
                className="input-field text-right"
                dir="rtl"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="label-sm">Price (QAR)</label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                min={0}
                step={0.5}
                className="input-field"
              />
            </div>
            <div className="flex gap-2 pt-5">
              <button
                onClick={handleSave}
                className="p-2 rounded-lg bg-[#d4832a] text-white hover:bg-[#b8651f] transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditing(false)}
                className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-gray-800 text-sm">{displayEn}</p>
              <p className="text-gray-400 text-xs">{displayAr}</p>
              {isHidden && (
                <span className="text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">HIDDEN</span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {displayPrice === 0 ? 'Free' : `+${displayPrice} QAR`}
              {(ov.labelEn || ov.price !== undefined) && (
                <span className="ml-2 text-[#d4832a]">· overridden</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleHide(addon.id, !isHidden)}
              className={`p-1.5 rounded-lg transition-colors
                ${isHidden ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
              title={isHidden ? 'Show' : 'Hide'}
            >
              {isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={() => { setForm({ labelEn: displayEn, labelAr: displayAr, price: displayPrice }); setEditing(true); }}
              className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-[#faefd9] hover:text-[#d4832a] transition-colors"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(addon.id)}
                className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Delete custom extra"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Add Custom Extra Form ──────────────────────────────────────────────────────
function AddExtraForm({ poolId, onAdd, onCancel }) {
  const [form, setForm] = useState({ labelEn: '', labelAr: '', price: 0 });

  function handleAdd() {
    if (!form.labelEn.trim()) return;
    onAdd({
      id: `custom-extra-${Date.now()}`,
      pool: poolId,
      labelEn: form.labelEn.trim(),
      labelAr: form.labelAr.trim(),
      price: parseFloat(form.price) || 0,
    });
  }

  return (
    <div className="border-2 border-dashed border-[#d4832a] rounded-xl p-4 space-y-3 bg-orange-50">
      <p className="text-xs font-bold text-[#d4832a]">New Extra</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label-sm">Name (EN) *</label>
          <input
            type="text"
            value={form.labelEn}
            onChange={e => setForm(f => ({ ...f, labelEn: e.target.value }))}
            placeholder="Extra name"
            className="input-field"
            autoFocus
          />
        </div>
        <div>
          <label className="label-sm">Name (AR)</label>
          <input
            type="text"
            value={form.labelAr}
            onChange={e => setForm(f => ({ ...f, labelAr: e.target.value }))}
            placeholder="اسم الإضافة"
            className="input-field text-right"
            dir="rtl"
          />
        </div>
      </div>
      <div>
        <label className="label-sm">Price (QAR)</label>
        <input
          type="number"
          value={form.price}
          onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
          min={0}
          step={0.5}
          className="input-field"
          placeholder="0 = Free"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          disabled={!form.labelEn.trim()}
          className="flex-1 py-2 rounded-xl bg-[#d4832a] hover:bg-[#b8651f] disabled:bg-gray-200
                     text-white font-bold text-sm transition-all"
        >
          Add Extra
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Pool Section ──────────────────────────────────────────────────────────────
function PoolSection({ pool, overrides, customExtras, onSaveOverride, onToggleHide, onDeleteCustom, onAddCustom }) {
  const [adding, setAdding] = useState(false);

  const poolCustomExtras = customExtras.filter(e => e.pool === pool.id);

  function handleAdd(extra) {
    onAddCustom(extra);
    setAdding(false);
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${pool.color}`}>
            {pool.label}
          </span>
          <span className="text-xs text-gray-400">{pool.base.length + poolCustomExtras.length} extras</span>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs font-bold text-[#d4832a] hover:text-[#b8651f] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Extra
        </button>
      </div>

      <div className="space-y-2">
        {pool.base.map(addon => (
          <AddonRow
            key={addon.id}
            addon={addon}
            poolColor={pool.color}
            overrides={overrides}
            onSave={onSaveOverride}
            onToggleHide={onToggleHide}
          />
        ))}
        {poolCustomExtras.map(addon => (
          <AddonRow
            key={addon.id}
            addon={addon}
            poolColor={pool.color}
            overrides={overrides}
            onSave={onSaveOverride}
            onToggleHide={onToggleHide}
            onDelete={onDeleteCustom}
          />
        ))}
      </div>

      {adding && (
        <div className="mt-3">
          <AddExtraForm poolId={pool.id} onAdd={handleAdd} onCancel={() => setAdding(false)} />
        </div>
      )}
    </div>
  );
}

// ── ExtrasManagement page ─────────────────────────────────────────────────────
export default function ExtrasManagement({ session }) {
  const [overrides,     setOverrides]     = useState({});
  const [customExtras,  setCustomExtras]  = useState([]);

  const load = useCallback(() => {
    setOverrides(getExtrasOverrides());
    setCustomExtras(getCustomExtras());
  }, []);

  useEffect(() => {
    load();
    window.addEventListener('pa_menu_update', load);
    return () => window.removeEventListener('pa_menu_update', load);
  }, [load]);

  function handleSaveOverride(addonId, fields) {
    setExtraOverride(addonId, fields);
  }

  function handleToggleHide(addonId, hidden) {
    setExtraOverride(addonId, { hidden });
  }

  function handleAddCustom(extra) {
    const next = [...customExtras, extra];
    saveCustomExtras(next);
  }

  function handleDeleteCustom(addonId) {
    if (!window.confirm('Delete this custom extra?')) return;
    const next = customExtras.filter(e => e.id !== addonId);
    saveCustomExtras(next);
    removeExtraOverride(addonId);
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Extras Management</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Edit prices, hide or add extras for each addon pool
        </p>
      </div>

      {POOLS.map(pool => (
        <PoolSection
          key={pool.id}
          pool={pool}
          overrides={overrides}
          customExtras={customExtras}
          onSaveOverride={handleSaveOverride}
          onToggleHide={handleToggleHide}
          onAddCustom={handleAddCustom}
          onDeleteCustom={handleDeleteCustom}
        />
      ))}

      <style>{`
        .label-sm { display: block; font-size: 0.75rem; font-weight: 600; color: #6b7280; margin-bottom: 4px; }
        .input-field {
          width: 100%; border: 1px solid #e5e7eb; border-radius: 0.75rem;
          padding: 0.5rem 0.75rem; font-size: 0.875rem; color: #111827;
          outline: none; transition: all 0.15s;
        }
        .input-field:focus { border-color: #d4832a; box-shadow: 0 0 0 3px rgba(212,131,42,0.15); }
      `}</style>
    </div>
  );
}
