/**
 * URL 관련 유틸리티 함수
 */

/**
 * URL 쿼리 파라미터를 객체로 파싱합니다
 * @returns {Object} 파싱된 쿼리 파라미터
 */
export const parseUrlParams = () => {
  if (typeof window === "undefined") {
    return {
      search: "",
      limit: "20",
      sort: "price_asc",
      category1: "",
      category2: "",
    };
  }

  const params = new URLSearchParams(window.location.search);
  return {
    search: params.get("search") ?? "",
    limit: params.get("limit") ?? "20",
    sort: params.get("sort") ?? "price_asc",
    category1: params.get("category1") ?? "",
    category2: params.get("category2") ?? "",
  };
};

/**
 * URL 쿼리 파라미터를 업데이트하고 새 URL을 생성합니다.
 * @param {Object} updates - 업데이트할 파라미터 객체
 * @param {Object} options - 옵션 객체 (preserveExisting: boolean)
 * @returns {string} 업데이트된 URL
 */
export const buildUpdatedUrl = (updates = {}, { preserveExisting = true } = {}) => {
  if (typeof window === "undefined") {
    return "/";
  }

  const params = preserveExisting ? new URLSearchParams(window.location.search) : new URLSearchParams();

  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  });

  // API 호출용 파라미터는 URL에서 제거 (단, current는 무한 스크롤을 위해 유지)
  params.delete("page");

  const query = params.toString();
  return query ? `/?${query}` : "/";
};
