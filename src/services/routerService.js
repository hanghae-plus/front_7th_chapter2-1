/**
 * 현재 URL을 파싱하여 라우트 정보를 반환합니다.
 * @returns {Object} 라우트 객체 { name, params }
 */
export function parseRoute() {
  const basePath = import.meta.env.BASE_URL ?? "/";
  const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
  let pathname = window.location.pathname;

  if (normalizedBase !== "/" && pathname.startsWith(normalizedBase)) {
    pathname = pathname.slice(normalizedBase.length);
  } else if (normalizedBase === "/" && pathname.startsWith("/")) {
    pathname = pathname.slice(1);
  }

  pathname = pathname.replace(/^\/+/, "").replace(/\/+$/, "");

  if (!pathname) {
    return { name: "home" };
  }

  const detailMatch = pathname.match(/^product\/([^/]+)$/);
  if (detailMatch) {
    return {
      name: "detail",
      params: {
        productId: decodeURIComponent(detailMatch[1]),
      },
    };
  }

  return { name: "not_found" };
}

/**
 * 경로를 기반으로 URL을 생성합니다.
 * @param {string} path - 경로
 * @returns {URL} 생성된 URL 객체
 */
export function buildUrl(path = "") {
  const basePath = import.meta.env.BASE_URL ?? "/";
  const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return new URL(`${normalizedBase}${normalizedPath}`, window.location.origin);
}

/**
 * 상세 페이지로 이동합니다.
 * @param {string} productId - 상품 ID
 * @param {Function} onRouteChange - 라우트 변경 시 호출할 콜백 함수
 */
export function navigateToDetail(productId, onRouteChange) {
  const detailUrl = buildUrl(`product/${encodeURIComponent(productId)}`);
  window.history.pushState({ productId }, "", detailUrl.toString());
  if (onRouteChange) {
    onRouteChange();
  }
}

/**
 * 홈 페이지로 이동합니다.
 * @param {Object} options - 이동 옵션
 * @param {boolean} options.replace - replaceState 사용 여부
 * @param {string} options.category1 - 카테고리1
 * @param {string} options.category2 - 카테고리2
 * @param {number} options.current - 현재 페이지
 * @param {string} options.search - 검색어
 * @param {Function} buildHomeUrlWithParams - 홈 URL 생성 함수
 * @param {Function} onRouteChange - 라우트 변경 시 호출할 콜백 함수
 */
export function navigateToHome(
  { replace = false, category1, category2, current, search } = {},
  buildHomeUrlWithParams,
  onRouteChange,
) {
  const url = buildHomeUrlWithParams({
    current,
    category1,
    category2,
    search,
  });

  if (replace) {
    window.history.replaceState({}, "", url.toString());
  } else {
    window.history.pushState({}, "", url.toString());
  }

  if (onRouteChange) {
    onRouteChange();
  }
}
