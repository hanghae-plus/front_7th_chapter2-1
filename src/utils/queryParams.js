/**
 * URL 쿼리 파라미터 관리 유틸리티
 */

/**
 * 현재 URL의 쿼리 파라미터를 객체로 반환
 * @returns {Object} 쿼리 파라미터 객체
 */
export const getQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  const result = {};

  for (const [key, value] of params.entries()) {
    result[key] = value;
  }

  return result;
};

/**
 * 쿼리 파라미터를 업데이트하고 URL을 변경
 * @param {Object} newParams - 업데이트할 파라미터 객체
 * @param {boolean} replace - history.replaceState 사용 여부 (기본값: false)
 */
export const updateQueryParams = (newParams, replace = false) => {
  const currentParams = getQueryParams();
  const mergedParams = { ...currentParams, ...newParams };

  // 빈 값이나 null, undefined 제거
  Object.keys(mergedParams).forEach((key) => {
    if (mergedParams[key] === "" || mergedParams[key] === null || mergedParams[key] === undefined) {
      delete mergedParams[key];
    }
  });

  const searchParams = new URLSearchParams(mergedParams);
  const newUrl = `${window.location.pathname}?${searchParams.toString()}`;

  if (replace) {
    window.history.replaceState({}, "", newUrl);
  } else {
    window.history.pushState({}, "", newUrl);
  }

  // popstate 이벤트 트리거 (라우터가 감지하도록)
  window.dispatchEvent(new PopStateEvent("popstate"));
};

/**
 * 특정 쿼리 파라미터 제거
 * @param {string|string[]} keys - 제거할 파라미터 키(들)
 */
export const removeQueryParams = (keys) => {
  const keysArray = Array.isArray(keys) ? keys : [keys];
  const currentParams = getQueryParams();

  keysArray.forEach((key) => {
    delete currentParams[key];
  });

  const searchParams = new URLSearchParams(currentParams);
  const newUrl = searchParams.toString()
    ? `${window.location.pathname}?${searchParams.toString()}`
    : window.location.pathname;

  window.history.pushState({}, "", newUrl);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

/**
 * 모든 쿼리 파라미터 초기화
 */
export const clearQueryParams = () => {
  window.history.pushState({}, "", window.location.pathname);
  window.dispatchEvent(new PopStateEvent("popstate"));
};
