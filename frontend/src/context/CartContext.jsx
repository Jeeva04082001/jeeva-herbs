import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

const GUEST_CART_KEY = "jeeva_guest_cart";

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  /*
    Create a separate localStorage key for each user.

    Example:
    User ID 1 -> jeeva_cart_user_1
    User ID 2 -> jeeva_cart_user_2
  */
  const cartStorageKey = user?.id
    ? `jeeva_cart_user_${user.id}`
    : GUEST_CART_KEY;

  /*
    Load the correct cart whenever authentication state changes.

    IMPORTANT:
    We wait until AuthContext finishes checking the user.
  */
  useEffect(() => {
    if (authLoading) {
      return;
    }

    const savedCart = localStorage.getItem(cartStorageKey);

    try {
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
    } catch (error) {
      console.error("Failed to load cart:", error);
      setCartItems([]);
    }

    setCartLoaded(true);
  }, [cartStorageKey, authLoading]);

  /*
    Save cart to the currently active user's cart.

    We don't save anything while authentication
    is still being checked.
  */
  useEffect(() => {
    if (authLoading || !cartLoaded) {
      return;
    }

    localStorage.setItem(
      cartStorageKey,
      JSON.stringify(cartItems)
    );
  }, [cartItems, cartStorageKey, authLoading, cartLoaded]);

  function addToCart(product, quantity = 1, variant = null) {
    const cartKey = variant
      ? `${product.id}-${variant.id}`
      : `${product.id}`;

    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.cartKey === cartKey
      );

      if (existing) {
        return prev.map((item) =>
          item.cartKey === cartKey
            ? {
              ...item,
              quantity: item.quantity + quantity,
            }
            : item
        );
      }

      return [
        ...prev,
        {
          ...product,

          cartKey,

          variant_id: variant?.id || null,
          unit: variant?.unit || product.unit,
          price: variant?.price ?? product.price,
          stock: variant?.stock ?? product.stock,

          quantity,
        },
      ];
    });
  }

  function removeFromCart(cartKey) {
    setCartItems((prev) =>
      prev.filter((item) => item.cartKey !== cartKey)
    );
  }

  function updateQuantity(cartKey, quantity) {
    if (quantity <= 0) {
      removeFromCart(cartKey);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.cartKey === cartKey
          ? {
            ...item,
            quantity: Math.min(quantity, item.stock),
          }
          : item
      )
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartSubtotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartSubtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}