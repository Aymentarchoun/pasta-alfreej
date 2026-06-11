import React, { useState } from 'react';
import {
  Radio, UtensilsCrossed, LayoutGrid, Tag,
  History, Settings, LogOut, ChevronRight,
  Menu, X, Sliders,
} from 'lucide-react';
import { clearAuth } from './adminStore';
import LiveOrders        from './pages/LiveOrders';
import MenuManagement    from './pages/MenuManagement';
import SectionManagement from './pages/SectionManagement';
import OffersManagement  from './pages/OffersManagement';
import OrderHistory      from './pages/OrderHistory';
import UserSettings      from './pages/UserSettings';
import ExtrasManagement  from './pages/ExtrasManagement';

const NAV = [
  { id: 'live',     label: 'Live Orders',    icon: Radio,          color: 'text-green-400' },
  { id: 'menu',     label: 'Menu Items',     icon: UtensilsCrossed,color: 'text-orange-400' },
  { id: 'sections', label: 'Sections',       icon: LayoutGrid,     color: 'text-blue-400' },
  { id: 'offers',   label: 'Offers',         icon: Tag,            color: 'text-red-400' },
  { id: 'extras',   label: 'Extras',         icon: Sliders,        color: 'text-teal-400' },
  { id: 'history',  label: 'Order History',  icon: History,        color: 'text-purple-400' },
  { id: 'settings', label: 'My Account',     icon: Settings,       color: 'text-gray-400' },
];

export default function AdminApp({ session, onLogout }) {
  const [page,        setPage]        = useState('live');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function logout() {
    clearAuth();
    onLogout();
  }

  const pages = {
    live:     <LiveOrders        session={session} />,
    menu:     <MenuManagement    session={session} />,
    sections: <SectionManagement session={session} />,
    offers:   <OffersManagement  session={session} />,
    extras:   <ExtrasManagement  session={session} />,
    history:  <OrderHistory      session={session} />,
    settings: <UserSettings      session={session} />,
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-[#1a1a1a] text-white">
      {/* Header */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#d4832a] rounded-xl flex items-center justify-center flex-shrink-0">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight truncate">Pasta Alfreej</p>
            <p className="text-gray-400 text-xs truncate">{session.displayName}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ id, label, icon: Icon, color }) => {
          const active = page === id;
          return (
            <button
              key={id}
              onClick={() => { setPage(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium
                ${active
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? color : 'text-gray-500'}`} />
              <span className="flex-1 text-left">{label}</span>
              {active && <ChevronRight className="w-3 h-3 text-white/40" />}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400
                     hover:bg-red-500/10 transition-all text-sm font-medium"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-56 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-64 flex-shrink-0 z-10">
            <Sidebar />
          </div>
          <button
            className="absolute top-4 right-4 text-white bg-white/10 rounded-full p-1.5"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] text-white flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-1">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm flex-1">
            {NAV.find(n => n.id === page)?.label}
          </span>
          <span className="text-gray-400 text-xs">{session.displayName}</span>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {pages[page]}
        </div>
      </div>
    </div>
  );
}
