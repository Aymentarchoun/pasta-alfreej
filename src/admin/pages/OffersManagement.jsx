import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, X, Save, Tag, Eye, EyeOff, AlertCircle,
} from 'lucide-react';
import {
  getLiveMenu, setItemOverride, setItemHidden,
  getCustomItems, saveCustomItems,
} from '../adminStore';
import { menuItems as BASE_ITEMS, categories as BASE_CATS } from '../../data/menuData';

const EMPTY_OFFER = {
  id: '',
  category: 'offers',
  nameEn: '',
  nameAr: '',
  descriptionEn: '',
  descriptionAr: '',
  image: '',
  originalPrice: 0,
  savingEn: '',
  savingAr: '',
  sizes: [{ id: 'set', labelEn: 'Full Deal', labelAr: 'الطقم الكامل', price: 0 }],
  addons: [],
  related: [],
  hasMealUpsell: false,
  isNew: false, isSpicy: false, isVeg: false,
  badge: 'OFFER',
  _hidden: false,
};

function OfferModal({ offer, onSave, onClose }) {
  const [form, setForm] = useState({ ...EMPTY_OFFER, ...offer });

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }
  function setPrice(val) {
    setForm(f => ({ ...f, sizes: [{ ...f.sizes[0], price: parseFloat(val) || 0 }] }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{offer.id ? 'Edit Offer' : 'New Offer'}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Offer Price (QAR) *</label>
              <input type="number" value={form.sizes[0]?.price || ''} onChange={e => setPrice(e.target.value)}
                min={0} step={0.5} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4832a]" />
            </div>
            <div>
              <label className="field-label">Original Price (QAR)</label>
              <input type="number" value={form.originalPrice || ''} onChange={e => set('originalPrice', parseFloat(e.target.value) || 0)}
                min={0} step={0.5} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4832a]" />
            </div>
          </div>

          <div>
            <label className="field-label">Name (English) *</label>
            <input type="text" value={form.nameEn} onChange={e => set('nameEn', e.target.value)}
              placeholder="e.g. Family Deal" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4832a]" />
          </div>
          <div>
            <label className="field-label">Name (Arabic)</label>
            <input type="text" value={form.nameAr} onChange={e => set('nameAr', e.target.value)}
              placeholder="عرض العائلة" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4832a] text-right" dir="rtl" />
          </div>
          <div>
            <label className="field-label">What's included (English)</label>
            <textarea value={form.descriptionEn} onChange={e => set('descriptionEn', e.target.value)}
              rows={2} placeholder="Pasta + Salad + Drinks…" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4832a] resize-none" />
          </div>
          <div>
            <label className="field-label">What's included (Arabic)</label>
            <textarea value={form.descriptionAr} onChange={e => set('descriptionAr', e.target.value)}
              rows={2} placeholder="باستا + سلطة + مشروبات…" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4832a] resize-none text-right" dir="rtl" />
          </div>
          <div>
            <label className="field-label">Image URL</label>
            <input type="url" value={form.image} onChange={e => set('image', e.target.value)}
              placeholder="https://…" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4832a]" />
            {form.image && (
              <img src={form.image} alt="" className="mt-2 h-20 w-full object-cover rounded-xl bg-gray-100"
                onError={e => { e.target.style.display = 'none'; }} />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Saving text (EN)</label>
              <input type="text" value={form.savingEn} onChange={e => set('savingEn', e.target.value)}
                placeholder="Save 16 QAR" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4832a]" />
            </div>
            <div>
              <label className="field-label">Saving text (AR)</label>
              <input type="text" value={form.savingAr} onChange={e => set('savingAr', e.target.value)}
                placeholder="وفّر 16 ريال" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4832a] text-right" dir="rtl" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm">Cancel</button>
          <button
            onClick={() => { if (form.nameEn.trim()) { onSave(form); } }}
            disabled={!form.nameEn.trim()}
            className="flex-1 py-2.5 rounded-xl bg-[#d4832a] hover:bg-[#b8651f] disabled:bg-gray-200 text-white font-bold text-sm flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Offer
          </button>
        </div>
        <style>{`.field-label { display: block; font-size: 0.75rem; font-weight: 600; color: #6b7280; margin-bottom: 4px; }`}</style>
      </div>
    </div>
  );
}

export default function OffersManagement() {
  const [offers,  setOffers]  = useState([]);
  const [editing, setEditing] = useState(null);
  const [isNew,   setIsNew]   = useState(false);

  const load = useCallback(() => {
    const { items } = getLiveMenu(BASE_ITEMS, BASE_CATS, true);
    setOffers(items.filter(i => i.category === 'offers'));
  }, []);

  useEffect(() => {
    load();
    window.addEventListener('pa_menu_update', load);
    return () => window.removeEventListener('pa_menu_update', load);
  }, [load]);

  const isCustom = (id) => getCustomItems().some(i => i.id === id);

  function handleToggleHidden(offer) {
    setItemHidden(offer.id, !offer._hidden);
  }

  function handleNew() {
    setEditing({ ...EMPTY_OFFER, id: 'offer-' + Date.now().toString(36) });
    setIsNew(true);
  }

  function handleEdit(offer) {
    setEditing({ ...offer });
    setIsNew(false);
  }

  function handleSave(form) {
    const custom = getCustomItems();
    if (isNew || isCustom(form.id)) {
      const without = custom.filter(i => i.id !== form.id);
      saveCustomItems([{ ...form, sizes: form.sizes.map(s => ({ ...s, price: Number(s.price) })) }, ...without]);
    } else {
      const { id, _hidden, ...rest } = form;
      setItemOverride(id, rest);
      if (_hidden !== undefined) setItemHidden(id, _hidden);
    }
    setEditing(null);
  }

  function handleDelete(offer) {
    if (!window.confirm(`Delete offer "${offer.nameEn}"?`)) return;
    const custom = getCustomItems().filter(i => i.id !== offer.id);
    saveCustomItems(custom);
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Offers</h1>
          <p className="text-gray-400 text-sm mt-0.5">{offers.length} active offers</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          New Offer
        </button>
      </div>

      {offers.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No offers yet</p>
        </div>
      )}

      <div className="space-y-3">
        {offers.map(offer => (
          <div
            key={offer.id}
            className={`bg-white rounded-2xl border overflow-hidden transition-all
              ${offer._hidden ? 'opacity-50 border-gray-200' : 'border-gray-100 shadow-sm'}`}
          >
            <div className="flex items-center gap-3 p-4">
              {/* Image */}
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {offer.image
                  ? <img src={offer.image} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">🔥</div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-gray-800">{offer.nameEn}</p>
                  {offer._hidden && (
                    <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">HIDDEN</span>
                  )}
                  {isCustom(offer.id) && (
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">CUSTOM</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{offer.descriptionEn}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm font-bold text-[#d4832a]">
                    {offer.sizes[0]?.price} QAR
                  </span>
                  {offer.originalPrice > 0 && (
                    <span className="text-xs text-gray-400 line-through">
                      {offer.originalPrice} QAR
                    </span>
                  )}
                  {offer.savingEn && (
                    <span className="text-xs font-bold text-green-600">{offer.savingEn}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleToggleHidden(offer)}
                  className={`p-2 rounded-xl transition-colors
                    ${offer._hidden ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                  title={offer._hidden ? 'Show offer' : 'Hide offer'}
                >
                  {offer._hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleEdit(offer)}
                  className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-[#faefd9] hover:text-[#d4832a] transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                {isCustom(offer.id) && (
                  <button
                    onClick={() => handleDelete(offer)}
                    className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <OfferModal offer={editing} onSave={handleSave} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
