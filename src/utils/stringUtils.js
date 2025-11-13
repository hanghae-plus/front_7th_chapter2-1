/**
 * 문자열 관련 유틸리티 함수
 */

/**
 * HTML 속성 값에서 특수 문자를 이스케이프합니다
 * @param {string} value - 이스케이프할 값
 * @returns {string} 이스케이프된 값
 */
export const escapeAttribute = (value) => {
  if (value == null) return "";
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

/**
 * 숫자를 가격 형식으로 포맷팅합니다
 * @param {number|string} price - 가격
 * @returns {string} 포맷팅된 가격 문자열
 */
export const formatPrice = (price) => {
  const numPrice = typeof price === "string" ? Number(price) : price;
  if (isNaN(numPrice)) return "0원";
  return `${numPrice.toLocaleString()}원`;
};

/**
 * 숫자를 로케일 형식으로 포맷팅합니다
 * @param {number|string} number - 숫자
 * @returns {string} 포맷팅된 숫자 문자열
 */
export const formatNumber = (number) => {
  const num = typeof number === "string" ? Number(number) : number;
  if (isNaN(num)) return "0";
  return num.toLocaleString();
};
