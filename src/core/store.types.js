/**
 * @typedef {Object} Action
 * @property {string} type 액션 타입
 * @property {any} [payload] 액션 페이로드 (선택)
 */

/**
 * @typedef {Function} Reducer
 * @param {Record<string, any>} state 현재 상태
 * @param {Action} [action] 디스패치된 액션
 * @returns {Record<string, any>} 새로운 상태
 */

/**
 * @typedef {Object} Store
 * @property {() => Record<string, any>} getState 현재 상태를 반환하는 함수 (읽기 전용)
 * @property {(action: Action) => void} dispatch 액션을 디스패치하여 상태를 변경하는 함수
 */
