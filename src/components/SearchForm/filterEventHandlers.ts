import { fetchProducts } from "@/store/products-list/fetchProducts";

/**
 * FilterOptions의 select 요소에 이벤트 리스너를 등록하는 함수
 */
export function setupFilterEventHandlers() {
  // 기존 리스너 제거를 위해 클론하여 새로 등록
  const limitSelect = document.getElementById("limit-select");
  const sortSelect = document.getElementById("sort-select");

  // limit-select 이벤트 리스너
  if (limitSelect) {
    limitSelect.removeEventListener("change", handleLimitChange);
    limitSelect.addEventListener("change", handleLimitChange);
  }

  // sort-select 이벤트 리스너
  if (sortSelect) {
    sortSelect.removeEventListener("change", handleSortChange);
    sortSelect.addEventListener("change", handleSortChange);
  }
}

/**
 * limit-select 변경 핸들러
 */
function handleLimitChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  const limit = parseInt(target.value, 10);
  fetchProducts({ limit, page: 1 });
}

/**
 * sort-select 변경 핸들러
 */
function handleSortChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  const sort = target.value as "price_asc" | "price_desc" | "name_asc" | "name_desc";
  fetchProducts({ sort, page: 1 });
}
