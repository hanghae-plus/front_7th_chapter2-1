/**
 * @typedef {Object} PersistentStoreOptions
 * @property {string} [key] localStorage에 저장할 키
 * @property {Record<string, any>} [defaultState] 기본 상태 (localStorage에 값이 없을 때 사용)
 */

/**
 * @typedef {Object} PersistentStore
 * @property {() => Record<string, any>} getState 현재 상태를 반환하는 함수 (읽기 전용)
 * @property {(action: Action) => void} dispatch 액션을 디스패치하여 상태를 변경하는 함수
 */
