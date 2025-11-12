// 옵저버 패턴을 이용한 상태관리

let currentObserver = null;

/**
 * 상태 변화를 감지하고 observer 함수를 실행
 * @param {Function} fn - 관찰할 함수
 */
export const observe = (fn) => {
  currentObserver = fn;
  fn();
  currentObserver = null;
};

/**
 * 객체를 관찰 가능한 상태로 만들기
 * @param {Object} obj - 관찰할 객체
 * @returns {Object} - 관찰 가능한 객체
 */
export const observable = (obj) => {
  Object.keys(obj).forEach((key) => {
    let _value = obj[key];
    const observers = new Set();

    Object.defineProperty(obj, key, {
      get() {
        if (currentObserver) observers.add(currentObserver);
        return _value;
      },

      set(value) {
        if (_value === value) return;
        if (JSON.stringify(_value) === JSON.stringify(value)) return;
        _value = value;
        observers.forEach((fn) => fn());
      },
    });
  });

  return obj;
};
