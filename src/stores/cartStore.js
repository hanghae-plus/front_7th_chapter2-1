import { createStore } from "../core/createStore";

export const cartStore = createStore((set, get) => {
  const STORAGE_KEY = "shopping_cart";

  const loadFromStorage = () => {
    try {
      const cartData = localStorage.getItem(STORAGE_KEY);
      return cartData ? JSON.parse(cartData) : { items: [] };
    } catch (error) {
      console.error("장바구니 데이터 읽기 실패:", error);
      return null;
    }
  };

  const saveToStorage = (state) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: state.items }));
    } catch (error) {
      console.error("장바구니 데이터 저장 실패:", error);
    }
  };

  return {
    items: loadFromStorage()?.items || [],

    addItem: (productId, quantity = 1, product = null) => {
      if (!product) {
        console.error("상품 정보가 필요합니다");
        return;
      }

      const { items } = get();
      const existingItemIndex = items.findIndex((item) => item.id === productId);

      let newItems;
      if (existingItemIndex !== -1) {
        newItems = items.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: item.quantity + quantity } : item,
        );
      } else {
        newItems = [
          ...items,
          {
            id: String(product.productId || productId),
            title: product.title,
            image: product.image,
            price: Number(product.lprice || product.price || 0),
            quantity: quantity,
            selected: false,
          },
        ];
      }

      set({ items: newItems });
      saveToStorage(get());
    },

    removeItem: (productId) => {
      const { items } = get();
      const newItems = items.filter((item) => item.id !== productId);
      set({ items: newItems });
      saveToStorage(get());
    },

    clear: () => {
      set({ items: [] });
      saveToStorage(get());
    },

    updateItemQuantity: (productId, quantity) => {
      const { items } = get();
      const newItems = items.map((item) =>
        item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item,
      );
      set({ items: newItems });
      saveToStorage(get());
    },

    removeItems: (productIds) => {
      const { items } = get();
      const newItems = items.filter((item) => !productIds.includes(item.id));
      set({ items: newItems });
      saveToStorage(get());
    },

    getItemCount: () => {
      return get().items.length;
    },
  };
});
