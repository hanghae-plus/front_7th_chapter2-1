import { DEFAULT_LIMIT, DEFAULT_SORT } from "../utils/constants.js";
import { loadCartFromStorage } from "../utils/storage.js";

/**
 * 상세 페이지 초기 상태를 생성합니다.
 * @returns {Object} 상세 페이지 초기 상태
 */
export function createInitialDetailState() {
  return {
    isLoading: false,
    error: null,
    product: null,
  };
}

/**
 * 애플리케이션 전역 상태 객체
 */
export const state = {
  products: [],
  isLoadingProducts: false,
  isLoadingMore: false,
  productsError: null,
  loadMoreError: null,
  limit: DEFAULT_LIMIT,
  currentPage: 0,
  hasMoreProducts: true,
  sort: DEFAULT_SORT,
  totalProducts: 0,
  categories: {},
  categoriesLoaded: false,
  isLoadingCategories: true, // 초기 로딩 상태를 true로 설정하여 "카테고리 로딩 중..."이 표시되도록 함
  route: null,
  detail: createInitialDetailState(),
  selectedCategory1: null,
  selectedCategory2: null,
  searchTerm: "",
  urlTouched: false,
  limitTouched: false,
  sortTouched: false,
  isCartOpen: false,
  cartItems: {},
};

/**
 * 상태 초기화 함수
 * @param {Object} route - 초기 라우트 객체
 */
export function initializeState(route) {
  state.route = route;
  state.cartItems = loadCartFromStorage();
}
