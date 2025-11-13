import { renderCurrentPage } from "./renderer.js";
import { navigateTo } from "./navigation.js";
import { setupClickHandler } from "./clickHandler.js";
import { setupHistoryHandler } from "./historyHandler.js";

/**
 * 라우터 초기화 함수
 * @param {Array} routes - 라우트 설정 배열
 * @returns {Object} { push } - 네비게이션 함수
 */
export const initRouter = (routes) => {
  // 1. 클릭 이벤트 핸들러 등록
  setupClickHandler();

  // 2. 브라우저 히스토리 핸들러 등록 (뒤로/앞으로 가기)
  setupHistoryHandler(routes);

  // 3. 첫 페이지 렌더링
  renderCurrentPage(routes);

  // 4. 다른 곳에서 사용할 네비게이션 함수 반환
  return {
    push: (path, query = {}) => navigateTo(path, query),
  };
};
