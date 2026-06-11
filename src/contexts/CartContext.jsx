import React, { createContext, useContext, useReducer } from 'react';

const CartContext = createContext(null);

const initialState = {
  items: [],        // { cartId, item, size, addons, mealUpsell, instructions, qty }
  dineMode: null,   // 'dine-in' | 'takeaway' | null
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const id = `${action.payload.item.id}-${Date.now()}`;
      return { ...state, items: [...state.items, { ...action.payload, cartId: id, qty: 1 }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.cartId !== action.payload) };
    case 'INC_QTY':
      return {
        ...state,
        items: state.items.map(i =>
          i.cartId === action.payload ? { ...i, qty: i.qty + 1 } : i
        ),
      };
    case 'DEC_QTY':
      return {
        ...state,
        items: state.items
          .map(i => i.cartId === action.payload ? { ...i, qty: i.qty - 1 } : i)
          .filter(i => i.qty > 0),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'SET_DINE_MODE':
      return { ...state, dineMode: action.payload };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const itemCount = state.items.reduce((sum, i) => sum + i.qty, 0);

  const subtotal = state.items.reduce((sum, i) => {
    const base = i.size.price;
    const addonsTotal = i.addons.reduce((a, addon) => a + addon.price, 0);
    const meal = i.mealUpsell ? 18 : 0;
    return sum + (base + addonsTotal + meal) * i.qty;
  }, 0);

  return (
    <CartContext.Provider value={{ ...state, dispatch, itemCount, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
