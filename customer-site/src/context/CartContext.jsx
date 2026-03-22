import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import * as cartService from '../services/cartService';
import api from '../services/api';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const mountedRef = useRef(false);

  useEffect(() => {
    const savedCart = cartService.getCart();
    setCart(savedCart);

    let savedStore = null;
    const savedStoreJson = localStorage.getItem('converse_selected_store');
    if (savedStoreJson) {
      try { savedStore = JSON.parse(savedStoreJson); } catch { /* ignore */ }
    }
    if (savedStore) setSelectedStore(savedStore);

    const savedMethod = localStorage.getItem('converse_delivery_method');
    if (savedMethod) setDeliveryMethod(savedMethod);

    if (savedCart.length === 0 && !savedStore) {
      mountedRef.current = true;
      return;
    }

    const validateStoredData = async () => {
      try {
        if (savedCart.length > 0) {
          const { data } = await api.get('/products');
          const validIds = new Set((data.products || []).map((p) => p._id));
          const validCart = savedCart.filter((item) => validIds.has(item.productId));
          if (validCart.length !== savedCart.length) {
            cartService.clearCart();
            for (const item of validCart) cartService.addToCart(item);
            setCart(validCart);
          }
        }

        if (savedStore?._id) {
          try {
            const { data } = await api.get(`/stores/${savedStore._id}`);
            if (data.store) {
              setSelectedStore(data.store);
            }
          } catch (storeErr) {
            if (storeErr.response?.status === 404) {
              setSelectedStore(null);
              localStorage.removeItem('converse_selected_store');
            }
          }
        }
      } catch {
        // Validation failed - leave data as-is, checkout will handle errors
      } finally {
        mountedRef.current = true;
      }
    };

    validateStoredData();
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
