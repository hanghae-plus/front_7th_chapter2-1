import { Search } from "../../components/search/Serach.js";
import { getCategories } from "../../api/productApi.js";
import { createComponent } from "../../core/component.js";

// Search 컴포넌트 인스턴스
let searchComponentInstance = null;

/**
 * Search 컴포넌트 생성
 */
const createSearchComponent = () => {
  const template = (props) => {
    return Search({
      loading: props.loading || false,
      categories: props.categories || {},
      limit: props.limit || 20,
      search: props.search || "",
      sort: props.sort || "price_asc",
      category1: props.category1 || "",
      category2: props.category2 || "",
    });
  };

  const setup = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const categories = await getCategories();
    return {
      categories,
      limit: parseInt(urlParams.get("limit")) || 20,
      search: urlParams.get("search") || "",
      category1: urlParams.get("category1") || "",
      category2: urlParams.get("category2") || "",
      sort: urlParams.get("sort") || "price_asc",
    };
  };

  return createComponent({ template, setup });
};

/**
 * Search 섹션 초기화 (마운트)
 */
export async function mountSearchSection() {
  const searchContainer = document.querySelector("[data-search-container]");
  if (!searchContainer) return;

  searchComponentInstance = createSearchComponent();
  await searchComponentInstance.mount({}, searchContainer);
}

/**
 * Search 섹션 업데이트
 * URL에서 상태를 읽어 Search 컴포넌트만 업데이트 (로딩 상태 없이)
 */
export async function updateSearchSection() {
  if (!searchComponentInstance) {
    await mountSearchSection();
    return;
  }

  const searchContainer = document.querySelector("[data-search-container]");
  if (!searchContainer) return;

  // URL에서 상태 읽기
  const urlParams = new URLSearchParams(window.location.search);

  // categories 로드 (이미 캐시되어 있을 수 있음)
  const { getCategories } = await import("../../api/productApi.js");
  const categories = await getCategories();

  // 로딩 상태 없이 바로 렌더링
  const html = searchComponentInstance.render({
    loading: false,
    categories,
    limit: parseInt(urlParams.get("limit")) || 20,
    search: urlParams.get("search") || "",
    category1: urlParams.get("category1") || "",
    category2: urlParams.get("category2") || "",
    sort: urlParams.get("sort") || "price_asc",
  });

  searchContainer.innerHTML = html;
}
