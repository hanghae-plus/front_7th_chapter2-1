import { state } from "../state/appState.js";
import { buildUrl } from "../services/routerService.js";
import { DEFAULT_LIMIT, DEFAULT_SORT } from "../utils/constants.js";
import { resetFilters } from "./detailHandlers.js";

/**
 * 헤더 네비게이션을 연결합니다.
 * @param {HTMLElement} root - 루트 요소
 * @param {Object} options - 옵션
 * @param {Function} options.onNavigateToHome - 홈으로 이동하는 함수
 * @param {Function} options.onCartIconClick - 장바구니 아이콘 클릭 핸들러
 */
export function attachHeaderNavigation(root, { onNavigateToHome, onCartIconClick }) {
  const homeLinks = root.querySelectorAll("[data-link]");
  homeLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      state.urlTouched = false;
      state.limitTouched = false;
      state.sortTouched = false;
      state.limit = DEFAULT_LIMIT;
      state.sort = DEFAULT_SORT;
      resetFilters({ updateUrl: false });
      const url = buildUrl("");
      window.history.pushState({}, "", url.toString());
      if (onNavigateToHome) {
        onNavigateToHome();
      }
    });
  });

  const cartButton = root.querySelector("#cart-icon-btn");
  if (cartButton && onCartIconClick) {
    cartButton.addEventListener("click", (event) => onCartIconClick(event));
  }
}
