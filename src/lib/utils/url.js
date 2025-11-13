/**
 * URL 쿼리 파라미터 유틸리티
 */

/**
 * 객체를 URL 쿼리 스트링으로 변환
 */
export function objectToQueryString(params) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * URL 쿼리 스트링을 객체로 변환
 */
export function queryStringToObject(queryString = window.location.search) {
  const params = new URLSearchParams(queryString);
  const result = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

/**
 * 현재 URL의 쿼리 파라미터 가져오기
 */
export function getCurrentQueryParams() {
  return queryStringToObject(window.location.search);
}

/**
 * URL을 업데이트하지만 페이지는 새로고침하지 않음
 */
export function updateURL(path, params = {}) {
  const queryString = objectToQueryString(params);
  const newURL = `${path}${queryString}`;

  if (window.location.pathname + window.location.search !== newURL) {
    window.history.pushState(null, "", newURL);
  }
}

/**
 * filters 상태를 URL 쿼리 파라미터 형식으로 변환
 */
export function filtersToQueryParams(filters) {
  const params = {};

  // 빈 값이 아닌 경우만 추가
  if (filters.search) {
    params.search = filters.search;
  }
  if (filters.category1) {
    params.category1 = filters.category1;
  }
  if (filters.category2) {
    params.category2 = filters.category2;
  }

  if (filters.sort) {
    params.sort = filters.sort;
  }
  if (filters.limit) {
    params.limit = filters.limit;
  }
  if (filters.page && filters.page > 1) {
    params.page = filters.page;
  }

  return params;
}

/**
 * URL 쿼리 파라미터를 filters 상태 형식으로 변환
 */
export function queryParamsToFilters(queryParams, defaults = {}) {
  return {
    search: queryParams.search || "",
    category1: queryParams.category1 || "",
    category2: queryParams.category2 || "",
    sort: queryParams.sort || defaults.sort || "recent",
    limit: queryParams.limit ? parseInt(queryParams.limit, 10) : defaults.limit || 20,
    page: queryParams.page ? parseInt(queryParams.page, 10) : 1,
  };
}
