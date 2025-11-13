/**
 * 쿼리 문자열을 객체로 변환
 * @param {string} queryString - 쿼리 문자열 (예: "?search=신발&sort=price")
 * @returns {Object} 쿼리 객체
 */
export const parseQuery = (queryString) => {
  // 1. 빈 문자열이거나 "?"만 있으면 빈 객체 반환
  if (!queryString || queryString === "?") {
    return {};
  }

  // 2. URLSearchParams로 쿼리 문자열 파싱
  //    "?search=신발&sort=price" 또는 "search=신발&sort=price" 둘 다 처리 가능
  const params = new URLSearchParams(queryString);

  // 3. URLSearchParams를 일반 객체로 변환
  //    Object.fromEntries()는 [key, value] 배열들을 객체로 변환
  //    params.entries()는 [["search", "신발"], ["sort", "price"]] 형태의 이터레이터
  const query = Object.fromEntries(params.entries());

  return query;
};

/**
 * 객체를 쿼리 문자열로 변환
 * @param {Object} queryObject - 쿼리 객체 (예: { search: "신발", sort: "price" })
 * @returns {string} 쿼리 문자열 (? 없이!)
 */
export const stringifyQuery = (queryObject) => {
  // 1. 빈 객체면 빈 문자열 반환
  if (!queryObject || Object.keys(queryObject).length === 0) {
    return "";
  }

  // 2. URLSearchParams에 객체 전달
  //    자동으로 URL 인코딩도 처리됨 (한글 등)
  const params = new URLSearchParams(queryObject);

  // 3. 문자열로 변환
  //    toString()은 "search=신발&sort=price" 형태로 반환 (? 없이)
  return params.toString();
};
