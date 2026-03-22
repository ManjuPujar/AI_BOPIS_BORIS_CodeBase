import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as cartService from '../services/cartService';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');

  useEffect(() => {
    setCart(cartService.getCart());

    const savedStore = localStorage.getItem('converse_selected_store');
    if (savedStore) {
      try { setSelectedStore(JSON.parse(savedStore)); } catch { /* ignore */ }
    }

    const savedMethod = localStorage.getItem('converse_delivery_method');
    if (savedMethod) setDeliveryMethod(savedMethod);
  }, []);

  useEffect(() => {
    if (selectedStore) {
      localStorage.setItem('converse_selected_store', JSON.stringify(selectedStore));
    } else {
      localStorage.removeItem('converse_selected_store');
    }
  }, [selectedStore]);

  useEffect(() => {
    localStorage.setItem('converse_delivery_method', deliveryMethod);
  }, [deliveryMethod]);

  const addToCart = useCallback((item) => {
    const updated = cartService.addToCart(item);
    setCart([...updated]);
  }, []);

  const removeFromCart = useCallback((itemIndex) => {
    const updated = cartService.removeFromCart(itemIndex);
    setCart([...updated]);
  }, []);

  const updateQuantity = useCallback((itemIndex, qty) => {
    const updated = cartService.updateQuantity(itemIndex, qty);
    setCart([...updated]);
  }, []);

  const clearCart = useCallback(() => {
    cartService.clearCart();
    setCart([]);
    setSelectedStore(null);
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        selectedStore,
        setSelectedStore,
        deliveryMethod,
        setDeliveryMethod,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
