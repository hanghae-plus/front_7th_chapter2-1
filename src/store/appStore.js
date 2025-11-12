const createHomepageState = () => ({
  filters: {},
  products: [],
  pagination: null,
  isLoadingMore: false,
});

let state = {
  homepage: createHomepageState(),
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

export const getState = () => state;

export const getHomepageState = () => state.homepage;

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
