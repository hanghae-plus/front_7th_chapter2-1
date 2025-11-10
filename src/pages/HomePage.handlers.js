import { updateQueryParams } from "../utils/queryParams.js";

/**
 * HomePage의 이벤트 핸들러를 등록하는 함수
 */
export const setupHomePageHandlers = () => {
  const container = document.querySelector("#root");
  if (!container) return;

  // 이벤트 위임을 사용하여 동적으로 생성된 요소의 이벤트도 처리
  const handleEvent = (e) => {
    const target = e.target;

    // 검색 입력 - Enter 키
    if (target.id === "search-input" && e.type === "keydown" && e.key === "Enter") {
      e.preventDefault();
      const searchValue = target.value.trim();
      updateQueryParams({ search: searchValue || undefined, page: undefined });
      return;
    }

    // 정렬 선택
    if (target.id === "sort-select" && e.type === "change") {
      updateQueryParams({ sort: target.value, page: undefined });
      return;
    }

    // 개수 선택
    if (target.id === "limit-select" && e.type === "change") {
      updateQueryParams({ limit: target.value, page: undefined });
      return;
    }

    // 카테고리 1depth 버튼
    if (target.classList.contains("category1-filter-btn") && e.type === "click") {
      const category1 = target.dataset.category1;
      updateQueryParams({
        category1: category1 || undefined,
        category2: undefined,
        page: undefined,
      });
      return;
    }

    // 카테고리 2depth 버튼
    if (target.classList.contains("category2-filter-btn") && e.type === "click") {
      const category1 = target.dataset.category1;
      const category2 = target.dataset.category2;
      updateQueryParams({
        category1: category1,
        category2: category2 || undefined,
        page: undefined,
      });
      return;
    }

    // 브레드크럼 category1 클릭 (category2 제거)
    if (target.dataset.breadcrumb === "category1" && e.type === "click") {
      const category1 = target.dataset.category1;
      updateQueryParams({
        category1: category1,
        category2: undefined,
        page: undefined,
      });
      return;
    }

    // 브레드크럼 리셋
    if (target.dataset.breadcrumb === "reset" && e.type === "click") {
      updateQueryParams({
        category1: undefined,
        category2: undefined,
        page: undefined,
      });
      return;
    }
  };

  // 이벤트 리스너 등록
  container.addEventListener("keydown", handleEvent);
  container.addEventListener("change", handleEvent);
  container.addEventListener("click", handleEvent);

  // 클린업 함수 반환
  return () => {
    container.removeEventListener("keydown", handleEvent);
    container.removeEventListener("change", handleEvent);
    container.removeEventListener("click", handleEvent);
  };
};
