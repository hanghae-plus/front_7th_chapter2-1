import { productStore } from "./productStore";
import { getProducts } from "@/api/productApi";
import type { GetProductsParams } from "@/types";

// ⚡ 상품 목록을 불러오고, 그 결과를 store에 반영하는 함수
export async function fetchProducts(paramsOverride?: Partial<GetProductsParams>) {
  // 1) 이전 상태 가져오기
  const prev = productStore.getState();

  // 2) 기존 params + 새로 들어온 params 덮어쓰기
  const params: GetProductsParams = {
    ...prev.params,
    ...paramsOverride,
  };

  // 3) 로딩 시작 상태로 변경
  productStore.setState({
    loading: true,
    error: null,
    params,
  });

  try {
    // 4) 실제 API 호출
    const res = await getProducts(params);

    // 5) 성공 시 상품 목록 + 페이지네이션/필터 반영
    productStore.setState({
      loading: false,
      products: res.products,
      pagination: res.pagination,
      params: {
        ...res.filters, // search, category, sort
        limit: res.pagination.limit,
        page: res.pagination.page,
      },
    });
  } catch {
    // 6) 실패 시 에러 상태
    productStore.setState({
      loading: false,
      error: "상품을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
    });
  }
}
