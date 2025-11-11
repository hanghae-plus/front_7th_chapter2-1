/**
 * @file 프로젝트 전역 타입 정의
 * 이 파일은 실행되지 않으며, JSDoc 타입 정의만을 위한 파일입니다.
 */

// ============================================
// Product 관련 타입
// ============================================

/**
 * @typedef {Object} Product
 * @property {string} productId - 상품 ID
 * @property {string} title - 상품명
 * @property {string} brand - 브랜드명
 * @property {string} image - 이미지 URL
 * @property {number} lprice - 최저가
 * @property {number} [hprice] - 최고가 (optional)
 * @property {string} [description] - 상품 설명 (optional)
 * @property {string[]} [images] - 추가 이미지 목록 (optional)
 * @property {string} link - 상품 링크
 * @property {string} category1 - 1depth 카테고리
 * @property {string} [category2] - 2depth 카테고리 (optional)
 * @property {string} [category3] - 3depth 카테고리 (optional)
 * @property {string} [category4] - 4depth 카테고리 (optional)
 * @property {string} maker - 제조사
 * @property {string} mallName - 쇼핑몰명
 * @property {string} productType - 상품 타입
 * @property {number} [rating] - 평점 (optional)
 * @property {number} [reviewCount] - 리뷰 수 (optional)
 * @property {number} [stock] - 재고 (optional)
 */

/**
 * @typedef {Object} ProductForList - 상품 목록용 간소화된 타입
 * @property {string} productId - 상품 ID
 * @property {string} title - 상품명
 * @property {string} brand - 브랜드명
 * @property {string} image - 이미지 URL
 * @property {number} lprice - 최저가
 * @property {number} [hprice] - 최고가 (optional)
 * @property {string} link - 상품 링크
 * @property {string} category1 - 1depth 카테고리
 * @property {string} [category2] - 2depth 카테고리 (optional)
 * @property {string} [category3] - 3depth 카테고리 (optional)
 * @property {string} [category4] - 4depth 카테고리 (optional)
 * @property {string} maker - 제조사
 * @property {string} mallName - 쇼핑몰명
 * @property {string} productType - 상품 타입
 */

// ============================================
// Pagination 관련 타입
// ============================================

/**
 * @typedef {Object} Pagination
 * @property {number} page - 현재 페이지
 * @property {number} limit - 페이지당 개수
 * @property {number} total - 전체 아이템 수
 * @property {number} totalPages - 전체 페이지 수
 * @property {boolean} hasNext - 다음 페이지 존재 여부
 * @property {boolean} hasPrev - 이전 페이지 존재 여부
 */

// ============================================
// Filter 관련 타입
// ============================================

/**
 * @typedef {Object} Filters
 * @property {string} [search=""] - 검색어
 * @property {string} [category1=""] - 1depth 카테고리 필터 (optional)
 * @property {string} [category2=""] - 2depth 카테고리 필터 (optional)
 * @property {'price_asc'|'price_desc'|'name_asc'|'name_desc'} [sort="price_asc"] - 정렬 기준
 */

/**
 * @typedef {Object} SortOption
 * @property {'price_asc'|'price_desc'|'name_asc'|'name_desc'} value
 * @property {string} label
 */

// ============================================
// API Response 타입
// ============================================

/**
 * @typedef {Object} ProductListResponse
 * @property {ProductForList[]} products - 상품 목록
 * @property {Pagination} pagination - 페이지네이션 정보
 * @property {Filters} filters - 현재 필터 상태
 */

/**
 * @typedef {Object} CategoryTreeNode
 * @property {string} categoryId - 카테고리 ID
 * @property {CategoryTreeNode[]} children - 하위 카테고리
 */

// ============================================
// Cart 타입
// ============================================

/**
 * @typedef {Object} CartItem
 * @property {string} productId
 * @property {number} count
 */

// ============================================
// Component Props 타입
// ============================================

/**
 * @typedef {Object} PageLayoutProps
 * @property {string} children
 * @property {boolean} [isDetailPage]
 * @property {CartItem[]} [cart]
 */

/**
 * @typedef {Object} ProductCardProps
 * @property {string} productId
 * @property {string} image
 * @property {string} title
 * @property {string} brand
 * @property {number} lprice
 */

/**
 * @typedef {Object} ProductListProps
 * @property {ProductListResponse} [productListResponse]
 * @property {CategoryTreeNode[]} [categories]
 */

/**
 * @typedef {Object} HomePageProps
 * @property {boolean} loading
 * @property {ProductListResponse} [productListResponse]
 * @property {CategoryTreeNode[]} [categories]
 * @property {CartItem[]} [cart]
 */

/**
 * @typedef {Object} ProductDetailPageProps
 * @property {boolean} loading
 * @property {Product} [productDetailResponse]
 * @property {ProductListResponse} [productDetailListResponse]
 * @property {CartItem[]} [cart]
 */

/**
 * @typedef {Object} ProductDetailProps
 * @property {Product} productDetailResponse
 * @property {ProductListResponse} productDetailListResponse
 */

/**
 * @typedef {Object} HeaderProps
 * @property {boolean} [isDetailPage]
 * @property {CartItem[]} [cart]
 */

/**
 * @typedef {Object} CartModalProps
 * @property {CartItem[]} [cart]
 * @property {string[]} [selectedCartIds]
 */

// ============================================
// Utility 타입
// ============================================

/**
 * @template T
 * @typedef {T | null | undefined} Maybe
 */

/**
 * @template T
 * @typedef {Promise<T>} AsyncReturn
 */

export {};
