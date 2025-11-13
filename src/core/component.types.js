/**
 * @typedef {Record<string, any>} ComponentProps
 * 컴포넌트의 props 타입
 */

/**
 * @typedef {Record<string, any>} ComponentState
 * 컴포넌트의 state 타입
 */

/**
 * @typedef {import('./component').default} Component
 * 컴포넌트 클래스 타입
 */

/**
 * @typedef {Object} EventBinding
 * @property {string} selector CSS 선택자
 * @property {Component} component 컴포넌트 인스턴스
 * @property {(event: Event) => void} callback 이벤트 핸들러 함수
 */
