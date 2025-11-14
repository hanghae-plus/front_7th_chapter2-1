/**
 * 옵저버 패턴 상세 내용
 *
 * 관찰 대상 (Subject): Toast 클래스의 인스턴스 (최하단에 생성한 toastStore)
 *      --> 싱글톤 패턴 활용 (하나의 Toast 스토어의 인스턴스를 모든 컴포넌트에서 공유하게 하기 위함)
 * 상태 (State): #state (Object)
 * 구독자 목록 (Observers): #observer (Set)
 * 구독 (Subscribe): subscribe() 메서드.
 * 알림 (Notify): #setState()가 호출되면 #notify() 메서드 호출.
 * */

const initialState = {
  message: "",
  type: "info", // 'success', 'info', 'error'
  isVisible: false,
};

class Toast {
  #state;
  #observer;
  #timeoutId = null;

  constructor() {
    this.#state = initialState;
    this.#observer = new Set();
  }

  getState() {
    return structuredClone(this.#state);
  }

  #setState(val) {
    this.#state = { ...this.#state, ...val };
    this.#notify();
  }

  #notify() {
    this.#observer.forEach((callback) => callback());
  }

  subscribe(callback) {
    this.#observer.add(callback);
    return () => this.unsubscribe(callback);
  }

  unsubscribe(callback) {
    this.#observer.delete(callback);
  }

  /**
   * 토스트 메시지를 표시합니다.
   * @param {string} message - 표시할 메시지
   * @param {'success' | 'info' | 'error'} type - 메시지 타입
   * @param {number} duration - 표시 시간 (ms) -- 디폴트: 3초 후 사라짐
   */
  showToast(message, type = "info", duration = 3000) {
    if (this.#timeoutId) {
      clearTimeout(this.#timeoutId);
    }

    this.#setState({
      message,
      type,
      isVisible: true,
    });

    this.#timeoutId = setTimeout(() => {
      this.hideToast();
    }, duration);
  }

  /**
   * 토스트 메시지를 숨깁니다.
   */
  hideToast() {
    this.#setState({ isVisible: false });
  }
}

export const toastStore = new Toast();
