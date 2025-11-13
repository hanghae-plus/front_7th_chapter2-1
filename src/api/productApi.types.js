/**
 * @typedef {Object} BaseProduct
 * @property {string} title - 상품명
 * @property {string} link - 상품 링크
 * @property {string} image - 대표 이미지 URL
 * @property {string} lprice - 최저가
 * @property {string} hprice - 최고가
 * @property {string} mallName - 판매처
 * @property {string} productId - 상품 ID
 * @property {string} productType - 상품 타입
 * @property {string} brand - 브랜드명
 * @property {string} maker - 제조사
 * @property {string} category1 - 1차 카테고리
 * @property {string} category2 - 2차 카테고리
 * @property {string} category3 - 3차 카테고리
 * @property {string} category4 - 4차 카테고리
 */

/**
 * @typedef {Object} Pagination
 * @property {number} page - 현재 페이지
 * @property {number} limit - 페이지당 아이템 수
 * @property {number} total - 전체 아이템 수
 * @property {number} totalPages - 전체 페이지 수
 * @property {boolean} hasNext - 다음 페이지 존재 여부
 * @property {boolean} hasPrev - 이전 페이지 존재 여부
 */

/** @typedef {"price_asc"|"price_desc"|"name_asc"|"name_desc"} SortType */

/**
 * @typedef {Object} Filters
 * @property {string} search - 검색어
 * @property {string} category1 - 1차 카테고리
 * @property {string} category2 - 2차 카테고리
 * @property {SortType} sort - 정렬 기준
 *   - "price_asc": 가격 낮은순
 *   - "price_desc": 가격 높은순
 *   - "name_asc": 이름순
 *   - "name_desc": 이름 역순
 */

/**
 * @typedef {Object} ProductsRequestType
 * @property {number} [page] - 현재 페이지
 * @property {number} [current] - 현재 페이지
 * @property {number} [limit] - 페이지당 아이템 수
 * @typedef {Partial<Filters> & ProductsRequestType} ProductsRequest
 */

/**
 * @typedef {Object} ProductsResponse
 * @property {BaseProduct[]} products - 상품 목록
 * @property {Pagination} pagination - 페이지네이션 정보
 * @property {Filters} filters - 필터 정보
 */

/**
 * @typedef {Object} ProductType
 * @property {string} description - 상품 설명
 * @property {number} rating - 평점
 * @property {number} reviewCount - 리뷰 개수
 * @property {number} stock - 재고
 * @property {string[]} images - 이미지 URL 배열
 * @typedef {BaseProduct & ProductType} Product
 */

/**
 * @typedef {Object.<string, Object.<string, object>>} CategoryResponse
 * @example
 * {
 *   "생활/건강": {
 *     "생활용품": {},
 *     "주방용품": {},
 *     ...
 *   },
 *   "디지털/가전": {
 *     "태블릿PC": {},
 *     ...
 *   }
 * }
 */
