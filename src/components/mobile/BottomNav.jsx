import React from 'react';
import { Home, Search, ClipboardList, User } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useLang } from '../../contexts/LangContext';

export default function BottomNav() {
  const { activeScreen, setActiveScreen } = useApp();
  const { tr } = useLang();

  const navItems = [
    { id: 'menu',    label: tr.nav.menu,    Icon: Home },
    { id: 'search',  label: tr.nav.search,  Icon: Search },
    { id: 'orders',  label: tr.nav.orders,  Icon: ClipboardList },
    { id: 'profile', label: tr.nav.profile, Icon: User },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 glass border-t border-gray-100 safe-area-bottom">
      <div className="flex pb-safe">
        {navItems.map(({ id, label, Icon }) => {
          const active = activeScreen === id;
          return (
            <button
              key={id}
              onClick={() => setActiveScreen(id)}
              className="relative flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5"
            >
              <Icon
                className={`w-5 h-5 transition-colors ${active ? 'text-brand-600' : 'text-gray-400'}`}
                strokeWidth={active ? 2.5 : 1.75}
              />
              <span className={`text-[10px] font-medium transition-colors ${active ? 'text-brand-600' : 'text-gray-400'}`}>
                {label}
              </span>
              {active && (
                <span className="absolute bottom-0 inset-x-1/4 h-0.5 bg-brand-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
