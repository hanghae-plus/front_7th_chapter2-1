export const ADD_CART_LIST = "shopping_cart";

export const getLocalStorage = (key) => {
  if (!localStorage.getItem(key)) return [];

  return JSON.parse(localStorage.getItem(key));
};

export const setLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const removeLocalStorage = (key) => {
  localStorage.removeItem(key);
};
