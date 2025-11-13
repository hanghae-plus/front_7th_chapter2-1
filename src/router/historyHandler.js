import { renderCurrentPage } from "./renderer.js";

/**
 * 브라우저 뒤로/앞으로 가기 처리
 * @param {Array} routes - 라우트 설정 배열
 */
export const setupHistoryHandler = (routes) => {
  window.addEventListener("popstate", () => {
    // 브라우저 히스토리 변경 시 현재 페이지 렌더링
    renderCurrentPage(routes);
  });
};
