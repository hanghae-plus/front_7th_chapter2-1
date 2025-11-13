/**
 * 전역 상태 관리 스토어 생성
 * @param {object | function} initialState - 초기 상태 객체 또는 초기화 함수
 * @param {object} options - 스토어 옵션 (devMode 등)
 * @returns {object} Store 인스턴스
 */
export const createStore = (initialState) => {
  let state = typeof initialState === "function" ? initialState() : initialState || {};
  const listeners = new Set();

  /**
   * 현재 상태 조회
   * @param {string} [key] - 특정 키의 값만 조회
   * @returns {any} 상태 값
   */
  const getState = (key) => {
    return key ? state[key] : state;
  };

  /**
   * 상태 업데이트
   * @param {object | function} updater - 새 상태 객체 또는 업데이트 함수
   */
  const setState = (updater) => {
    const prevState = { ...state };

    // 함수형 업데이트 지원
    const newState = typeof updater === "function" ? updater(prevState) : updater;

    // 얕은 병합
    state = { ...prevState, ...newState };

    // 리스너 실행
    listeners.forEach((listener) => {
      try {
        listener(state, prevState);
      } catch (error) {
        console.error("Store listener error:", error);
      }
    });
  };

  /**
   * 상태 변경 구독
   * @param {function} listener - 상태 변경 시 실행될 콜백 (state, prevState) => void
   * @returns {function} unsubscribe 함수
   */
  const subscribe = (listener) => {
    if (typeof listener !== "function") {
      throw new Error("Listener must be a function");
    }

    listeners.add(listener);

    // unsubscribe 함수 반환
    return () => {
      listeners.delete(listener);
    };
  };

  /**
   * 상태 초기화
   */
  const reset = () => {
    setState(typeof initialState === "function" ? initialState() : initialState || {});
  };

  /**
   * 특정 키의 값을 선택적으로 조회 (selector 패턴)
   * @param {function} selector - 상태에서 값을 추출하는 함수
   * @returns {any} 선택된 값
   */
  const select = (selector) => {
    if (typeof selector !== "function") {
      throw new Error("Selector must be a function");
    }
    return selector(state);
  };

  return {
    getState,
    setState,
    subscribe,
    reset,
    select,
  };
};
