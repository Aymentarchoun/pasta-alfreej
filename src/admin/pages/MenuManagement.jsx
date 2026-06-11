import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Pencil, Eye, EyeOff, Trash2, X,
  Save, Image, Flame, Leaf, Sparkles, AlertCircle,
  ChevronDown, ChevronRight,
} from 'lucide-react';
import {
  getLiveMenu, setItemOverride,
  setItemHiddenForBranch,
  getCustomItems, saveCustomItems,
  getItemAddonOverrides, setItemAddonOverride,
  resolveItemAddons,
} from '../adminStore';
import {
  menuItems as BASE_ITEMS,
  categories as BASE_CATS,
  globalAddons, pizzaAddons, composeAddons, drinkAddons,
} from '../../data/menuData';

const ALL_ADDON_POOL = [
  ...globalAddons, ...pizzaAddons, ...composeAddons, ...drinkAddons,
].filter((a, i, arr) => arr.findIndex(x => x.id === a.id) === i);

function genId() {
  return 'custom-' + Date.now().toString(36);
}

const EMPTY_ITEM = {
  id: '',
  category: 'pasta',
  nameEn: '',
  nameAr: '',
  descriptionEn: '',
  descriptionAr: '',
  image: '',
  badge: '',
  isSpicy: false,
  isVeg: false,
  isNew: false,
  sizes: [{ id: 'regular', labelEn: 'Regular', labelAr: 'عادي', price: 0 }],
  addons: [],
  related: [],
  hasMealUpsell: false,
};

// ── Extras Tab (per-item addon management) ─────────────────────────────────────
function ExtrasTab({ item }) {
  const [override, setOverride] = useState(() => {
    const all = getItemAddonOverrides();
    return all[item.id] || { added: [], removed: [] };
  });

  const effectiveAddons = resolveItemAddons(item, ALL_ADDON_POOL);

  function save(next) {
    setOverride(next);
    setItemAddonOverride(item.id, next);
  }

  function handleRemove(addonId) {
    const isBase = (item.addons || []).some(a => a.id === addonId);
    if (isBase) {
      save({ ...override, removed: [...new Set([...override.removed, addonId])] });
    } else {
      save({ ...override, added: override.added.filter(id => id !== addonId) });
    }
  }

  function handleAdd(addonId) {
    if (override.removed.includes(addonId)) {
      save({ ...override, removed: override.removed.filter(id => id !== addonId) });
    } else if (!override.added.includes(addonId)) {
      save({ ...override, added: [...override.added, addonId] });
    }
  }

  const effectiveIds = effectiveAddons.map(a => a.id);
  const availableToAdd = ALL_ADDON_POOL.filter(a => !effectiveIds.includes(a.id));

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Current Extras</p>
        {effectiveAddons.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No extras for this item</p>
        ) : (
          <div className="space-y-2">
            {effectiveAddons.map(addon => (
              <div
                key={addon.id}
                className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl border border-gray-200"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{addon.labelEn}</p>
                  <p className="text-xs text-gray-400">{addon.labelAr} · {addon.price === 0 ? 'Free' : `+${addon.price} QAR`}</p>
                </div>
                <button
                  onClick={() => handleRemove(addon.id)}
                  className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                  title="Remove from this item"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {availableToAdd.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Add Extra</p>
          <div className="space-y-2">
            {availableToAdd.map(addon => (
              <div
                key={addon.id}
                className="flex items-center justify-between px-3 py-2 border border-dashed border-gray-200 rounded-xl"
              >
                <div>
                  <p className="text-sm font-medium text-gray-700">{addon.labelEn}</p>
                  <p className="text-xs text-gray-400">{addon.labelAr} · {addon.price === 0 ? 'Free' : `+${addon.price} QAR`}</p>
                </div>
                <button
                  onClick={() => handleAdd(addon.id)}
                  className="w-7 h-7 rounded-lg bg-[#faefd9] text-[#d4832a] hover:bg-[#f5deb3] flex items-center justify-center transition-colors"
                  title="Add to this item"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Edit Modal ─────────────────────────────────────────────────────────────────
function EditModal({ item, isCustom, allCats, onSave, onClose }) {
  const [form, setForm] = useState({ ...EMPTY_ITEM, ...item });
  const [saving, setSaving] = useState(false);
  const [tab, setTab]   = useState('basic'); // basic | sizes | extras | advanced

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function setSize(idx, key, val) {
    setForm(f => {
      const sizes = [...f.sizes];
      sizes[idx] = { ...sizes[idx], [key]: val };
      return { ...f, sizes };
    });
  }

  function addSize() {
    setForm(f => ({
      ...f,
      sizes: [...f.sizes, { id: 'size-' + Date.now(), labelEn: '', labelAr: '', price: 0 }],
    }));
  }

  function removeSize(idx) {
    setForm(f => ({ ...f, sizes: f.sizes.filter((_, i) => i !== idx) }));
  }

  function handleSave() {
    if (!form.nameEn.trim()) return;
    setSaving(true);
    setTimeout(() => {
      onSave(form);
      setSaving(false);
    }, 300);
  }

  const TABS = [
    { id: 'basic',    label: 'Basic Info' },
    { id: 'sizes',    label: 'Prices' },
    { id: 'extras',   label: 'Extras' },
    { id: 'advanced', label: 'Advanced' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">
            {item.id ? 'Edit Item' : 'New Item'}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px
                ${tab === t.id
                  ? 'border-[#d4832a] text-[#d4832a]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form body */}
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">

          {/* ── BASIC INFO ── */}
          {tab === 'basic' && (
            <>
              <div>
                <label className="label-sm">Category</label>
                <select
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                  className="input-field"
                >
                  {allCats.map(c => (
                    <option key={c.id} value={c.id}>{c.emoji} {c.id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-sm">Name (English) *</label>
                <input
                  type="text"
                  value={form.nameEn}
                  onChange={e => set('nameEn', e.target.value)}
                  placeholder="e.g. Pasta Arrabbiata"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-sm">Name (Arabic)</label>
                <input
                  type="text"
                  value={form.nameAr}
                  onChange={e => set('nameAr', e.target.value)}
                  placeholder="اسم الصنف بالعربي"
                  className="input-field text-right"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="label-sm">Description (English)</label>
                <textarea
                  value={form.descriptionEn}
                  onChange={e => set('descriptionEn', e.target.value)}
                  rows={2}
                  placeholder="Short description…"
                  className="input-field resize-none"
                />
              </div>
              <div>
                <label className="label-sm">Description (Arabic)</label>
                <textarea
                  value={form.descriptionAr}
                  onChange={e => set('descriptionAr', e.target.value)}
                  rows={2}
                  placeholder="وصف مختصر…"
                  className="input-field resize-none text-right"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="label-sm">Image URL</label>
                <input
                  type="url"
                  value={form.image}
                  onChange={e => set('image', e.target.value)}
                  placeholder="https://…"
                  className="input-field"
                />
                {form.image && (
                  <img
                    src={form.image}
                    alt=""
                    className="mt-2 h-24 w-full object-cover rounded-xl bg-gray-100"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                )}
              </div>
              <div>
                <label className="label-sm">Badge (optional)</label>
                <input
                  type="text"
                  value={form.badge}
                  onChange={e => set('badge', e.target.value)}
                  placeholder="e.g. CHEF'S PICK"
                  className="input-field"
                  maxLength={20}
                />
              </div>
            </>
          )}

          {/* ── PRICES / SIZES ── */}
          {tab === 'sizes' && (
            <>
              <p className="text-xs text-gray-500">
                Add one size for a fixed-price item, or multiple sizes (e.g. Medium / Large).
              </p>
              <div className="space-y-3">
                {form.sizes.map((sz, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 uppercase">Size {idx + 1}</span>
                      {form.sizes.length > 1 && (
                        <button onClick={() => removeSize(idx)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="label-sm">Label (EN)</label>
                        <input
                          type="text"
                          value={sz.labelEn}
                          onChange={e => setSize(idx, 'labelEn', e.target.value)}
                          placeholder="Regular"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="label-sm">Label (AR)</label>
                        <input
                          type="text"
                          value={sz.labelAr}
                          onChange={e => setSize(idx, 'labelAr', e.target.value)}
                          placeholder="عادي"
                          className="input-field"
                          dir="rtl"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label-sm">Price (QAR)</label>
                      <input
                        type="number"
                        value={sz.price ?? 0}
                        onChange={e => setSize(idx, 'price', parseFloat(e.target.value) || 0)}
                        min={0}
                        step={0.5}
                        className="input-field"
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={addSize}
                  className="w-full flex items-center justify-center gap-2 border-2 border-dashed
                             border-gray-200 rounded-xl py-2.5 text-sm text-gray-400 hover:text-gray-600
                             hover:border-gray-300 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add size / variant
                </button>
              </div>

              {form.category === 'offers' && (
                <div className="border border-orange-200 bg-orange-50 rounded-xl p-3 space-y-2 mt-2">
                  <p className="text-xs font-bold text-orange-700">Offer fields</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label-sm">Original Price</label>
                      <input
                        type="number"
                        value={form.originalPrice || ''}
                        onChange={e => set('originalPrice', parseFloat(e.target.value) || 0)}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label-sm">Saving (EN)</label>
                      <input
                        type="text"
                        value={form.savingEn || ''}
                        onChange={e => set('savingEn', e.target.value)}
                        placeholder="Save 16 QAR"
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label-sm">Saving (AR)</label>
                    <input
                      type="text"
                      value={form.savingAr || ''}
                      onChange={e => set('savingAr', e.target.value)}
                      placeholder="وفّر 16 ريال"
                      className="input-field"
                      dir="rtl"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── EXTRAS ── */}
          {tab === 'extras' && item.id && (
            <ExtrasTab item={item} />
          )}
          {tab === 'extras' && !item.id && (
            <p className="text-sm text-gray-400 text-center py-6">
              Save the item first, then manage its extras here.
            </p>
          )}

          {/* ── ADVANCED ── */}
          {tab === 'advanced' && (
            <>
              <div className="space-y-3">
                {[
                  { key: 'isSpicy', icon: <Flame className="w-4 h-4 text-red-500" />, label: 'Spicy' },
                  { key: 'isVeg',   icon: <Leaf  className="w-4 h-4 text-green-600" />, label: 'Vegetarian' },
                  { key: 'isNew',   icon: <Sparkles className="w-4 h-4 text-purple-500" />, label: 'New / Featured' },
                  { key: 'hasMealUpsell', icon: null, label: 'Has Meal Upsell (+18 QAR)' },
                ].map(({ key, icon, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => set(key, !form[key])}
                      className={`w-10 h-6 rounded-full transition-colors flex items-center
                        ${form[key] ? 'bg-[#d4832a]' : 'bg-gray-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1
                        ${form[key] ? 'translate-x-4' : 'translate-x-0'}`}
                      />
                    </div>
                    {icon}
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {tab !== 'extras' && (
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!form.nameEn.trim() || saving}
              className="flex-1 py-2.5 rounded-xl bg-[#d4832a] hover:bg-[#b8651f] disabled:bg-gray-200
                         text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save Item'}
            </button>
          </div>
        )}
        {tab === 'extras' && (
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Section row ────────────────────────────────────────────────────────────────
function SectionGroup({ cat, items, session, onToggleHidden, onEdit, onDeleteCustom, isCustomFn }) {
  const [collapsed, setCollapsed] = useState(false);

  const hiddenCount = items.filter(i => i._hidden).length;
  const maamouraHiddenCount = items.filter(i => i._hiddenMaamoura).length;
  const sheratonHiddenCount = items.filter(i => i._hiddenSheraton).length;

  return (
    <div className="mb-4">
      {/* Section header */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-100 rounded-xl mb-2 hover:bg-gray-200 transition-colors"
      >
        <span className="text-lg">{cat.emoji}</span>
        <span className="font-bold text-gray-700 text-sm capitalize flex-1 text-left">{cat.id}</span>
        <span className="text-xs text-gray-400">{items.length} items</span>
        {hiddenCount > 0 && (
          <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
            {hiddenCount} hidden
          </span>
        )}
        {collapsed ? <ChevronRight className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {/* Items */}
      {!collapsed && (
        <div className="space-y-2 pl-2">
          {items.map(item => {
            const custom = isCustomFn(item.id);

            // Determine visibility state for this user's branch
            const isHiddenForUser = session.branch === 'maamoura'
              ? item._hiddenMaamoura
              : session.branch === 'sheraton'
                ? item._hiddenSheraton
                : item._hidden; // manager: hidden only if both

            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl border flex items-center gap-3 px-4 py-3 transition-all
                  ${item._hidden ? 'opacity-60 border-gray-200' : 'border-gray-100 shadow-sm'}`}
              >
                {/* Image */}
                <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Image className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-semibold text-gray-800 text-sm truncate">{item.nameEn}</p>
                    {item._hiddenMaamoura && (
                      <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1 py-0.5 rounded">M</span>
                    )}
                    {item._hiddenSheraton && (
                      <span className="text-[9px] font-bold bg-orange-100 text-orange-700 px-1 py-0.5 rounded">S</span>
                    )}
                    {custom && (
                      <span className="text-[9px] font-bold bg-purple-100 text-purple-600 px-1 py-0.5 rounded">CUSTOM</span>
                    )}
                    {item.badge && (
                      <span className="text-[9px] font-bold bg-[#faefd9] text-[#d4832a] px-1 py-0.5 rounded">{item.badge}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.sizes.map(s => `${s.price} QAR`).join(' / ')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => onToggleHidden(item)}
                    className={`p-1.5 rounded-lg transition-colors text-xs font-bold
                      ${isHiddenForUser
                        ? 'bg-green-50 text-green-600 hover:bg-green-100'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                    title={isHiddenForUser ? 'Show' : 'Hide'}
                  >
                    {isHiddenForUser ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => onEdit(item)}
                    className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#faefd9] hover:text-[#d4832a] transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {custom && (
                    <button
                      onClick={() => onDeleteCustom(item)}
                      className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── MenuManagement page ────────────────────────────────────────────────────────
export default function MenuManagement({ session }) {
  const [items,    setItems]    = useState([]);
  const [cats,     setCats]     = useState([]);
  const [search,   setSearch]   = useState('');
  const [editItem, setEditItem] = useState(null);
  const [isNew,    setIsNew]    = useState(false);

  const load = useCallback(() => {
    const { items: i, cats: c } = getLiveMenu(BASE_ITEMS, BASE_CATS, true);
    setItems(i);
    setCats(c);
  }, []);

  useEffect(() => {
    load();
    window.addEventListener('pa_menu_update', load);
    return () => window.removeEventListener('pa_menu_update', load);
  }, [load]);

  function isCustom(id) {
    return getCustomItems().some(i => i.id === id);
  }

  function handleToggleHidden(item) {
    const branch = session?.branch || null;
    const isHiddenForUser = branch === 'maamoura'
      ? item._hiddenMaamoura
      : branch === 'sheraton'
        ? item._hiddenSheraton
        : item._hidden;
    setItemHiddenForBranch(item.id, !isHiddenForUser, branch);
  }

  function handleEdit(item) {
    setEditItem({ ...item });
    setIsNew(false);
  }

  function handleNew() {
    setEditItem({ ...EMPTY_ITEM, id: genId() });
    setIsNew(true);
  }

  function handleSave(form) {
    const custom = getCustomItems();
    if (isNew || isCustom(form.id)) {
      const without = custom.filter(i => i.id !== form.id);
      const newItem = {
        ...form,
        sizes:   form.sizes.map(s => ({ ...s, price: Number(s.price) })),
        addons:  form.addons || [],
        related: form.related || [],
      };
      saveCustomItems([newItem, ...without]);
    } else {
      const { id, _hidden, _hiddenMaamoura, _hiddenSheraton, ...rest } = form;
      setItemOverride(id, rest);
    }
    setEditItem(null);
  }

  function handleDeleteCustom(item) {
    if (!window.confirm(`Delete "${item.nameEn}"? This cannot be undone.`)) return;
    const custom = getCustomItems().filter(i => i.id !== item.id);
    saveCustomItems(custom);
  }

  // Filter and group by section
  const filtered = items.filter(i =>
    !search || i.nameEn.toLowerCase().includes(search.toLowerCase()) || i.nameAr?.includes(search)
  );

  // Group by category, preserving category order
  const grouped = cats.map(cat => ({
    cat,
    items: filtered.filter(i => i.category === cat.id),
  })).filter(g => g.items.length > 0);

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Menu Items</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {items.length} total ·{' '}
            {session?.branch
              ? <span className="capitalize">{session.branch} branch</span>
              : <span>All branches</span>
            }
          </p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 bg-[#d4832a] hover:bg-[#b8651f] text-white
                     font-bold px-4 py-2.5 rounded-xl text-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          New Item
        </button>
      </div>

      {/* Branch legend (for manager) */}
      {!session?.branch && (
        <div className="flex items-center gap-3 mb-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">M</span>
            <span className="text-gray-500">Hidden on Maamoura</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">S</span>
            <span className="text-gray-500">Hidden on Sheraton</span>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search items…"
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-[#d4832a] focus:border-transparent bg-white"
        />
      </div>

      {/* Sections */}
      {grouped.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No items found</p>
        </div>
      ) : (
        grouped.map(({ cat, items: sectionItems }) => (
          <SectionGroup
            key={cat.id}
            cat={cat}
            items={sectionItems}
            session={session}
            onToggleHidden={handleToggleHidden}
            onEdit={handleEdit}
            onDeleteCustom={handleDeleteCustom}
            isCustomFn={isCustom}
          />
        ))
      )}

      {/* Edit Modal */}
      {editItem && (
        <EditModal
          item={editItem}
          isCustom={isNew || isCustom(editItem.id)}
          allCats={cats}
          onSave={handleSave}
          onClose={() => setEditItem(null)}
        />
      )}

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
