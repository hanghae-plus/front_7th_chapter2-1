import { state } from "../state/appState.js";
import { DEFAULT_LIMIT, DEFAULT_SORT, HOME_LIMIT_OPTIONS, HOME_SORT_OPTIONS } from "../utils/constants.js";
import { buildUrl } from "./routerService.js";

/**
 * URL 쿼리 파라미터를 읽어서 state에 적용합니다.
 */
export function applyHomeQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const category1 = params.get("category1");
  const category2 = params.get("category2");
  const search = params.get("search") ?? "";
  const sort = params.get("sort");
  const limit = params.get("limit");
  const hasRelevantParams =
    params.has("category1") ||
    params.has("category2") ||
    params.has("search") ||
    params.has("sort") ||
    params.has("limit") ||
    params.has("current");

  state.selectedCategory1 = category1 || null;
  state.selectedCategory2 = category2 || null;
  state.searchTerm = search;

  if (sort !== null && HOME_SORT_OPTIONS.has(sort)) {
    state.sort = sort;
    state.sortTouched = true;
  } else {
    state.sort = DEFAULT_SORT;
    state.sortTouched = false;
  }

  if (limit !== null && HOME_LIMIT_OPTIONS.includes(Number(limit))) {
    state.limit = Number(limit);
    state.limitTouched = true;
  } else {
    state.limit = DEFAULT_LIMIT;
    state.limitTouched = false;
  }

  state.urlTouched = hasRelevantParams;
}

/**
 * 홈 페이지 파라미터를 해결합니다.
 * @param {Object} overrides - 오버라이드할 파라미터
 * @returns {Object} 해결된 파라미터 객체
 */
export function resolveHomeParams(overrides = {}) {
  const hasOwn = Object.prototype.hasOwnProperty;
  const hasOverride = (key) => hasOwn.call(overrides, key);
  const valueOr = (key, fallback) => (hasOverride(key) ? overrides[key] : fallback);

  const resolvedCategory1 = valueOr("category1", state.selectedCategory1);
  const resolvedCategory2 = valueOr("category2", state.selectedCategory2);
  const resolvedSort = hasOverride("sort") ? overrides.sort : state.sortTouched ? state.sort : undefined;
  const resolvedLimit = hasOverride("limit") ? overrides.limit : state.limitTouched ? state.limit : undefined;
  const resolvedSearch = valueOr("search", state.searchTerm);
  const fallbackPage = Number.isFinite(state.currentPage) && state.currentPage > 0 ? state.currentPage : 1;
  const resolvedCurrent = valueOr("current", fallbackPage);

  // current가 오버라이드되었을 때, 필터가 없고 current가 1이면 forceCurrent를 false로 설정
  // (필터/검색/정렬/개수 변경 없이 무한 스크롤할 때 current=1은 URL에 표시하지 않음)
  const hasCurrentOverride = hasOverride("current");
  const hasFilter = Boolean(
    resolvedCategory1 ||
      resolvedCategory2 ||
      resolvedSearch ||
      (resolvedSort && state.sortTouched) ||
      (resolvedLimit && state.limitTouched),
  );
  const numericCurrent = Number(resolvedCurrent);
  const forceCurrent = hasCurrentOverride && (hasFilter || numericCurrent > 1);

  return {
    category1: resolvedCategory1,
    category2: resolvedCategory2,
    sort: resolvedSort,
    limit: resolvedLimit,
    search: resolvedSearch,
    current: resolvedCurrent,
    forceCurrent,
  };
}

/**
 * 홈 페이지 검색 파라미터를 생성합니다.
 * @param {Object} params - 파라미터 객체
 * @returns {URLSearchParams} 생성된 URLSearchParams
 */
export function createHomeSearchParams({ category1, category2, sort, limit, search, current, forceCurrent } = {}) {
  const params = new URLSearchParams();

  if (category1) {
    params.set("category1", category1);
  }

  if (category2) {
    params.set("category2", category2);
  }

  if (sort) {
    params.set("sort", sort);
  }

  if (limit !== undefined && limit !== null) {
    const numericLimit = Number(limit);
    if (Number.isFinite(numericLimit) && numericLimit > 0) {
      params.set("limit", String(Math.trunc(numericLimit)));
    }
  }

  if (search) {
    params.set("search", search);
  }

  const numericCurrent = Number(current);
  const hasSearch = Boolean(search);
  if (Number.isFinite(numericCurrent) && (numericCurrent > 1 || hasSearch || forceCurrent)) {
    params.set("current", String(Math.max(1, Math.trunc(numericCurrent))));
  }

  return params;
}

/**
 * 홈 페이지 파라미터를 빌드합니다.
 * @param {Object} overrides - 오버라이드할 파라미터
 * @returns {URLSearchParams} 생성된 URLSearchParams
 */
export function buildHomeParams(overrides = {}) {
  const resolved = resolveHomeParams(overrides);
  return createHomeSearchParams(resolved);
}

/**
 * 홈 페이지 URL 파라미터를 업데이트합니다.
 * @param {Object} overrides - 오버라이드할 파라미터
 */
export function updateHomeUrlParams(overrides = {}) {
  if (state.route?.name !== "home") {
    return;
  }

  const { force, ...restOverrides } = overrides;
  if (!force && !state.urlTouched) {
    return;
  }

  const url = new URL(window.location.href);
  const params = buildHomeParams(restOverrides);
  url.search = params.toString();
  window.history.replaceState(window.history.state, "", url.toString());
}

/**
 * 홈 페이지 URL을 파라미터와 함께 생성합니다.
 * @param {Object} overrides - 오버라이드할 파라미터
 * @returns {URL} 생성된 URL 객체
 */
export function buildHomeUrlWithParams(overrides = {}) {
  const url = buildUrl("");
  const params = buildHomeParams(overrides);
  url.search = params.toString();
  return url;
}
