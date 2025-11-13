import { getCurrentFilters, updateFilters } from "./filterState";
import { renderProducts } from "./productRenderer";
import { resetInfiniteScrollState } from "./infiniteScrollState.js";

/**
 * 검색 입력 필드를 초기화하고 이벤트 리스너를 등록합니다.
 */
export const initSearchInput = () => {
  const searchInput = document.getElementById("search-input");

  if (!searchInput) {
    console.error("search-input not found");
    return;
  }

  // 현재 필터 상태의 검색어를 입력 필드에 반영
  const currentFilters = getCurrentFilters();
  searchInput.value = currentFilters.search || "";

  // Enter 키로 검색 수행
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  });
};

/**
 * 검색을 수행합니다.
 * 현재 필터 상태를 유지하면서 검색어만 업데이트합니다.
 */
const handleSearch = () => {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) return;

  const searchValue = searchInput.value.trim();

  // 무한 스크롤 상태 초기화
  resetInfiniteScrollState();

  // 필터 상태 업데이트 (검색어만 변경, 나머지는 유지)
  const updatedFilters = updateFilters({ search: searchValue });

  // 상품 목록 다시 렌더링
  renderProducts({ params: updatedFilters });
};
