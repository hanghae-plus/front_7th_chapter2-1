import { createStore } from '@/core/store';

/**
 * localStorage에서 상태를 로드합니다.
 * @param {string} key localStorage 키
 * @param {any} defaultValue 저장된 값이 없을 때 반환할 기본값
 * @returns {any} 로드된 상태 또는 기본값
 */
export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error);
  }
  return defaultValue;
};

/**
 * 객체를 직렬화 가능한 형태로 변환합니다.
 * frozenState 같은 getter만 있는 객체도 처리합니다.
 * @param {any} obj 변환할 객체
 * @returns {any} 직렬화 가능한 객체
 */
const toSerializable = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toSerializable);

  const ownKeys = Object.keys(obj);
  const allPropertyNames = Object.getOwnPropertyNames(obj);

  if (ownKeys.length === 0 && allPropertyNames.length > 0) {
    const result = {};
    for (const key of allPropertyNames) {
      result[key] = toSerializable(obj[key]);
    }
    return result;
  }

  const result = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = toSerializable(obj[key]);
    }
  }
  return result;
};

/**
 * localStorage에 상태를 저장합니다.
 * @param {string} key localStorage 키
 * @param {any} value 저장할 값
 */
export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(toSerializable(value)));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
};

/**
 * localStorage에서 특정 키를 제거합니다.
 * @param {string} key localStorage 키
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove ${key} from localStorage:`, error);
  }
};

/**
 * localStorage의 모든 항목을 제거합니다.
 */
export const clearStorage = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error(`Failed to clear localStorage:`, error);
  }
};

/**
 * localStorage에 자동으로 persist되는 Store를 생성합니다.
 * @param {Reducer} reducer (state, action) => newState 형태의 reducer 함수
 * @param {PersistentStoreOptions} [options={}] 옵션 객체
 * @returns {PersistentStore} { getState, dispatch } 형태의 Store 객체
 */
export const createPersistentStore = (reducer, options = {}) => {
  const { key, defaultState } = options;
  const initialState =
    key && defaultState !== undefined
      ? loadFromStorage(key, defaultState)
      : reducer(undefined, { type: '__INIT__' });

  const { getState, dispatch } = createStore((state = initialState, action = {}) => {
    const newState = reducer(state, action);

    Object.keys(newState).forEach((k) => {
      state[k] = newState[k];
    });

    Object.keys(state).forEach((k) => {
      if (!(k in newState)) {
        delete state[k];
      }
    });

    return state;
  });

  const wrappedDispatch = (action) => {
    dispatch(action);
    if (key) saveToStorage(key, getState());
  };

  return { getState, dispatch: wrappedDispatch };
};
