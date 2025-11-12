// observer pattern
export const createObserver = () => {
  const listeners = new Map(); // stateKey별 리스너 저장소

  return {
    subscribe(fn, stateKey = null) {
      // stateKey가 없으면 전체 구독, 있으면 특정 상태만 구독
      if (!listeners.has(stateKey)) {
        listeners.set(stateKey, new Set());
      }
      listeners.get(stateKey).add(fn);
    },
    unsubscribe(fn, stateKey = null) {
      // 이벤트 리스너 제거
      if (listeners.has(stateKey)) {
        listeners.get(stateKey).delete(fn);
      }
    },
    notify(stateKey) {
      // 해당 stateKey를 구독하는 리스너만 실행 (전파 없음)
      const notifyListeners = new Set();

      // 전체 구독자 추가 (stateKey가 null인 경우만)
      if (listeners.has(null)) {
        listeners.get(null).forEach((fn) => notifyListeners.add(fn));
      }

      // 해당 경로 구독자만 추가 (상위/하위 전파 없음)
      if (stateKey && listeners.has(stateKey)) {
        listeners.get(stateKey).forEach((fn) => notifyListeners.add(fn));
      }

      // 중복 제거된 리스너 실행
      notifyListeners.forEach((fn) => fn());
    },
  };
};
