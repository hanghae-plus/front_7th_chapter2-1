/**
 * 상품 정보를 나타내는 타입
 * @typedef {Object} Product
 * @property {string} title - 상품명
 * @property {string} link - 상품 상세 페이지 URL
 * @property {string} image - 상품 이미지 URL
 * @property {string} lprice - 최저가 (문자열 형태의 숫자)
 * @property {string} hprice - 최고가 (문자열 형태의 숫자, 비어있을 수 있음)
 * @property {string} mallName - 판매처 이름
 * @property {string} productId - 상품 고유 ID
 * @property {string} productType - 상품 타입 (1: 일반, 2: 네이버쇼핑 등)
 * @property {string} brand - 브랜드명
 * @property {string} maker - 제조사명
 * @property {string} category1 - 1depth 카테고리 (예: "생활/건강")
 * @property {string} category2 - 2depth 카테고리 (예: "생활용품")
 * @property {string} category3 - 3depth 카테고리 (예: "생활잡화")
 * @property {string} category4 - 4depth 카테고리 (예: "모기장")
 */

/**
 * 상품 상세 정보를 나타내는 타입 (기본 Product에 추가 정보 포함)
 * @typedef {Object} ProductDetail
 * @property {string} title - 상품명
 * @property {string} link - 상품 상세 페이지 URL
 * @property {string} image - 상품 대표 이미지 URL
 * @property {string} lprice - 최저가 (문자열 형태의 숫자)
 * @property {string} hprice - 최고가 (문자열 형태의 숫자, 비어있을 수 있음)
 * @property {string} mallName - 판매처 이름
 * @property {string} productId - 상품 고유 ID
 * @property {string} productType - 상품 타입
 * @property {string} brand - 브랜드명
 * @property {string} maker - 제조사명
 * @property {string} category1 - 1depth 카테고리
 * @property {string} category2 - 2depth 카테고리
 * @property {string} category3 - 3depth 카테고리
 * @property {string} category4 - 4depth 카테고리
 * @property {string} description - 상품 상세 설명
 * @property {number} rating - 평점 (4~5 사이의 정수)
 * @property {number} reviewCount - 리뷰 개수 (50~1050 사이의 정수)
 * @property {number} stock - 재고 수량 (10~110 사이의 정수)
 * @property {string[]} images - 상품 이미지 URL 배열 (3개)
 */

/**
 * 페이지네이션 정보를 나타내는 타입
 * @typedef {Object} Pagination
 * @property {number} page - 현재 페이지 번호 (1부터 시작)
 * @property {number} limit - 페이지당 상품 수
 * @property {number} total - 전체 상품 수
 * @property {number} totalPages - 전체 페이지 수
 * @property {boolean} hasNext - 다음 페이지 존재 여부
 * @property {boolean} hasPrev - 이전 페이지 존재 여부
 */

/**
 * 필터 정보를 나타내는 타입
 * @typedef {Object} Filters
 * @property {string} search - 검색어
 * @property {string} category1 - 선택된 1depth 카테고리
 * @property {string} category2 - 선택된 2depth 카테고리
 * @property {string} sort - 정렬 기준 ("price_asc" | "price_desc" | "name_asc" | "name_desc")
 */

/**
 * 상품 목록 조회 요청 파라미터
 * @typedef {Object} GetProductsParams
 * @property {number} [page=1] - 페이지 번호 (1부터 시작)
 * @property {number} [current] - 페이지 번호 (page의 별칭)
 * @property {number} [limit=20] - 페이지당 상품 수 (10, 20, 50, 100 중 선택 가능)
 * @property {string} [search=""] - 상품명 또는 브랜드명 검색어
 * @property {string} [category1=""] - 1depth 카테고리 필터
 * @property {string} [category2=""] - 2depth 카테고리 필터
 * @property {("price_asc"|"price_desc"|"name_asc"|"name_desc")} [sort="price_asc"] - 정렬 기준
 *   - "price_asc": 가격 낮은 순
 *   - "price_desc": 가격 높은 순
 *   - "name_asc": 이름 오름차순
 *   - "name_desc": 이름 내림차순
 */

/**
 * 상품 목록 조회 응답
 * @typedef {Object} GetProductsResponse
 * @property {Product[]} products - 상품 목록 배열
 * @property {Pagination} pagination - 페이지네이션 정보
 * @property {Filters} filters - 현재 적용된 필터 정보
 */

/**
 * 카테고리 구조를 나타내는 타입
 * @typedef {Object.<string, Object.<string, Object>>} Categories
 * @description 1depth 카테고리를 키로 하고, 각각이 2depth 카테고리 객체를 값으로 가지는 중첩 객체
 * @example
 * {
 *   "생활/건강": {
 *     "생활용품": {},
 *     "건강식품": {}
 *   },
 *   "패션의류": {
 *     "남성의류": {},
 *     "여성의류": {}
 *   }
 * }
 */

/**
 * 상품 목록 조회
 * 검색어, 카테고리, 정렬 옵션을 적용하여 상품 목록을 페이지네이션과 함께 반환합니다.
 *
 * @async
 * @function getProducts
 * @param {GetProductsParams} [params={}] - 상품 목록 조회 파라미터
 * @returns {Promise<GetProductsResponse>} 상품 목록, 페이지네이션 정보, 필터 정보를 포함한 응답 객체
 * @throws {Error} API 요청 실패 시 에러 발생
 *
 * @example
 * // 기본 조회 (페이지 1, 20개 상품, 가격 낮은 순)
 * const result = await getProducts();
 *
 * @example
 * // 검색어로 조회
 * const result = await getProducts({ search: "모기장" });
 *
 * @example
 * // 카테고리 필터링
 * const result = await getProducts({
 *   category1: "생활/건강",
 *   category2: "생활용품"
 * });
 *
 * @example
 * // 페이지네이션과 정렬
 * const result = await getProducts({
 *   page: 2,
 *   limit: 50,
 *   sort: "price_desc"
 * });
 *
 * @example
 * // 모든 옵션 조합
 * const result = await getProducts({
 *   page: 1,
 *   limit: 20,
 *   search: "세제",
 *   category1: "생활/건강",
 *   category2: "생활용품",
 *   sort: "name_asc"
 * });
 */
export const getProducts = async (params = {}) => {
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
};

/**
 * 상품 상세 정보 조회
 * 특정 상품 ID에 해당하는 상품의 상세 정보를 반환합니다.
 * 기본 상품 정보에 더해 상세 설명, 평점, 리뷰 수, 재고, 추가 이미지 등이 포함됩니다.
 *
 * @async
 * @function getProduct
 * @param {string} productId - 조회할 상품의 고유 ID
 * @returns {Promise<ProductDetail>} 상품 상세 정보 객체
 * @throws {Error} 상품을 찾을 수 없거나 API 요청 실패 시 에러 발생
 *
 * @example
 * // 상품 ID로 상세 정보 조회
 * const product = await getProduct("11124150101");
 * console.log(product.title); // "방충망 미세먼지 롤 창문 모기장 DIY 100cmx10cm"
 * console.log(product.description); // 상품 상세 설명
 * console.log(product.rating); // 4 또는 5
 * console.log(product.reviewCount); // 50~1050 사이의 숫자
 * console.log(product.stock); // 10~110 사이의 숫자
 * console.log(product.images); // [이미지URL1, 이미지URL2, 이미지URL3]
 *
 * @example
 * // 에러 처리
 * try {
 *   const product = await getProduct("invalid-id");
 * } catch (error) {
 *   console.error("상품을 찾을 수 없습니다:", error);
 * }
 */
export const getProduct = async (productId) => {
  const response = await fetch(`/api/products/${productId}`);
  return await response.json();
};

/**
 * 카테고리 목록 조회
 * 전체 상품의 카테고리 구조를 중첩된 객체 형태로 반환합니다.
 * 1depth 카테고리를 키로 하고, 각 카테고리 아래의 2depth 카테고리들을 포함합니다.
 *
 * @async
 * @function getCategories
 * @returns {Promise<Categories>} 카테고리 구조 객체
 * @throws {Error} API 요청 실패 시 에러 발생
 *
 * @example
 * // 카테고리 목록 조회
 * const categories = await getCategories();
 * console.log(categories);
 * // 출력 예시:
 * // {
 * //   "생활/건강": {
 * //     "생활용품": {},
 * //     "건강식품": {},
 * //     "건강관리용품": {}
 * //   },
 * //   "패션의류": {
 * //     "남성의류": {},
 * //     "여성의류": {},
 * //     "잡화": {}
 * //   }
 * // }
 *
 * @example
 * // 1depth 카테고리 목록 추출
 * const categories = await getCategories();
 * const category1List = Object.keys(categories);
 * console.log(category1List); // ["생활/건강", "패션의류", ...]
 *
 * @example
 * // 특정 1depth의 2depth 카테고리 목록 추출
 * const categories = await getCategories();
 * const category2List = Object.keys(categories["생활/건강"]);
 * console.log(category2List); // ["생활용품", "건강식품", ...]
 *
 * @example
 * // 카테고리 선택 UI 렌더링
 * const categories = await getCategories();
 * Object.entries(categories).forEach(([cat1, cat2Obj]) => {
 *   console.log(`1depth: ${cat1}`);
 *   Object.keys(cat2Obj).forEach(cat2 => {
 *     console.log(`  2depth: ${cat2}`);
 *   });
 * });
 */
export const getCategories = async () => {
  const response = await fetch("/api/categories");
  return await response.json();
};
