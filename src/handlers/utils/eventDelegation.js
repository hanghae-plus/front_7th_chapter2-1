/**
 * 이벤트 위임 유틸리티
 * @param {Object} handlers - 액션별 핸들러 함수 맵
 * @param {string} actionAttribute - 액션을 식별하는 데이터 속성명 (기본: 'data-action')
 * @returns {Function} 이벤트 핸들러 함수
 */
export function createEventDelegation(handlers, actionAttribute = "data-action") {
  return (event) => {
    // event.target에서 가장 가까운 액션 요소 찾기
    const actionElement = event.target.closest(`[${actionAttribute}]`);
    if (!actionElement) return;

    const action = actionElement.dataset.action;
    if (!action || !handlers[action]) return;

    // 핸들러 실행
    handlers[action](event, actionElement);
  };
}

/**
 * 이벤트 위임 리스너 등록
 * @param {string} eventType - 이벤트 타입 ('click', 'change', 'keydown' 등)
 * @param {Object} handlers - 액션별 핸들러 함수 맵
 * @param {HTMLElement} container - 이벤트를 위임할 컨테이너 (기본: document)
 * @param {string} actionAttribute - 액션을 식별하는 데이터 속성명
 * @returns {Function} 리스너 제거 함수
 */
export function setupEventDelegation(eventType, handlers, container = document, actionAttribute = "data-action") {
  const handler = createEventDelegation(handlers, actionAttribute);
  container.addEventListener(eventType, handler);

  // 리스너 제거 함수 반환
  return () => {
    container.removeEventListener(eventType, handler);
  };
}
