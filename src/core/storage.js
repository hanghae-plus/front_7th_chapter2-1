/**
 * localStorage 래퍼
 *
 * localStorage를 안전하게 사용하기 위한 유틸리티
 * - JSON 직렬화/역직렬화 자동 처리
 * - 에러 핸들링
 */

/**
 * 데이터 저장
 * @param {string} key - 저장할 키
 * @param {any} value - 저장할 값 (객체, 배열 등)
 *
 * 사용 예시:
 * save('cart', [{ id: 1, name: '상품', quantity: 2 }]);
 */
export const save = (key, value) => {
  try {
    // JSON.stringify: 객체/배열을 문자열로 변환
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Storage save error:", error);
  }
};

/**
 * 데이터 로드
 * @param {string} key - 불러올 키
 * @returns {any} 저장된 값 (객체, 배열 등) 또는 null
 *
 * 사용 예시:
 * const cart = load('cart') || [];
 */
export const load = (key) => {
  try {
    const value = localStorage.getItem(key);

    // 값이 없으면 null 반환
    if (value === null) {
      return null;
    }

    // JSON.parse: 문자열을 객체/배열로 변환
    return JSON.parse(value);
  } catch (error) {
    console.error("Storage load error:", error);
    return null;
  }
};

/**
 * 데이터 삭제
 * @param {string} key - 삭제할 키
 *
 * 사용 예시:
 * remove('cart');
 */
export const remove = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Storage remove error:", error);
  }
};

/**
 * 전체 삭제
 *
 * 사용 예시:
 * clear();
 */
export const clear = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error("Storage clear error:", error);
  }
};
