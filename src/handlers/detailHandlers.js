import { state } from "../state/appState.js";
import { updateHomeUrlParams } from "../services/urlService.js";

/**
 * 상세 페이지 브레드크럼 클릭 핸들러
 * @param {Event} event - 이벤트 객체
 * @param {Function} onNavigateToHome - 홈으로 이동하는 함수
 */
export function handleDetailBreadcrumbClick(event, onNavigateToHome) {
  const button = event.target.closest("[data-navigate]");
  if (!button) {
    return;
  }

  if (button.dataset.navigate === "home") {
    event.preventDefault();
    resetFilters({ updateUrl: false });
    if (onNavigateToHome) {
      onNavigateToHome({ replace: false });
    }
    return;
  }

  if (button.dataset.navigate === "home-category") {
    event.preventDefault();
    const { category1, category2 } = button.dataset;
    // resetFilters를 호출하지 않고 navigateToHome에 직접 파라미터를 전달
    // navigateToHome이 URL을 업데이트하고 handleRouteChange가 applyHomeQueryParams를 통해 상태를 복원함
    if (onNavigateToHome) {
      onNavigateToHome({
        category1: category1 || null,
        category2: category2 || null,
        current: 1,
        search: null,
      });
    }
  }
}

/**
 * 필터를 리셋합니다.
 * @param {Object} options - 옵션
 * @param {boolean} options.updateUrl - URL 업데이트 여부
 */
export function resetFilters({ updateUrl = true } = {}) {
  state.selectedCategory1 = null;
  state.selectedCategory2 = null;
  state.searchTerm = "";
  state.currentPage = 0;
  if (updateUrl && state.route?.name === "home") {
    updateHomeUrlParams({ current: 1, category1: null, category2: null, search: null });
  }
}

/**
 * 상세 페이지 이벤트를 연결합니다.
 * @param {HTMLElement} root - 루트 요소
 * @param {Object} options - 옵션
 * @param {Function} options.attachHeaderNavigation - 헤더 네비게이션 연결 함수
 * @param {Function} options.onNavigateToHome - 홈으로 이동하는 함수
 * @param {Function} options.onNavigateToDetail - 상세 페이지로 이동하는 함수
 * @param {Function} options.onAdjustQuantity - 수량 조절 함수
 * @param {Function} options.onNormalizeQuantityInput - 수량 입력 정규화 함수
 * @param {Function} options.onAddToCart - 장바구니 추가 함수
 */
export function attachDetailEvents(
  root,
  {
    attachHeaderNavigation,
    onNavigateToHome,
    onNavigateToDetail,
    onAdjustQuantity,
    onNormalizeQuantityInput,
    onAddToCart,
  },
) {
  attachHeaderNavigation(root);

  const backButtons = root.querySelectorAll('[data-navigate="home"]');
  backButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      resetFilters({ updateUrl: false });
      if (onNavigateToHome) {
        onNavigateToHome({ replace: false });
      }
    });
  });

  const detailBreadcrumb = root.querySelector(".detail-breadcrumb");
  if (detailBreadcrumb) {
    detailBreadcrumb.addEventListener("click", (event) => handleDetailBreadcrumbClick(event, onNavigateToHome));
  }

  const relatedCards = root.querySelectorAll(".related-product-card");
  relatedCards.forEach((card) => {
    card.addEventListener("click", () => {
      const productId = card.dataset.productId;
      if (productId && onNavigateToDetail) {
        onNavigateToDetail(productId);
      }
    });
  });

  const decreaseButton = root.querySelector("[data-quantity-decrease]");
  const increaseButton = root.querySelector("[data-quantity-increase]");
  const quantityInput = root.querySelector("#quantity-input");
  const addToCartButton = root.querySelector(".add-to-cart");

  if (decreaseButton && quantityInput && onAdjustQuantity) {
    decreaseButton.addEventListener("click", () => onAdjustQuantity(quantityInput, -1));
  }

  if (increaseButton && quantityInput && onAdjustQuantity) {
    increaseButton.addEventListener("click", () => onAdjustQuantity(quantityInput, 1));
  }

  if (quantityInput && onNormalizeQuantityInput) {
    quantityInput.addEventListener("input", () => onNormalizeQuantityInput(quantityInput));
  }

  if (addToCartButton && quantityInput && onAddToCart) {
    addToCartButton.addEventListener("click", () =>
      onAddToCart(addToCartButton.dataset.productId, quantityInput.value),
    );
  }
}

/**
 * 수량을 조절합니다.
 * @param {HTMLInputElement} input - 수량 입력 요소
 * @param {number} delta - 변경량
 */
export function adjustQuantity(input, delta) {
  const current = Number(input.value) || 1;
  const min = Number(input.min) || 1;
  const max = Number(input.max) || Infinity;
  const next = Math.min(Math.max(current + delta, min), max);
  input.value = String(next);
}

/**
 * 수량 입력을 정규화합니다.
 * @param {HTMLInputElement} input - 수량 입력 요소
 */
export function normalizeQuantityInput(input) {
  const min = Number(input.min) || 1;
  const max = Number(input.max) || Infinity;
  let value = Number(input.value);
  if (!Number.isFinite(value)) {
    value = min;
  }
  value = Math.min(Math.max(value, min), max);
  input.value = String(value);
}
