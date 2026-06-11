import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Eye, EyeOff, Trash2, X, GripVertical, Save } from 'lucide-react';
import {
  getLiveMenu, setCatHidden, getCustomCats, saveCustomCats,
} from '../adminStore';
import { categories as BASE_CATS } from '../../data/menuData';

const EMOJIS = ['🍝','🍕','🥗','🥤','🍮','🧒','🥙','🫕','⭐','✨','🔥','🆕','🍔','🍟','🥩','🍜','🥘','🫔'];

function AddCatModal({ onSave, onClose }) {
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [emoji,  setEmoji]  = useState('🍝');

  function handleSave() {
    if (!nameEn.trim()) return;
    onSave({
      id: 'cat-' + Date.now().toString(36),
      emoji,
      nameEn: nameEn.trim(),
      nameAr: nameAr.trim() || nameEn.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">New Section</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {/* Emoji picker */}
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(em => (
                <button
                  key={em}
                  onClick={() => setEmoji(em)}
                  className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all
                    ${emoji === em ? 'bg-[#faefd9] ring-2 ring-[#d4832a]' : 'hover:bg-gray-100'}`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Section Name (English) *</label>
            <input
              type="text"
              value={nameEn}
              onChange={e => setNameEn(e.target.value)}
              placeholder="e.g. Grills"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4832a]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Section Name (Arabic)</label>
            <input
              type="text"
              value={nameAr}
              onChange={e => setNameAr(e.target.value)}
              placeholder="مثال: مشويات"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4832a] text-right"
              dir="rtl"
            />
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!nameEn.trim()}
            className="flex-1 py-2.5 rounded-xl bg-[#d4832a] hover:bg-[#b8651f] disabled:bg-gray-200 text-white font-bold text-sm flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Create Section
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SectionManagement() {
  const [cats,    setCats]    = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(() => {
    const { cats: c } = getLiveMenu([], BASE_CATS, true);
    setCats(c);
  }, []);

  useEffect(() => {
    load();
    window.addEventListener('pa_menu_update', load);
    return () => window.removeEventListener('pa_menu_update', load);
  }, [load]);

  function handleToggle(cat) {
    setCatHidden(cat.id, !cat._hidden);
  }

  function handleDeleteCustom(cat) {
    if (!window.confirm(`Delete section "${cat.nameEn || cat.id}"?`)) return;
    const custom = getCustomCats().filter(c => c.id !== cat.id);
    saveCustomCats(custom);
  }

  function handleAdd(cat) {
    const existing = getCustomCats();
    saveCustomCats([...existing, cat]);
    setShowAdd(false);
  }

  const isCustom = (id) => getCustomCats().some(c => c.id === id);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Sections</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Control which sections appear on the customer menu
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-[#d4832a] hover:bg-[#b8651f] text-white
                     font-bold px-4 py-2.5 rounded-xl text-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          New Section
        </button>
      </div>

      <div className="space-y-2">
        {cats.map(cat => (
          <div
            key={cat.id}
            className={`bg-white rounded-2xl border flex items-center gap-3 px-4 py-3.5 transition-all
              ${cat._hidden ? 'opacity-50 border-gray-200' : 'border-gray-100 shadow-sm'}`}
          >
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
              {cat.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-800 text-sm">
                  {cat.nameEn || cat.id}
                </p>
                {cat._hidden && (
                  <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                    HIDDEN
                  </span>
                )}
                {isCustom(cat.id) && (
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                    CUSTOM
                  </span>
                )}
              </div>
              {cat.nameAr && cat.nameAr !== cat.nameEn && (
                <p className="text-xs text-gray-400 mt-0.5" dir="rtl">{cat.nameAr}</p>
              )}
              <p className="text-xs text-gray-400">ID: {cat.id}</p>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => handleToggle(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                  ${cat._hidden
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
              >
                {cat._hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {cat._hidden ? 'Show' : 'Hide'}
              </button>

              {isCustom(cat.id) && (
                <button
                  onClick={() => handleDeleteCustom(cat)}
                  className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="Delete section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAdd && <AddCatModal onSave={handleAdd} onClose={() => setShowAdd(false)} />}
    </div>
  );
}
