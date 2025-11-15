import { setupCartIconSubscription, showCartModal } from "./cart.js";
import { setupEventDelegation } from "./utils/eventDelegation.js";
import { router } from "../App.js";

let cleanupFunctions = [];

/**
 * 공통 이벤트 위임 설정 (장바구니 아이콘, 헤더 네비게이션 등)
 */
export function setupCommonDelegation() {
  // 기존 리스너 제거
  cleanupFunctions.forEach((cleanup) => cleanup());
  cleanupFunctions = [];

  // Click 이벤트 위임
  const clickHandlers = {
    // 장바구니 아이콘 클릭
    "cart-icon": () => {
      showCartModal();
    },
    // 헤더 로고 클릭 (홈으로 이동)
    "navigate-home": (event) => {
      event.preventDefault();
      router.navigateTo("/");
    },
  };

  // 이벤트 위임 설정
  cleanupFunctions.push(setupEventDelegation("click", clickHandlers, document));

  // 장바구니 아이콘 구독 설정
  setupCartIconSubscription();
}

/**
 * 공통 이벤트 위임 제거
 */
export function cleanupCommonDelegation() {
  cleanupFunctions.forEach((cleanup) => cleanup());
  cleanupFunctions = [];
}
