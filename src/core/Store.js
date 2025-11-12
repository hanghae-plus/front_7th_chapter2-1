export class Store {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = new Set();
    this.currentAction = null; // 현재 실행 중인 액션 추적
  }

  /**
   * 상태 업데이트
   * @param {Object|Function} updater - 새 상태 객체 또는 업데이트 함수
   */
  setState(updater) {
    const prevState = this.state;

    const newState = typeof updater === "function" ? updater(this.state) : { ...this.state, ...updater };

    this.state = newState;

    // 상태 변경 시 모든 리스너에게 알림
    this.notify(prevState, newState);
  }

  /**
   * 특정 상태 슬라이스만 업데이트
   * @param {string} slice - 업데이트할 상태 슬라이스 키
   * @param {Object|Function} updater - 새 값 또는 업데이트 함수
   */
  updateSlice(slice, updater) {
    this.setState((prevState) => {
      const prevSlice = prevState[slice];
      const newSlice = typeof updater === "function" ? updater(prevSlice) : { ...prevSlice, ...updater };

      return {
        ...prevState,
        [slice]: newSlice,
      };
    });
  }

  /**
   * 상태 구독 (Observer 패턴)
   * @param {Function} listener - 상태 변경 시 호출될 콜백
   * @returns {Function} 구독 해제 함수
   */
  subscribe(listener) {
    this.listeners.add(listener);

    // 구독 해제 함수 반환
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 모든 리스너에게 상태 변경 알림
   */
  notify(prevState, newState) {
    this.listeners.forEach((listener) => {
      listener(newState, prevState);
    });
  }

  /**
   * 현재 상태 가져오기
   * @param {Function} selector - 상태 선택 함수 (옵션)
   * @returns {any} 선택된 상태 또는 전체 상태
   */
  getState(selector) {
    return selector ? selector(this.state) : this.state;
  }

  /**
   * 디버깅용: 상태 변경 로깅
   */
  enableDevTools() {
    this.subscribe((newState, prevState) => {
      const actionName = this.currentAction || "Unknown";

      console.group(`🏪 Store Action: ${actionName}`);
      console.log("Previous:", prevState);
      console.log("Current:", newState);
      console.groupEnd();

      // 액션 추적 초기화
      this.currentAction = null;
    });
  }

  /**
   * 액션 실행 (디버깅용)
   * @param {string} actionName - 액션 이름
   * @param {Function} actionFn - 실행할 액션 함수
   */
  dispatch(actionName, actionFn) {
    this.currentAction = actionName;
    actionFn();
  }
}
