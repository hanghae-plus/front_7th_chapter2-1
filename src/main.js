import { TOAST_MESSAGE_MAP } from "./constants/toast-constant";
import { ROUTES } from "./route";
import appStore from "./store/app-store";
import { showToastMessage } from "./utils/toast-utils";
import Router from "./core/router";

/** @type {string} */
const basePath = import.meta.env.BASE_URL;

/** @type {HTMLElement | null} */
const $root = document.querySelector("#root");
const $cartModalRoot = document.querySelector("#cart-modal-root");

/* Utils */
const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      serviceWorker: {
        url: `${basePath}mockServiceWorker.js`,
      },
      onUnhandledRequest: "bypass",
    }),
  );

async function main() {
  if (!$root) throw new Error("Root element not found");
  if (!$cartModalRoot) throw new Error("Cart modal root element not found");

  Router.init(ROUTES, basePath, $root);

  const pathName = window.location.pathname;
  const relativePath = pathName.replace(basePath, "/").replace(/\/$/, "") || "/";

  const homeRoute = ROUTES.home;
  const productDetailRoute = ROUTES.productDetail;

  const appState = appStore.getState();

  /* Initial Render */
  if (relativePath === homeRoute.path) {
    $root.replaceChildren(homeRoute.render({}));
  } else if (productDetailRoute.pattern.test(relativePath)) {
    const id = relativePath.split("/")[2];
    console.log("[Initial Render] Product Detail", id);
    $root.replaceChildren(productDetailRoute.render({ id, cart: appState.cart }));
  } else {
    console.log("[Initial Render] Not Found", relativePath);
    history.pushState(null, "", `${basePath}404`);
    $root.replaceChildren(ROUTES.notFound.render({}));
  }

  /* Event Handlers */
  window.addEventListener("keydown", async (event) => {
    if (!event.target) return;
    if ($cartModalRoot.innerHTML !== "" && event.key === "Escape") {
      console.log("[Keydown Event] Escape", event);
      $cartModalRoot.replaceChildren();
      appStore.setSelectedCartIds([]);
    }
  });

  // Cart Modal Event Handlers
  /**
   * @param {MouseEvent} event
   */
  $cartModalRoot.addEventListener("click", async (event) => {
    if (!event.target) return;

    if (event.target.closest("#cart-modal-remove-selected-btn")) {
      console.log("[Click Event] cart-modal-remove-selected-btn", event);
      appStore.removeSelectedCartItems();
      showToastMessage(TOAST_MESSAGE_MAP.REMOVE_SELECTED_CART_ITEMS, "info");
    } else if (event.target.closest("#cart-modal-clear-cart-btn")) {
      console.log("[Click Event] cart-modal-clear-cart-btn", event);
      appStore.removeAllCartItems();
      showToastMessage(TOAST_MESSAGE_MAP.REMOVE_SELECTED_CART_ITEMS, "info");
    }
  });
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(() => main());
} else {
  main();
}
