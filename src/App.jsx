import React from 'react';
import MobileHeader from './components/mobile/MobileHeader';
import StickyCartBar from './components/mobile/StickyCartBar';
import MenuScreen from './components/MenuScreen';
import CartDrawer from './components/CartDrawer';

export default function App() {
  return (
    <div className="min-h-screen bg-cream">
      <MobileHeader />
      <div style={{ paddingTop: 160 }}>
        <MenuScreen />
      </div>
      <StickyCartBar />
      <CartDrawer />
    </div>
  );
}
