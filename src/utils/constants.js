// 에러 메시지
export const INITIAL_LOAD_ERROR_MESSAGE = "상품 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
export const LOAD_MORE_ERROR_MESSAGE = "상품을 추가로 불러오지 못했습니다. 다시 시도해 주세요.";
export const DETAIL_LOAD_ERROR_MESSAGE = "상품 상세 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";

// 기본값
export const DEFAULT_LIMIT = 20;
export const DEFAULT_SORT = "price_asc";

// 옵션
export const HOME_LIMIT_OPTIONS = [10, DEFAULT_LIMIT, 50, 100];
export const HOME_SORT_OPTIONS = new Set(["price_asc", "price_desc", "name_asc", "name_desc"]);

// 스토리지 키
export const CART_STORAGE_KEY = "shopping_cart";
