import { initRouter } from "./utils/router.js";
import { initProductClickHandler } from "./utils/productClickHandler.js";
import { initCartHandler } from "./utils/initCartHandler.js";
import { BASE_PATH } from "./config/constants.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: {
        url: `${BASE_PATH}mockServiceWorker.js`,
        options: {
          scope: BASE_PATH,
        },
      },
    }),
  );

function main() {
  // 라우터 초기화 (페이지 렌더링 포함)
  initRouter();

  // 장바구니 이벤트 핸들러 초기화 (한 번만)
  initCartHandler();

  // 상품 카드 클릭 핸들러 초기화
  initProductClickHandler();
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
