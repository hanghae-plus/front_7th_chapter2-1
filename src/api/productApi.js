// 상품 목록 조회
export async function getProducts(params = {}) {
  const { limit = 20, skip, search = "", category1 = "", category2 = "", sort = "price_asc" } = params;

  // skip이 있으면 page로 변환, 없으면 기존 방식 사용
  let page;
  if (skip !== undefined) {
    page = Math.floor(skip / limit) + 1;
  } else {
    page = params.current ?? params.page ?? 1;
  }

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

// 상품 상세 조회
export async function getProduct(productId) {
  const response = await fetch(`/api/products/${productId}`);
  return await response.json();
}

// 카테고리 목록 조회
export async function getCategories() {
  const response = await fetch("/api/categories");
  return await response.json();
}
