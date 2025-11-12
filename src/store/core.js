export class Store {
  constructor(initialState) {
    this._state = initialState;
    this._observers = new Set();
  }

  // 현재 상태 조회
  get state() {
    return this._state;
  }

  // 상태 업데이트
  setState(newState) {
    const prevState = this._state;
    const nextState =
      typeof newState === "object" && !Array.isArray(newState) ? { ...prevState, ...newState } : newState;

    // 키를 가져와서 값 비교
    const isEqual = Object.keys(prevState).every((key) => Object.is(prevState[key], nextState[key]));
    // 이전 state와 같으면 렌더링 불필요
    if (isEqual) return;

    this._state = nextState;
    this._notify();
  }

  // 구독자 등록
  subscribe(observer) {
    this._observers.add(observer);

    // 구독 취소 함수 반환
    return () => {
      this._observers.delete(observer);
    };
  }

  // 모든 구독자에게 상태 변경 알림
  _notify() {
    this._observers.forEach((observer) => observer(this._state));
  }
}
