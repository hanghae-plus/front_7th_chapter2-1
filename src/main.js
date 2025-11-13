import { getProducts } from "./api/productApi";
import CartModal from "./components/CartModal";
import { TOAST_MESSAGE_MAP } from "./constants/toast-constant";
import { ROUTES } from "./route";
import appStore from "./store/app-store";
import { showToastMessage } from "./utils/toast-utils";
import Router from "./core/router";

/**
 * @typedef {import('./types.js').CategoryTreeNode} CategoryTreeNode
 * @typedef {import('./types.js').ProductListResponse} ProductListResponse
 * @typedef {import('./types.js').Routes} Routes
 */

/** @type {HTMLElement | null} */
let ioSentinel = null;

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
    $root.innerHTML = `
      ${homeRoute.render({ loading: true, cart: appState.cart })}
    `;
    const props = await homeRoute.loader();
    $root.innerHTML = `
      ${homeRoute.render(props)}
    `;
  } else if (productDetailRoute.pattern.test(relativePath)) {
    const id = relativePath.split("/")[2];
    $root.innerHTML = `
      ${productDetailRoute.render({ loading: true, cart: appState.cart })}
    `;
    const props = await productDetailRoute.loader({ id });
    $root.innerHTML = `
      ${productDetailRoute.render(props)}
    `;
  } else {
    console.log("[Initial Render] Not Found", relativePath);
    history.pushState(null, "", `${basePath}404`);
    $root.innerHTML = `
      ${ROUTES.notFound.render()}
    `;
  }

  /* Event Handlers */
  window.addEventListener("keydown", async (event) => {
    if (!event.target) return;
    if ($cartModalRoot.innerHTML !== "" && event.key === "Escape") {
      console.log("[Keydown Event] Escape", event);
      $cartModalRoot.innerHTML = "";
      appStore.setSelectedCartIds([]);
    }
  });

  // Cart Modal Event Handlers
  /**
   * @param {MouseEvent} event
   */
  $cartModalRoot.addEventListener("click", async (event) => {
    if (!event.target) return;

    if (event.target.closest("#cart-modal-close-btn")) {
      console.log("[Click Event] cart-modal-close-btn", event);
      $cartModalRoot.innerHTML = "";
      appStore.setSelectedCartIds([]);
    } else if (!event.target.closest("#cart-modal-container")) {
      console.log("[Click Event] cart-modal-container", event);
      $cartModalRoot.innerHTML = "";
      appStore.setSelectedCartIds([]);
    } else if (event.target.closest("#quantity-decrease-btn")) {
      console.log("[Click Event] quantity-decrease-btn", event);
      const productId = event.target.dataset.productId;
      if (!productId) return;
      appStore.subtractCartItemCountByProductId(productId);
    } else if (event.target.closest("#quantity-increase-btn")) {
      console.log("[Click Event] quantity-increase-btn", event);
      const productId = event.target.dataset.productId;
      if (!productId) return;
      appStore.addCartItemCountByProductId(productId);
    } else if (event.target.closest("#cart-modal-remove-selected-btn")) {
      console.log("[Click Event] cart-modal-remove-selected-btn", event);
      appStore.removeSelectedCartItems();
      showToastMessage(TOAST_MESSAGE_MAP.REMOVE_SELECTED_CART_ITEMS, "info");
    } else if (event.target.closest("#cart-modal-clear-cart-btn")) {
      console.log("[Click Event] cart-modal-clear-cart-btn", event);
      appStore.removeAllCartItems();
      showToastMessage(TOAST_MESSAGE_MAP.REMOVE_SELECTED_CART_ITEMS, "info");
    } else if (event.target.closest(".cart-item-remove-btn")) {
      console.log("[Click Event] cart-item-remove-btn", event);
      const productId = event.target.dataset.productId;
      if (!productId) return;
      appStore.removeCartItemByProductId(productId);
      showToastMessage(TOAST_MESSAGE_MAP.REMOVE_SELECTED_CART_ITEMS, "info");
    }
  });

  // Root Event Handlers
  /**
   * @param {MouseEvent} event
   */
  $root.addEventListener("click", async (event) => {
    if (!event.target) return;

    if (event.target.id === "category-filter-btn") {
      console.log("[Click Event] category-filter-btn", event);
      const value1 = event.target.dataset.category1;
      const value2 = event.target.dataset.category2;
      if (value1 === appState.listResponse.filters.category1 && value2 === appState.listResponse.filters.category2)
        return;
      appStore.setListLoading(true);
      appState.listResponse.filters.category1 = value1;
      appState.listResponse.filters.category2 = value2;
      appState.listResponse.pagination.page = 1;
      appState.listResponse.pagination.hasNext = true;
      appState.listResponse.pagination.hasPrev = false;
      appState.listResponse.products = [];
      $root.innerHTML = `
        ${homeRoute.render({
          loading: true,
          productListResponse: appState.listResponse,
          categories: appState.categories,
          cart: appState.cart,
        })}
      `;
      const props = await homeRoute.loader();
      $root.innerHTML = `
        ${homeRoute.render(props)}
      `;
      appStore.setListLoading(false);
    } else if (event.target.dataset.breadcrumb === "reset") {
      console.log("[Click Event] breadcrumb - reset", event);
      if (appState.listResponse.filters.category1 === "" && appState.listResponse.filters.category2 === "") return;
      appStore.setListLoading(true);
      appState.listResponse.filters.category1 = "";
      appState.listResponse.filters.category2 = "";
      appState.listResponse.pagination.page = 1;
      appState.listResponse.pagination.hasNext = true;
      appState.listResponse.pagination.hasPrev = false;
      appState.listResponse.products = [];
      $root.innerHTML = `
        ${homeRoute.render({
          loading: true,
          productListResponse: appState.listResponse,
          categories: appState.categories,
          cart: appState.cart,
        })}
      `;
      const props = await homeRoute.loader();
      $root.innerHTML = `
        ${homeRoute.render(props)}
      `;
      appStore.setListLoading(false);
    } else if (event.target.dataset.breadcrumb === "category1") {
      console.log("[Click Event] breadcrumb - category1", event);
      const value = event.target.dataset.category1;
      if (value === appState.listResponse.filters.category1 && appState.listResponse.filters.category2 === "") return;
      appStore.setListLoading(true);
      appState.listResponse.filters.category1 = value;
      appState.listResponse.filters.category2 = "";
      appState.listResponse.pagination.page = 1;
      appState.listResponse.pagination.hasNext = true;
      appState.listResponse.pagination.hasPrev = false;
      appState.listResponse.products = [];
      $root.innerHTML = `
        ${homeRoute.render({
          loading: false,
          productListResponse: appState.listResponse,
          categories: appState.categories,
          cart: appState.cart,
        })}
      `;
      const props = await homeRoute.loader();
      $root.innerHTML = `
        ${homeRoute.render(props)}
      `;
      appStore.setListLoading(false);
    } else if (event.target.closest("#add-to-cart-btn")) {
      console.log("[Click Event] add-to-cart-btn", event);
      const productId = event.target.dataset.productId;
      if (!productId) return;
      appStore.addToCart(productId, appState.cartItemCount);
      showToastMessage(TOAST_MESSAGE_MAP.ADD_TO_CART, "success");
    } else if (event.target.closest("#cart-icon-btn")) {
      console.log("[Click Event] cart-icon-btn", event);
      $cartModalRoot.innerHTML = `
        ${CartModal({ cart: appState.cart, selectedCartIds: appState.selectedCartIds })}
      `;
    } else if (event.target.id === "quantity-decrease") {
      console.log("[Click Event] quantity-decrease", event);
      appStore.subtractCartItemCount();
    } else if (event.target.id === "quantity-increase") {
      console.log("[Click Event] quantity-increase", event);
      appStore.addCartItemCount();
    } else if (event.target.closest("[data-link]")) {
      console.log("[Click Event] link", event);

      const linkElement = event.target.closest("[data-link]");
      const linkHref = linkElement.dataset.linkHref;

      if (linkHref) {
        Router.push(linkHref);
      } else if (linkElement.closest("[data-go-back]")) {
        Router.goBack();
      }
    }
  });

  /**
   * @param {Event} event
   */
  $root.addEventListener("change", async (event) => {
    if (!event.target || event.target instanceof HTMLElement === false) return;
    if (event.target.id === "limit-select") {
      console.log("[Change Event] limit-select", event);

      const value = parseInt(event.target.value);
      if (value === appState.listResponse.pagination.limit) {
        return;
      }
      appStore.setListLoading(true);
      appState.listResponse.pagination.limit = value;
      appState.listResponse.pagination.page = 1;
      appState.listResponse.pagination.hasNext = true;
      appState.listResponse.pagination.hasPrev = false;
      appState.listResponse.products = [];
      $root.innerHTML = `
        ${homeRoute.render({
          loading: true,
          productListResponse: appState.listResponse,
          categories: appState.categories,
          cart: appState.cart,
        })}
      `;
      const props = await homeRoute.loader();
      $root.innerHTML = `
        ${homeRoute.render(props)}
      `;
      appStore.setListLoading(false);
    } else if (event.target.id === "sort-select") {
      console.log("[Change Event] sort-select", event);
      const value = event.target.value;
      if (value === appState.listResponse.filters.sort) return;
      appStore.setListLoading(true);
      appState.listResponse.filters.sort = value;
      appState.listResponse.pagination.page = 1;
      appState.listResponse.pagination.hasNext = true;
      appState.listResponse.pagination.hasPrev = false;
      appState.listResponse.products = [];
      $root.innerHTML = `
        ${homeRoute.render({
          loading: true,
          productListResponse: appState.listResponse,
          categories: appState.categories,
          cart: appState.cart,
        })}
      `;
      const props = await homeRoute.loader();
      $root.innerHTML = `
        ${homeRoute.render(props)}
      `;
      appStore.setListLoading(false);
    }
  });

  /**
   * @param {KeyboardEvent} event
   */
  $root.addEventListener("keydown", async (event) => {
    if (!event.target || event.target instanceof HTMLElement === false) return;

    if (event.target.id === "search-input" && event.key === "Enter") {
      const value = event.target.value;

      if (value === appState.listResponse.filters.search) return;

      appStore.setListLoading(true);
      appState.listResponse.filters.search = value;
      appState.listResponse.pagination.page = 1;
      appState.listResponse.pagination.hasNext = true;
      appState.listResponse.pagination.hasPrev = false;
      appState.listResponse.products = [];

      $root.innerHTML = `
        ${homeRoute.render({
          loading: true,
          productListResponse: appState.listResponse,
          categories: appState.categories,
          cart: appState.cart,
        })}
      `;
      const props = await homeRoute.loader();
      $root.innerHTML = `
        ${homeRoute.render(props)}
      `;
      appStore.setListLoading(false);
      console.log("[Keydown Event] search-input - Enter", value);
    }
  });

  /* Intersection Observer */
  // TODO: refactor with component identification structure
  ioSentinel = document.querySelector("#sentinel");
  if (!ioSentinel) throw new Error("Sentinel element not found");

  const io = new IntersectionObserver(
    async ([entry]) => {
      if (relativePath === homeRoute.path) {
        if (!entry.isIntersecting || !appState.listResponse.pagination.hasNext || appState.listLoading) return;
        appStore.setListLoading(true);
        $root.innerHTML = `
          ${homeRoute.render({ loading: true, cart: appState.cart })}
        `;
        const response = await getProducts({
          limit: appState.listResponse.pagination.limit,
          page: appState.listResponse.pagination.page + 1,
        });
        appStore.setListResponse({ products: [...appState.listResponse.products, ...response.products] });
        appState.listResponse.pagination.page = response.pagination.page;
        appState.listResponse.pagination.total = response.pagination.total;
        appState.listResponse.pagination.totalPages = response.pagination.totalPages;
        appState.listResponse.pagination.hasNext = response.pagination.hasNext;
        appState.listResponse.pagination.hasPrev = response.pagination.hasPrev;
        $root.innerHTML = `
          ${homeRoute.render({
            loading: false,
            productListResponse: appState.listResponse,
            categories: appState.categories,
            cart: appState.cart,
          })}
        `;
        appStore.setListLoading(false);
        console.log("[Intersection Observer] home - next page loaded", appState.listResponse.pagination.page);
      }
    },
    {
      root: null,
      rootMargin: "200px",
      threshold: 0,
    },
  );
  io.observe(ioSentinel);
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(() => main());
} else {
  main();
}
