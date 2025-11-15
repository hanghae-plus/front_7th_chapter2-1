import { getProducts, getCategories, getProduct } from "../api/productApi.js";

/**
 * HomePage 데이터 로드
 * @param {Object} state - 페이지 상태
 * @returns {Promise<Object>} 페이지 데이터
 */
export async function loadHomePageData(state) {
  const [productsData, categories] = await Promise.all([
    getProducts({
      limit: state.limit,
      search: state.search,
      category1: state.category1,
      category2: state.category2,
      current: state.current,
      sort: state.sort,
    }),
    getCategories(),
  ]);

  return {
    products: productsData.products,
    pagination: productsData.pagination,
    categories,
  };
}

/**
 * DetailPage 데이터 로드
 * @param {Object} params - 라우트 파라미터
 * @returns {Promise<Object>} 페이지 데이터
 */
export async function loadDetailPageData(params) {
  const product = await getProduct(params.id);
  return { product };
}
