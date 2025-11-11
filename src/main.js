import { initRouter } from "./router/index.js";
import { HomePage } from "./pages/HomePage.js";
import { setupHomePageHandlers } from "./handlers/homeHandlers.js";
import { DetailPage } from "./pages/DetailPage.js";
import { setupDetailPageHandlers } from "./handlers/detailHandlers.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";
import { CartModal, openCartModal, closeCartModal } from "./components/cart/index.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: {
        url: import.meta.env.BASE_URL + "mockServiceWorker.js",
      },
    }),
  );

// 라우트 설정
export const routes = [
  { path: "/", component: HomePage, setupHandlers: setupHomePageHandlers },
  { path: "/product/:id", component: DetailPage, setupHandlers: setupDetailPageHandlers },
  { path: "*", component: NotFoundPage },
];

async function main() {
  const router = initRouter(routes);
  window.router = router;

  // 2. 장바구니 모달을 body에 추가 (한 번만)
  const cartModalHTML = CartModal();
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = cartModalHTML;
  document.body.appendChild(tempDiv.firstElementChild);

  // 3. 전역 이벤트 리스너 등록 (이벤트 위임 사용)
  document.addEventListener("click", (e) => {
    const target = e.target;

    // 장바구니 아이콘 클릭 -> 모달 열기
    if (target.closest("#cart-icon-btn")) {
      openCartModal();
      return;
    }

    // 닫기 버튼 클릭 -> 모달 닫기
    if (target.closest("#cart-modal-close-btn")) {
      closeCartModal();
      return;
    }

    // 오버레이 클릭 -> 모달 닫기
    if (target.classList.contains("cart-modal-overlay")) {
      closeCartModal();
      return;
    }
  });
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
