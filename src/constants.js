export const BASE_PATH = import.meta.env.PROD ? '/front_7th_chapter2-1' : '';

// 상품 목록 관련 상수
export const DEFAULT_LIMIT = 20;
export const LIMIT_OPTIONS = [
  { value: 10, label: '10개' },
  { value: 20, label: '20개' },
  { value: 50, label: '50개' },
  { value: 100, label: '100개' },
];

export const DEFAULT_SORT = 'price_asc';
export const SORT_OPTIONS = [
  { value: 'price_asc', label: '가격 낮은순' },
  { value: 'price_desc', label: '가격 높은순' },
  { value: 'name_asc', label: '이름순' },
  { value: 'name_desc', label: '이름 역순' },
];
