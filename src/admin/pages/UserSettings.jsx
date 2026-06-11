import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Save, CheckCircle } from 'lucide-react';
import { getUsers, saveUserField, setAuth, getAuth } from '../adminStore';

export default function UserSettings({ session }) {
  const users = getUsers();
  const me    = users[session.username] || {};

  const [displayName, setDisplayName] = useState(me.displayName || session.displayName);
  const [currentPw,   setCurrentPw]   = useState('');
  const [newPw,       setNewPw]       = useState('');
  const [confirmPw,   setConfirmPw]   = useState('');
  const [showCur,     setShowCur]     = useState(false);
  const [showNew,     setShowNew]     = useState(false);

  const [nameMsg, setNameMsg]   = useState(null); // { ok, text }
  const [pwMsg,   setPwMsg]     = useState(null);

  function handleSaveName() {
    if (!displayName.trim()) return;
    saveUserField(session.username, { displayName: displayName.trim() });
    // Update session in storage
    const auth = getAuth();
    if (auth) setAuth({ ...auth, displayName: displayName.trim() });
    setNameMsg({ ok: true, text: 'Display name updated!' });
    setTimeout(() => setNameMsg(null), 3000);
  }

  function handleChangePw() {
    const current = (me.password || '');
    if (currentPw !== current) {
      setPwMsg({ ok: false, text: 'Current password is incorrect.' });
      return;
    }
    if (newPw.length < 6) {
      setPwMsg({ ok: false, text: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ ok: false, text: 'New passwords do not match.' });
      return;
    }
    saveUserField(session.username, { password: newPw });
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    setPwMsg({ ok: true, text: 'Password changed successfully!' });
    setTimeout(() => setPwMsg(null), 3000);
  }

  return (
    <div className="p-4 sm:p-6 max-w-lg">
      <h1 className="text-2xl font-black text-gray-900 mb-6">My Account</h1>

      {/* Profile info card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-[#faefd9] rounded-2xl flex items-center justify-center">
            <User className="w-6 h-6 text-[#d4832a]" />
          </div>
          <div>
            <p className="font-bold text-gray-900">{session.displayName}</p>
            <p className="text-sm text-gray-400">@{session.username} · {session.role}</p>
          </div>
        </div>

        {/* Display name */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 block">Display Name</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#d4832a] focus:border-transparent"
            />
            <button
              onClick={handleSaveName}
              disabled={!displayName.trim() || displayName.trim() === me.displayName}
              className="flex items-center gap-1.5 bg-[#d4832a] hover:bg-[#b8651f] disabled:bg-gray-200
                         text-white disabled:text-gray-400 font-bold px-4 py-2.5 rounded-xl text-sm transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              Save
            </button>
          </div>
          {nameMsg && (
            <div className={`flex items-center gap-2 text-sm rounded-xl px-3 py-2
              ${nameMsg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {nameMsg.text}
            </div>
          )}
        </div>
      </div>

      {/* Change password card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-5">
          <Lock className="w-5 h-5 text-gray-600" />
          <h2 className="font-bold text-gray-900">Change Password</h2>
        </div>

        <div className="space-y-3">
          {/* Current password */}
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showCur ? 'text' : 'password'}
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 pr-10 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#d4832a] focus:border-transparent"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowCur(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showCur ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 pr-10 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#d4832a] focus:border-transparent"
                placeholder="Min. 6 characters"
              />
              <button type="button" onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm new password */}
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#d4832a] focus:border-transparent"
              placeholder="Repeat new password"
            />
          </div>

          {/* Message */}
          {pwMsg && (
            <div className={`flex items-center gap-2 text-sm rounded-xl px-3 py-2
              ${pwMsg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {pwMsg.text}
            </div>
          )}

          <button
            onClick={handleChangePw}
            disabled={!currentPw || !newPw || !confirmPw}
            className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#333]
                       disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold
                       py-3 rounded-xl text-sm transition-all mt-1"
          >
            <Lock className="w-4 h-4" />
            Change Password
          </button>
        </div>
      </div>

      {/* Session info */}
      <div className="mt-4 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
        <p className="text-xs text-gray-400 font-medium">Branch Access</p>
        <p className="text-sm font-semibold text-gray-700 mt-0.5">
          {session.branch
            ? session.branch.charAt(0).toUpperCase() + session.branch.slice(1) + ' only'
            : 'All Branches'}
        </p>
      </div>
    </div>
  );
}
