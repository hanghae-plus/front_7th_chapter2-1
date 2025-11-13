import { createPersistentStore } from '@/core/storage';

const STORAGE_KEY = 'shopping_cart';

export const ADD_ITEM = 'ADD_ITEM';
export const REMOVE_ITEM = 'REMOVE_ITEM';
export const CLEAR_CART = 'CLEAR_CART';
export const INCREASE_QUANTITY = 'INCREASE_QUANTITY';
export const DECREASE_QUANTITY = 'DECREASE_QUANTITY';
export const TOGGLE_ITEM_CHECK = 'TOGGLE_ITEM_CHECK';
export const TOGGLE_ALL_ITEMS = 'TOGGLE_ALL_ITEMS';

const initState = { items: [] };

export const cartStore = createPersistentStore(
  (state = { ...initState }, action = {}) => {
    switch (action.type) {
      case ADD_ITEM: {
        const existingIndex = state.items.findIndex(
          ({ productId }) => productId === action.payload.productId
        );

        if (existingIndex !== -1) {
          return {
            ...state,
            items: state.items.map((item, index) =>
              index === existingIndex
                ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
                : item
            ),
          };
        }

        return {
          ...state,
          items: [
            ...state.items,
            { ...action.payload, quantity: action.payload.quantity || 1, checked: false },
          ],
        };
      }
      case REMOVE_ITEM:
        return {
          ...state,
          items: state.items.filter(({ productId }) => productId !== action.payload),
        };
      case CLEAR_CART:
        return { items: [] };
      case INCREASE_QUANTITY:
        return {
          ...state,
          items: state.items.map((item) =>
            item.productId === action.payload ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      case DECREASE_QUANTITY:
        return {
          ...state,
          items: state.items.map((item) =>
            item.productId === action.payload
              ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
              : item
          ),
        };
      case TOGGLE_ITEM_CHECK:
        return {
          ...state,
          items: state.items.map((item) =>
            item.productId === action.payload ? { ...item, checked: !item.checked } : item
          ),
        };
      case TOGGLE_ALL_ITEMS: {
        const allChecked = state.items.length && state.items.every(({ checked }) => checked);
        return { ...state, items: state.items.map((item) => ({ ...item, checked: !allChecked })) };
      }
      default:
        return state;
    }
  },
  { key: STORAGE_KEY, defaultState: initState }
);

export const addItem = (payload) => ({ type: ADD_ITEM, payload });
export const removeItem = (payload) => ({ type: REMOVE_ITEM, payload });
export const clearCart = () => ({ type: CLEAR_CART });
export const increaseQuantity = (payload) => ({ type: INCREASE_QUANTITY, payload });
export const decreaseQuantity = (payload) => ({ type: DECREASE_QUANTITY, payload });
export const toggleItemCheck = (payload) => ({ type: TOGGLE_ITEM_CHECK, payload });
export const toggleAllItems = () => ({ type: TOGGLE_ALL_ITEMS });
