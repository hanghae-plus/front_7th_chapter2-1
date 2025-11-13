/**
 * 상품 목록을 조회합니다.
 * @param {ProductsRequest} params - 상품 목록 조회 파라미터
 * @returns {Promise<ProductsResponse>} 상품 목록, 페이지네이션, 필터 정보
 */
export async function getProducts(params = {}) {
  const { limit = 20, search = '', category1 = '', category2 = '', sort = 'price_asc' } = params;
  const page = params.current ?? params.page ?? 1;

  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(category1 && { category1 }),
    ...(category2 && { category2 }),
    sort,
  });

  const response = await fetch(`/api/products?${searchParams}`);

  return await response.json();
}

/**
 * 상품 상세 정보를 조회합니다.
 * @param {string} productId - 상품 ID
 * @returns {Promise<Product>} 상품 정보
 */
export async function getProduct(productId) {
  const response = await fetch(`/api/products/${productId}`);
  return await response.json();
}

/**
 * 카테고리 목록을 조회합니다.
 * @returns {Promise<CategoryResponse>} 카테고리 응답 객체
 */
export async function getCategories() {
  const response = await fetch('/api/categories');
  return await response.json();
}
