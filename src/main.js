import { ToastManager } from "../../../항해99/front_7th_chapter2-1/src/utils/toast.js";
import { getCategories, getProduct, getProducts } from "./api/productApi.js";
import { CartModal } from "./components/CartModal.js";
import { CartButton } from "./components/Header.js";
import { DetailPage } from "./pages/DetailPage.js";
import { HomePage } from "./pages/HomePage.js";
import { CartUtil } from "./utils/cart.js";
import { LocalStorageUtil } from "./utils/localstorage.js";
import { Router } from "./utils/Router.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      serviceWorker: {
        url: `${BASE_URL}mockServiceWorker.js`,
      },
      onUnhandledRequest: "bypass",
    }),
  );

const BASE_URL = import.meta.env.BASE_URL;
const $root = document.querySelector("#root");
const router = new Router($root);
window.router2Instance = router;
window.BASE_URL = import.meta.env.BASE_URL;

let categories;
router.addRoute({
  path: "/",
  loader: async ({ queryString }) => {
    const search = queryString.search ?? "";
    const category1 = queryString.category1 ?? "";
    const category2 = queryString.category2 ?? "";
    const sort = queryString.sort ?? "";
    const limit = queryString.limit ?? "";

    const data = await getProducts({ search, category1, category2, sort, limit });
    if (!categories) {
      categories = await getCategories();
    }
    return { ...data, categories };
  },
  component: HomePage,
});

router.addRoute({
  path: "/product/:productId",
  loader: async ({ params }) => {
    const productId = params.productId;
    const product = await getProduct(productId);
    let relatedProducts = [];
    if (!product.error) {
      relatedProducts = (await getProducts({ page: 1, category2: product.category2 })).products.filter(
        (product) => product.productId !== productId,
      );
    }
    return { product, relatedProducts };
  },
  component: DetailPage,
});

const handleQuantityChange = (e) => {
  const $cartItem = e.target.closest(".cart-item");
  const productId = $cartItem.dataset.productId;
  const product = CartUtil.getCartItem(productId);
  const $count = $cartItem.querySelector(".quantity-input");
  const $totalPrice = $cartItem.querySelector(".cart-item-price");

  const isIncrease = e.target.closest(".quantity-increase-btn");
  const currentQuantity = Number(product.quantity);

  const newQuantity = isIncrease ? currentQuantity + 1 : Math.max(1, currentQuantity - 1);

  $count.value = newQuantity;
  $totalPrice.innerHTML = `${(newQuantity * Number(product.price)).toLocaleString()}원`;

  CartUtil.updateQuantity(productId, newQuantity);
};

const main = async () => {
  LocalStorageUtil.init(() => {
    window.updateCartModal();
    window.updateCartCount();
  });

  // init cart modal (모달은 router 안에다가 두지 않았음, 안그럼 자꾸 리렌더링 됨... 근데 모달 관련한 렌더링 로직을 또 따로 작성)
  const cartModalHTML = CartModal();
  document.body.insertAdjacentHTML("afterbegin", cartModalHTML);
  document.body.addEventListener("click", (e) => {
    if (e.target.closest("#cart-icon-btn")) {
      const $modal = document.querySelector(".cart-modal");
      $modal.hidden = false;
    } else if (
      e.target.closest("#cart-modal-close-btn") ||
      (e.target.closest(".bg-black") && !e.target.closest(".bg-white"))
    ) {
      const $modal = document.querySelector(".cart-modal");
      $modal.hidden = true;
    } else if (e.target.closest(".quantity-increase-btn") || e.target.closest(".quantity-decrease-btn")) {
      handleQuantityChange(e);
    } else if (e.target.closest(".cart-item-checkbox")) {
      const $checkbox = e.target.closest(".cart-item-checkbox");
      CartUtil.checkCartItem($checkbox.dataset.productId);
    } else if (e.target.closest("#cart-modal-select-all-checkbox")) {
      const checked = e.target.closest("#cart-modal-select-all-checkbox").checked;
      CartUtil.checkAllCartItems(checked);
    } else if (e.target.closest(".cart-item-remove-btn")) {
      const productId = e.target.closest(".cart-item-remove-btn").dataset.productId;
      CartUtil.removeCartItem(productId);
    } else if (e.target.closest("#cart-modal-remove-selected-btn")) {
      CartUtil.removeSelectedCartItems();
    } else if (e.target.closest("#cart-modal-clear-cart-btn")) {
      CartUtil.removeAllCartItems();
    } else if (e.target.closest("#cart-modal-checkout-btn")) {
      ToastManager.show({ type: "info", message: "구매 기능은 추후 구현 예정입니다." });
    }
  });

  $root.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const $modal = document.querySelector(".cart-modal");
      $modal.hidden = true;
    }
  });

  window.updateCartModal = () => {
    const $existingModal = document.body.querySelector(".cart-modal");
    const isModalOpen = $existingModal && !$existingModal.hasAttribute("hidden");

    // 새로운 HTML로 덮어쓰기
    const cartModalHTML = CartModal();
    document.body.insertAdjacentHTML("afterbegin", cartModalHTML);

    // 덮어쓰기 후, 모달이 이전에 열려있었다면 다시 열어줍니다.
    const $newModal = document.body.querySelector(".cart-modal");
    if (isModalOpen && $newModal) {
      $newModal.removeAttribute("hidden");
    }
    $existingModal.remove();
  };

  window.updateCartCount = () => {
    const $count = $root.querySelector("#cart-icon-btn");
    const $newCount = CartButton();

    if ($count) {
      $count.outerHTML = $newCount;
    }
  };

  await router.render(location.pathname);
};

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(async () => {
    await main();
  });
} else {
  main();
}
