// 상품 목록 조회

export async function getProducts(params = {}) {
  const { limit = 20, search = "", category1 = "", category2 = "", sort = "price_asc" } = params;
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

// 상품 상세 조회
export async function getProduct(productId) {
  const response = await fetch(`/api/products/${productId}`);
  return await response.json();
}

/**
 * 
 * @returns {
    "생활/건강": {
        "생활용품": {},
        "주방용품": {},
        "문구/사무용품": {},
        "자동차용품": {},
        "구강위생용품": {},
        "수납/정리용품": {},
        "욕실용품": {},
        "세탁용품": {},
        "공구": {},
        "청소용품": {},
        "정원/원예용품": {},
        "수집품": {},
        "관상어용품": {},
        "반려동물": {}
    },
    "디지털/가전": {
        "태블릿PC": {},
        "노트북": {}
    }
}
 */
// 카테고리 목록 조회
export async function getCategories() {
  const response = await fetch("/api/categories");
  return await response.json();
}
