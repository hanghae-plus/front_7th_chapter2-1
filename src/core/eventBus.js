//컴포넌트 간 통신을 위한 중앙 이벤트 허브
export const createEventBus = () => {
  const events = new Map();

  return {
    // 이벤트 구독
    on: (event, callback) => {
      // 등록된 이벤트가 아니라면
      if (!events.has(event)) {
        events.set(event, new Set());
      }
      // 이벤트 콜백 등록
      events.get(event).add(callback);

      return () => {
        // 구독 해지 함수 반환
        events.get(event)?.delete(event);
      };
    },
    // 이벤트 발생
    emit: (event, data) => {
      // 등록된 이벤트가 있다면
      if (events.has(event)) {
        // 콜백 받아와서 데이터 넣어서 실행싵킴
        events.get(event).forEach((callback) => {
          try {
            callback(data);
          } catch (error) {
            console.error(`Error in event "${event}":`, error);
          }
        });
      }
    },
    // 구독 해제
    off: (event, callback) => {
      events.get(event)?.delete(callback);
    },
  };
};
