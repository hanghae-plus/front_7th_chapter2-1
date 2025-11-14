/**
 * 간단한 반응형 상태 관리 (Signal)
 * 특정 상태가 변경될 때만 해당 구독자들에게 알림
 */

export function createSignal(initialValue) {
  let value = initialValue;
  const subscribers = [];

  // Getter: 현재 값 반환
  const get = () => value;

  // Setter: 값 변경 및 구독자들에게 알림
  const set = (newValue) => {
    if (value !== newValue) {
      value = newValue;
      subscribers.forEach((callback) => callback(value));
    }
  };

  // 구독: 값이 변경될 때 실행될 콜백 등록
  const subscribe = (callback) => {
    subscribers.push(callback);
    // 구독 취소 함수 반환
    return () => {
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  };

  return [get, set, subscribe];
}
