import { Detail } from "../pages/detail.js";
import { state } from "../state/appState.js";

/**
 * 상세 뷰를 렌더링합니다.
 * @param {HTMLElement} root - 루트 요소
 * @param {Object} options - 옵션
 * @param {Function} options.disconnectLoadMoreObserver - 무한 스크롤 옵저버 해제 함수
 * @param {Function} options.attachDetailEvents - 상세 이벤트 연결 함수
 */
export function renderDetailView(root, { disconnectLoadMoreObserver, attachDetailEvents }) {
  disconnectLoadMoreObserver();
  root.innerHTML = Detail({
    navProps: {
      product: state.detail.product,
      loading: state.detail.isLoading,
    },
    contentProps: {
      product: state.detail.product,
      loading: state.detail.isLoading,
      error: state.detail.error,
    },
  });
  attachDetailEvents(root);
}
