/**
 * @typedef {() => void} ObserverCallback
 * Observer로 등록되는 콜백 함수 타입
 */

/**
 * @typedef {Record<string, any>} ObservableObject
 * Observable로 감싼 객체 타입
 */

/**
 * @typedef {Record<string, Set<() => void>>} ObserverMap
 * 각 속성별 observer 목록을 관리하는 맵 타입
 */
