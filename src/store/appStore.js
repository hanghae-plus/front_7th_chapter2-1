const createHomepageState = () => ({
  filters: {},
  products: [],
  pagination: null,
  isLoadingMore: false,
});

const createCartState = () => ({
  items: [],
});

let state = {
  homepage: createHomepageState(),
  cart: createCartState(),
};

const listeners = new Set();

const notify = () => {
  listeners.forEach((listener) => {
    try {
      listener(state);
    } catch (error) {
      console.error("appStore listener execution failed.", error);
    }
  });
};

const updateHomepage = (updater) => {
  const currentHomepage = state.homepage;
  const nextHomepage = typeof updater === "function" ? updater(currentHomepage) : updater;

  if (!nextHomepage || nextHomepage === currentHomepage) {
    return;
  }

  state = {
    ...state,
    homepage: nextHomepage,
  };

  notify();
};

const updateCart = (updater) => {
  const currentCart = state.cart;
  const nextCart = typeof updater === "function" ? updater(currentCart) : updater;

  if (!nextCart || nextCart === currentCart) {
    return;
  }

  state = {
    ...state,
    cart: nextCart,
  };

  notify();
};

export const getState = () => state;

export const getHomepageState = () => state.homepage;

export const getCartState = () => state.cart;

export const subscribe = (listener) => {
  if (typeof listener !== "function") {
    return () => {};
  }

  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const resetHomepageState = () => {
  updateHomepage(createHomepageState());
};

export const setHomepageState = ({ filters, products, pagination, isLoadingMore }) => {
  updateHomepage((prev) => ({
    ...prev,
    ...(filters !== undefined ? { filters } : {}),
    ...(products !== undefined ? { products } : {}),
    ...(pagination !== undefined ? { pagination } : {}),
    ...(isLoadingMore !== undefined ? { isLoadingMore } : {}),
  }));
};

export const appendHomepageProducts = (newProducts, pagination) => {
  updateHomepage((prev) => ({
    ...prev,
    products: prev.products.concat(newProducts ?? []),
    pagination: pagination ?? prev.pagination,
  }));
};

export const setHomepageLoadingMore = (value) => {
  updateHomepage((prev) => {
    if (prev.isLoadingMore === value) {
      return prev;
    }

    return {
      ...prev,
      isLoadingMore: value,
    };
  });
};

export const resetCartState = () => {
  updateCart(createCartState());
};

export const appendCartProduct = ({ id, title, price, image }) => {
  if (!id) {
    return;
  }

  updateCart((prev) => {
    const existingIndex = prev.items.findIndex((item) => item.id === id);

    if (existingIndex >= 0) {
      const items = prev.items.map((item, index) =>
        index === existingIndex
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      );

      return {
        ...prev,
        items,
      };
    }

    const nextItem = {
      id,
      title,
      price,
      image,
      quantity: 1,
    };

    return {
      ...prev,
      items: prev.items.concat(nextItem),
    };
  });
};
