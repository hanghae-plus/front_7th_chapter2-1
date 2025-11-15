import { ProductList } from "../../components/products/productList/ProductList.js";
import { loadHomePageData } from "../../utils/dataLoaders.js";
import { setUpInfiniteScroll } from "../../handlers/infiniteScroll.js";
import { createComponent } from "../../core/component.js";

// ProductList 컴포넌트 인스턴스
let productListComponentInstance = null;

/**
 * ProductList 컴포넌트 생성
 */
const createProductListComponent = () => {
  const template = (props) => {
    return ProductList({
      loading: props.loading || false,
      products: props.products || [],
      pagination: props.pagination || { total: 0, page: 1, totalPages: 1 },
      error: props.error || null,
    });
  };

  const setup = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const state = {
      limit: parseInt(urlParams.get("limit")) || 20,
      search: urlParams.get("search") || "",
      category1: urlParams.get("category1") || "",
      category2: urlParams.get("category2") || "",
      current: parseInt(urlParams.get("current")) || 1,
      sort: urlParams.get("sort") || "price_asc",
    };

    try {
      const { products, pagination } = await loadHomePageData(state);
      return { products, pagination, error: null };
    } catch (error) {
      return { products: [], pagination: { total: 0 }, error };
    }
  };

  const mounted = () => {
    setUpInfiniteScroll();
  };

  return createComponent({ template, setup, mounted });
};

/**
 * ProductList 섹션 초기화 (마운트)
 */
export async function mountProductListSection() {
  const productListContainer = document.querySelector("[data-product-list-container]");
  if (!productListContainer) return;

  productListComponentInstance = createProductListComponent();
  await productListComponentInstance.mount({}, productListContainer);
}

/**
 * ProductList 섹션 업데이트
 * URL에서 상태를 읽어 ProductList 컴포넌트만 업데이트
 */
export async function updateProductListSection() {
  if (!productListComponentInstance) {
    await mountProductListSection();
    return;
  }

  await productListComponentInstance.update({});
}
