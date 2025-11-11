// observer pattern
export const createObserver = () => {
  const listeners = new Set(); // 이벤트 리스너 저장소 (중복 방지)

  return {
    subscribe(fn) {
      // 이벤트 리스너 추가
      listeners.add(fn);
    },
    unsubscribe(fn) {
      // 이벤트 리스너 제거
      listeners.delete(fn);
    },
    notify() {
      // 이벤트 발생시 모든 리스너에게 알림
      listeners.forEach((fn) => fn());
    },
  };
};
