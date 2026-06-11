import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AdminMain from './admin/AdminMain';
import { CartProvider } from './contexts/CartContext';
import { AppProvider } from './contexts/AppContext';
import { LangProvider } from './contexts/LangContext';
import './index.css';

// Route to admin dashboard when path starts with /admin
const isAdmin = window.location.pathname.startsWith('/admin');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isAdmin ? (
      <AdminMain />
    ) : (
      <LangProvider>
        <AppProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AppProvider>
      </LangProvider>
    )}
  </React.StrictMode>
);
