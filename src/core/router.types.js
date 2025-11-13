/**
 * @typedef {Object} Route
 * @property {string} path 라우트 경로 (예: '/product/:id')
 * @property {any} component 페이지 컴포넌트 클래스
 * @property {boolean} [layout] 레이아웃 사용 여부
 */

/**
 * @typedef {Object} RouteMatch
 * @property {Route} route 매칭된 라우트
 * @property {Record<string, string>} params 경로 파라미터
 */
