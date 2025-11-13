import { DEFAULT_LIMIT, DEFAULT_SORT } from "../lib/config/catalog.js";

/**
 * 애플리케이션 전체의 초기 상태
 * 모든 상태를 하나의 객체로 통합
 */
export const initialState = {
  // 카탈로그(상품 목록) 상태
  catalog: {
    products: [],
    pagination: undefined,
    isLoading: false,
    isLoadingMore: false,
    loadMoreError: null,
  },

  // 카테고리 상태
  categories: {
    data: [],
    isLoading: false,
    error: null,
  },

  // 필터 및 검색 파라미터
  filters: {
    limit: DEFAULT_LIMIT,
    sort: DEFAULT_SORT,
    page: 1,
    search: "",
    category1: "",
    category2: "",
  },

  // 장바구니 상태
  cart: {
    items: [],
    selectedIds: new Set(),
    isOpen: false,
    modalElement: null,
    lastFocusedElement: null,
    escListener: null,
  },

  // 상품 상세 상태
  productDetail: {
    product: null,
    relatedProducts: [],
    isLoading: false,
    error: null,
    quantity: 1,
  },

  // UI 상태
  ui: {
    currentPage: "list", // 'list' or 'detail'
  },
};
