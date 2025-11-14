/**
 * 네이버 쇼핑 상품 정보
 * @typedef {Object} Product
 * @property {string} title - 상품명
 * @property {string} link - 상품 상세 페이지 URL
 * @property {string} image - 상품 이미지 URL
 * @property {string} lprice - 최저가 (문자열 형태의 숫자)
 * @property {string} hprice - 최고가 (문자열 형태의 숫자, 빈 문자열일 수 있음)
 * @property {string} mallName - 판매처 이름
 * @property {string} productId - 상품 고유 ID
 * @property {string} productType - 상품 타입
 * @property {string} brand - 브랜드명
 * @property {string} maker - 제조사
 * @property {string} category1 - 카테고리 대분류
 * @property {string} category2 - 카테고리 중분류
 * @property {string} category3 - 카테고리 소분류
 * @property {string} category4 - 카테고리 세분류
 */

/**
 * @typedef {Object} ProductDetail
 * @property {string} brand 브랜드 명칭 (미입력 시 빈 문자열)
 * @property {string} category1 1차 카테고리 이름
 * @property {string} category2 2차 카테고리 이름
 * @property {string} category3 3차 카테고리 이름
 * @property {string} category4 4차 카테고리 이름
 * @property {string} description 상품 상세 설명
 * @property {string} hprice 최고가 (미입력 시 빈 문자열)
 * @property {string} image 대표 이미지 URL
 * @property {string[]} images 추가 이미지 URL 목록
 * @property {string} link 상품 상세 페이지 링크
 * @property {string} lprice 최저가
 * @property {string} maker 제조사 명칭 (미입력 시 빈 문자열)
 * @property {string} mallName 판매처 이름
 * @property {string} productId 상품 고유 식별자
 * @property {string} productType 상품 타입 코드
 * @property {number} rating 상품 평점
 * @property {number} reviewCount 상품 리뷰 수
 * @property {number} stock 재고 수량
 * @property {string} title 상품 이름
 */

export {};
