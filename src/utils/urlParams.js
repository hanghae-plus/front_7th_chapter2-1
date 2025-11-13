/**
 * @typedef {Object} ProductFilters
 * @property {number} [limit] - 페이지당 아이템 수
 * @property {string} [search] - 검색어
 * @property {string} [category1] - 1차 카테고리
 * @property {string} [category2] - 2차 카테고리
 * @property {SortType} [sort] - 정렬 기준
 * @property {number} [current] - 현재 페이지
 */

/**
 * URL 파라미터를 읽어서 객체로 반환합니다.
 * @param {URLSearchParams} [params] URLSearchParams 인스턴스 (기본값: 현재 location.search)
 * @returns {ProductFilters} 필터 객체
 */
export const getUrlParams = (params = new URLSearchParams(location.search)) => ({
  limit: params.get('limit') ? Number(params.get('limit')) : undefined,
  search: params.get('search') || undefined,
  category1: params.get('category1') || undefined,
  category2: params.get('category2') || undefined,
  sort: /** @type {SortType | undefined} */ (params.get('sort') || undefined),
  current: params.get('current') ? Number(params.get('current')) : undefined,
});

/**
 * URL 파라미터를 업데이트합니다.
 * @param {Partial<ProductFilters>} updates 업데이트할 파라미터
 * @param {boolean} [replace=true] replaceState 사용 여부 (기본값: true)
 */
export const updateUrlParams = (updates, replace = true) => {
  const url = new URL(location.href);

  Object.entries(updates).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, String(value));
    }
  });

  if (replace) {
    history.replaceState({}, '', url.toString());
  } else {
    history.pushState({}, '', url.toString());
  }
};

/**
 * 특정 URL 파라미터를 제거합니다.
 * @param {string[]} keys 제거할 파라미터 키 배열
 * @param {boolean} [replace=true] replaceState 사용 여부 (기본값: true)
 */
export const removeUrlParams = (keys, replace = true) => {
  const url = new URL(location.href);

  keys.forEach((key) => {
    url.searchParams.delete(key);
  });

  replace
    ? history.replaceState({}, '', url.toString())
    : history.pushState({}, '', url.toString());
};
