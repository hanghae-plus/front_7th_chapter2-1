import HomePage from "./page/HomePage";
import layout from "./page/PageLayout";
import ProductPage from "./page/ProductPage";
import CartModal from "./component/CartModal";
import stateStore from "./store/stateStore";
import { removeAllFromCart, removeFromCart, getCart, editCartQuantity } from "./module/cartModule.js";
import toastModule from "./module/toastModule.js";
import NotFoundPage from "./page/NotFoundPage.js";

const basePath = import.meta.env.BASE_URL;

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      serviceWorker: {
        url: `${basePath}mockServiceWorker.js`,
      },
      onUnhandledRequest: "bypass",
    }),
  );

const $root = document.querySelector("#root");
const render = (HTML) => ($root.innerHTML = layout({ children: () => HTML }));

const { showToast } = toastModule(document.body);

async function main() {
  const checkedCartItems = new stateStore([]);

  const renderNotFound = () => render(NotFoundPage());
  const renderProduct = await ProductPage(render, { showToast });
  const renderHome = await HomePage(render, { showToast });

  const handleRoute = async () => {
    // 상태값 전체 렌더링
    const pathName = window.location.pathname;
    const currentPath = pathName.replace(basePath, "/").replace(/\/$/, "") || "/";

    if (currentPath.includes("/product")) return renderProduct.pageRender();
    if (currentPath === "/") return renderHome.pageRender();

    renderNotFound();
  };

  window.addEventListener("popstate", handleRoute);
  handleRoute();

  const showCartModal = () => {
    document
      .querySelector("#root")
      .insertAdjacentHTML("beforeend", CartModal({ checkedCartItems: checkedCartItems.get() }));
  };

  const hideCartModal = () => {
    const modal = document.querySelector(".cart-modal");
    if (modal) modal.remove();
  };

  const renderCartModal = () => {
    hideCartModal();
    showCartModal();
  };

  addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideCartModal();
    }
  });

  addEventListener("click", async (e) => {
    // 카트 열기
    if (e.target.closest("#cart-icon-btn")) {
      e.stopPropagation();
      // 이미 열려있지 않으면 열기
      if (!document.querySelector(".cart-modal")) {
        showCartModal();
      }
      return;
    }

    // 카트 닫기 - X 버튼
    if (e.target.closest("#cart-modal-close-btn")) {
      e.stopPropagation();
      hideCartModal();
      return;
    }

    // 카트 닫기 - 배경 클릭 (오버레이 직접 클릭)
    if (e.target.classList.contains("cart-modal-overlay")) {
      e.stopPropagation();
      hideCartModal();
      return;
    }

    // 카트 수량 증가
    if (e.target.closest(".quantity-increase-btn")) {
      e.stopPropagation();
      const btn = e.target.closest(".quantity-increase-btn");
      const productId = btn.dataset.productId;
      editCartQuantity(productId, "increase");

      renderCartModal();
      return;
    }

    // 카트 수량 감소
    if (e.target.closest(".quantity-decrease-btn")) {
      e.stopPropagation();
      const btn = e.target.closest(".quantity-decrease-btn");
      const productId = btn.dataset.productId;
      editCartQuantity(productId, "decrease");

      renderCartModal();
      return;
    }

    // 카트 전체 비우기
    if (e.target.closest("#cart-modal-clear-cart-btn")) {
      e.stopPropagation();
      removeAllFromCart();
      checkedCartItems.set([]);
      renderCartModal();
      showToast({ message: "장바구니가 비워졌습니다", type: "info" });

      return;
    }

    // 선택한 상품 삭제
    if (e.target.closest("#cart-modal-remove-selected-btn")) {
      e.stopPropagation();
      checkedCartItems.get().forEach((productId) => {
        removeFromCart(productId);
      });
      checkedCartItems.set([]);
      await handleRoute();
      renderCartModal();
      showToast({ message: "선택한 상품들이 삭제되었습니다", type: "info" });
      return;
    }

    // 단일 상품 삭제
    if (e.target.closest(".cart-item-remove-btn")) {
      e.stopPropagation();
      const btn = e.target.closest(".cart-item-remove-btn");
      removeFromCart(btn.dataset.productId);
      checkedCartItems.set(checkedCartItems.get().filter((id) => id !== btn.dataset.productId));
      await handleRoute();
      renderCartModal();
      showToast({ message: "선택한 상품이 삭제되었습니다", type: "info" });
      return;
    }

    // 상품 목록으로 돌아가기
    if (e.target.closest(".go-to-product-list")) {
      history.pushState(null, "", basePath);
    }
  });

  addEventListener("change", (e) => {
    if (e.target.classList.contains("cart-item-checkbox")) {
      e.stopPropagation();
      const isChecked = e.target.checked;
      const productId = e.target.dataset.productId;

      if (isChecked) {
        checkedCartItems.set([...checkedCartItems.get(), productId]);
      } else {
        checkedCartItems.set(checkedCartItems.get().filter((id) => id !== productId));
      }
      renderCartModal();
      return;
    }

    if (e.target.id === "cart-modal-select-all-checkbox") {
      e.stopPropagation();
      const isChecked = e.target.checked;
      const cart = getCart();

      if (isChecked) {
        checkedCartItems.set(cart.flatMap((item) => item.productId));
      } else {
        checkedCartItems.set([]);
      }
      renderCartModal();
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
