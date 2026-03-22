const CART_KEY = 'converse_cart';

const readCart = () => {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const writeCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  return cart;
};

export const getCart = () => readCart();

export const addToCart = (item) => {
  const cart = readCart();
  const existingIndex = cart.findIndex(
    (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
  );
  if (existingIndex >= 0) {
    cart[existingIndex].quantity += item.quantity || 1;
  } else {
    cart.push({
      productId: item.productId,
      sku: item.sku,
      productName: item.productName,
      size: item.size,
      color: item.color,
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice,
      image: item.image,
    });
  }
  return writeCart(cart);
};

export const removeFromCart = (itemIndex) => {
  const cart = readCart();
  cart.splice(itemIndex, 1);
  return writeCart(cart);
};

export const updateQuantity = (itemIndex, qty) => {
  const cart = readCart();
  if (cart[itemIndex]) {
    cart[itemIndex].quantity = Math.max(1, qty);
  }
  return writeCart(cart);
};

export const clearCart = () => writeCart([]);

export const getCartTotal = () => {
  const cart = readCart();
  return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
};
