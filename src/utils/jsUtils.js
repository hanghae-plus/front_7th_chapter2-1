/**
 * JavaScript 유틸리티 함수 모음
 */

import { Router } from "../Router.js";

/**
 * 검색 입력값 가져오기
 * @returns {string} 검색어 (trim된 값)
 */
export const getSearchValue = () => {
  return document.getElementById("search-input")?.value.trim() || "";
};

/**
 * URL 파라미터 파싱
 * @returns {Object} 파싱된 URL 파라미터 객체
 */
export const getUrlParams = () => {
  const searchParams = Router.getSearchParams();
  return {
    page: searchParams.get("page") || 1,
    limit: searchParams.get("limit") || 20,
    search: searchParams.get("search") || "",
    category1: searchParams.get("category1") || "",
    category2: searchParams.get("category2") || "",
    sort: searchParams.get("sort") || "price_asc",
  };
};

/**
 * 검색 입력 포커스 복원
 * @param {boolean} wasSearchFocused - 이전에 포커스가 있었는지 여부
 */
export const restoreSearchFocus = (wasSearchFocused) => {
  if (wasSearchFocused) {
    setTimeout(() => {
      const searchInput = document.getElementById("search-input");
      if (searchInput) {
        searchInput.focus();
        searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
      }
    }, 0);
  }
};

/**
 * 현재 검색 입력이 포커스되어 있는지 확인
 * @returns {boolean}
 */
export const isSearchInputFocused = () => {
  return document.activeElement?.id === "search-input";
};

/**
 * 유효한 경로인지 확인
 * @param {string} pathname - 확인할 경로
 * @returns {boolean} 유효한 경로면 true
 */
export const isValidPath = (pathname) => {
  // 홈 페이지
  if (pathname === "/") {
    return true;
  }
  
  // 상품 상세 페이지: /product/:id 형식
  const productDetailPattern = /^\/product\/[^/]+$/;
  if (productDetailPattern.test(pathname)) {
    return true;
  }
  
  // 그 외는 모두 404
  return false;
};

