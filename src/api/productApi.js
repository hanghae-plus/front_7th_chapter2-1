import { ProductListResponseDTO } from "../dto/ProductListDTO";
import { ProductDTO } from "../dto/ProductDTO";
import { CategoryDTO } from "../dto/CategoryDTO";

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

  const data = await response.json();
  return ProductListResponseDTO.fromApi(data);
}

// 상품 상세 조회
export async function getProduct(productId) {
  const response = await fetch(`/api/products/${productId}`);
  const data = await response.json();
  return ProductDTO.fromApi(data);
}

// 카테고리 목록 조회
export async function getCategories() {
  const response = await fetch("/api/categories");
  const data = await response.json();
  return CategoryDTO.fromApi(data);
}
