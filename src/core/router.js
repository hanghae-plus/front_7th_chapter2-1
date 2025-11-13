import { BASE_PATH } from '@/constants';
import Layout from '@/pages/layout';
import NotFound from '@/pages/not-found';

/**
 * BASE_PATH를 제거한 경로를 반환
 * @param {string} pathname 전체 경로
 * @returns {string} BASE_PATH가 제거된 경로
 */
const stripBasePath = (pathname) => pathname.replace(new RegExp(`^${BASE_PATH}`), '') || '/';

/**
 * 경로를 세그먼트 배열로 파싱
 * @param {string} path 경로 문자열
 * @returns {string[]} 세그먼트 배열
 */
const parsePathSegments = (path) => path.split('/').filter(Boolean);

/**
 * 라우트 패턴과 현재 경로를 매칭하고 파라미터를 추출
 * @param {string} routePath 라우트 패턴 (예: '/product/:id')
 * @param {string} currentPath 현재 경로 (예: '/product/123')
 * @returns {Record<string, string> | null} 파라미터 객체 또는 null
 */
const matchPathPattern = (routePath, currentPath) => {
  const routeSegments = parsePathSegments(routePath);
  const pathSegments = parsePathSegments(currentPath);

  if (routeSegments.length !== pathSegments.length) return null;

  /** @type {Record<string, string>} */
  const params = {};

  for (let i = 0; i < routeSegments.length; i++) {
    const routePart = routeSegments[i];
    const pathPart = pathSegments[i];

    if (routePart.startsWith(':')) {
      params[routePart.slice(1)] = pathPart;
      continue;
    }
    if (routePart !== pathPart) return null;
  }

  return params;
};

export class Router {
  /** @type {HTMLElement} */ $root;
  /** @type {Route[]} */ routes;
  /** @type {Route | null} */ currentRoute;
  /** @type {Component | null} */ currentPageInstance;

  /**
   * @param {HTMLElement} root 라우터가 렌더링될 루트 엘리먼트
   * @param {Route[]} routes 라우트 정의 배열
   */
  constructor(root, routes) {
    if (!root) throw new Error('Router requires a valid root element.');
    this.$root = root;
    this.routes = routes;
    this.currentRoute = null;
    this.currentPageInstance = null;

    window.addEventListener('popstate', () => this.render());
    document.addEventListener('click', this._handleLinkClick.bind(this), true);
    this.render();
  }

  /**
   * 링크 클릭 이벤트를 전역으로 처리
   * @param {MouseEvent} event 클릭 이벤트
   * @private
   */
  _handleLinkClick(event) {
    const $link = /** @type {HTMLElement} */ (event.target).closest('a');
    if (!$link) return;

    const href = $link.getAttribute('href');
    if (!href) return;

    let url;
    try {
      url = new URL(href, location.origin);
    } catch {
      return;
    }

    if (url.origin !== location.origin) return;

    const path = `${stripBasePath(url.pathname)}${url.search}${url.hash}`;
    const currentPath = `${stripBasePath(location.pathname)}${location.search}${location.hash}`;

    event.preventDefault();

    if (path === currentPath) return;
    this.navigate(path);
  }

  /**
   * 현재 pathname에 맞는 라우트를 찾음
   * @param {string} pathname 현재 경로
   * @returns {RouteMatch | null} 매칭된 라우트와 파라미터 또는 null
   * @private
   */
  _resolveRoute(pathname) {
    const path = stripBasePath(pathname);
    for (const route of this.routes) {
      const params = matchPathPattern(route.path, path);
      if (params) return { route, params };
    }
    return null;
  }

  /**
   * 현재 경로에 맞는 페이지를 렌더링
   * @returns {void}
   */
  render() {
    if (!this.$root) return;

    if (this.currentPageInstance && typeof this.currentPageInstance.destroy === 'function') {
      this.currentPageInstance.destroy();
    }
    this.currentPageInstance = null;

    const match = this._resolveRoute(location.pathname);

    this.$root.innerHTML = '';
    const $placeholder = document.createElement('div');
    this.$root.appendChild($placeholder);

    if (!match) {
      this.currentPageInstance = new Layout($placeholder, { children: NotFound });
      return;
    }

    const { route, params } = match;
    const { component: PageComponent, layout } = route;

    if (layout) {
      this.currentPageInstance = new Layout($placeholder, {
        children: PageComponent,
        props: { params },
      });
    } else {
      this.currentPageInstance = new PageComponent($placeholder, { params });
    }

    this.currentRoute = route;
  }

  /**
   * 페이지 이동 (history API 이용)
   * @param {string} path 이동할 경로
   * @returns {void}
   */
  navigate(path) {
    history.pushState({}, '', `${BASE_PATH}${path}`);
    this.render();
  }
}
