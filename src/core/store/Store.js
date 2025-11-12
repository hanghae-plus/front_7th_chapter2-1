/**
 * 기본 Store 클래스 (Pub/Sub 패턴)
 * 전역 상태 관리 및 구독자 패턴 구현
 */
class Store {
  constructor(initialState = {}) {
    this.state = initialState;
    this.subscribers = new Set(); // 구독자 목록
  }

  /**
   * 현재 상태 조회 (불변성 유지)
   * @returns {Object} 현재 상태의 복사본
   */
  getState() {
    return { ...this.state };
  }

  /**
   * 상태 변경 및 구독자 알림
   * @param {Object} newState - 변경할 상태
   */
  setState(newState) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...newState };
    this.notify(prevState, this.state);
  }

  /**
   * 상태 변경 구독
   * @param {Function} callback - 상태 변경 시 호출될 콜백 (nextState, prevState) => void
   * @returns {Function} 구독 해제 함수
   */
  subscribe(callback) {
    if (typeof callback !== "function") {
      throw new Error("Store.subscribe: callback must be a function");
    }
    this.subscribers.add(callback);

    // 구독 해제 함수 반환
    return () => {
      this.unsubscribe(callback);
    };
  }

  /**
   * 구독 해제
   * @param {Function} callback - 구독 해제할 콜백
   */
  unsubscribe(callback) {
    this.subscribers.delete(callback);
  }

  /**
   * 모든 구독자에게 상태 변경 알림
   * @param {Object} prevState - 이전 상태
   * @param {Object} nextState - 새로운 상태
   */
  notify(prevState, nextState) {
    this.subscribers.forEach((callback) => {
      try {
        callback(nextState, prevState);
      } catch (error) {
        console.error("Store subscriber error:", error);
      }
    });
  }

  /**
   * 상태 리셋
   * @param {Object} newState - 새로운 초기 상태
   */
  reset(newState = {}) {
    const prevState = { ...this.state };
    this.state = { ...newState };
    this.notify(prevState, this.state);
  }
}

export default Store;
