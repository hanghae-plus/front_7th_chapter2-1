/** @type {ObserverCallback | null} 현재 실행 중인 observer 콜백 */
let currentObserver = null;

/**
 * @function debounceFrame
 * @description
 * requestAnimationFrame을 활용하여 프레임 단위로 debounce하는 함수를 반환합니다.
 * 연속된 호출을 하나의 프레임으로 묶어 성능을 최적화합니다.
 * @param {ObserverCallback} callback 실행할 콜백 함수
 * @returns {ObserverCallback} debounce된 함수
 */
const debounceFrame = (callback) => {
  let currentCallback = -1;
  return () => {
    cancelAnimationFrame(currentCallback);
    currentCallback = requestAnimationFrame(callback);
  };
};

/**
 * @function observe
 * @description
 * 함수를 observer로 등록하고 실행합니다.
 * 함수 내에서 observable 객체의 속성에 접근하면 자동으로 구독이 등록되며,
 * 해당 속성이 변경되면 이 함수가 다시 실행됩니다.
 * @param {ObserverCallback} fn observer로 등록할 함수
 */
export const observe = (fn) => {
  currentObserver = debounceFrame(fn);
  fn();
  currentObserver = null;
};

/**
 * @function observable
 * @description
 * 객체를 Proxy로 감싸서 속성 접근과 변경을 추적합니다.
 * - get: 속성 접근 시 현재 observer가 있으면 구독 목록에 추가
 * - set: 속성 변경 시 해당 속성을 구독하는 모든 observer를 실행
 * @param {Record<string, any>} obj 관찰할 객체
 * @returns {ObservableObject} Proxy로 감싼 observable 객체
 */
export const observable = (obj) => {
  /** @type {ObserverMap} 각 속성별 observer 목록 */
  const observerMap = Object.keys(obj).reduce((map, key) => {
    map[key] = new Set();
    return map;
  }, {});

  return new Proxy(obj, {
    /**
     * @param {Record<string, any>} target 원본 객체
     * @param {string} name 접근한 속성명
     * @returns {any} 속성 값
     */
    get: (target, name) => {
      if (typeof name === 'string' && currentObserver) {
        observerMap[name].add(currentObserver);
      }
      return target[name];
    },
    /**
     * @param {Record<string, any>} target 원본 객체
     * @param {string} name 변경할 속성명
     * @param {any} value 새로운 값
     * @returns {boolean} 성공 여부
     */
    set: (target, name, value) => {
      if (typeof name !== 'string') return true;
      if (target[name] === value) return true;
      if (JSON.stringify(target[name]) === JSON.stringify(value)) return true;
      target[name] = value;
      observerMap[name].forEach((fn) => fn());
      return true;
    },
  });
};
