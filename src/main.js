import { Layout } from "./components/common";
import { ItemListPage } from "./pages";
import { CartDialog, initCartDialog, initCartStorage } from "./components/cart/CartDialog.js";
import { initAddToCartButtons } from "./components/cart/addToCartBtn.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

function main() {
  const root = document.getElementById("root");
  if (!root) throw new Error("`#root` 요소를 찾을 수 없습니다.");

  // localStorage 초기화
  initCartStorage();

  // 페이지 렌더링
  const page = ItemListPage();
  root.innerHTML = Layout(page.content, page.headerOptions);

  // CartDialog 모달이 아직 없으면 body에 추가
  let modalOverlay = document.getElementById("cart-modal-overlay");
  if (!modalOverlay) {
    const cartDialogHTML = CartDialog();
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = cartDialogHTML;
    document.body.appendChild(tempDiv.firstElementChild);
  }

  // CartDialog 초기화 (Header가 렌더링된 후)
  initCartDialog();

  // 장바구니 담기 버튼 이벤트 리스너 등록
  initAddToCartButtons();

  // 페이지 초기화 (카테고리 로딩 등)
  if (page.init) {
    page.init();
  }
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
