import { getProducts } from "./api/productApi";
import CartModal from "./components/CartModal";
import { ROUTES } from "./route";
import appStore from "./store/app-store";
import { extractParams } from "./utils/route";

/**
 * @typedef {import('./types.js').CategoryTreeNode} CategoryTreeNode
 * @typedef {import('./types.js').ProductListResponse} ProductListResponse
 */

/** @type {HTMLElement | null} */
let ioSentinel = null;

/* Utils */

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
      onUnhandledRequest: "bypass",
    }),
  );

async function main() {
  const basePath = import.meta.env.BASE_URL;
  const pathName = window.location.pathname;
  const relativePath = pathName.replace(basePath, "/").replace(/\/$/, "") || "/";

  const homeRoute = ROUTES.home;
  const productDetailRoute = ROUTES.productDetail;

  /** @type {HTMLElement | null} */
  const $root = document.querySelector("#root");
  const $cartModalRoot = document.querySelector("#cart-modal-root");

  const appState = appStore.getState();

  if (!$root) throw new Error("Root element not found");
  if (!$cartModalRoot) throw new Error("Cart modal root element not found");

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
  }

  /* Event Handlers */

  // PopState Event Handler
  /**
   * @param {PopStateEvent} event
   */
  window.addEventListener("popstate", async (event) => {
    console.log("[PopState Event]", event, window.location, event.state);
    const currentPathName = window.location.pathname;
    const currentRelativePath = currentPathName.replace(basePath, "/").replace(/\/$/, "") || "/";
    const targetRoute = Object.values(ROUTES).find((route) => route.pattern.test(currentRelativePath));
    if (!targetRoute) throw new Error("Route not found");
    const params = extractParams(targetRoute.path, currentRelativePath);
    const props = await targetRoute.loader(params);
    $root.innerHTML = `
      ${targetRoute.render(props)}
    `;
  });

  // Cart Modal Event Handlers
  /**
   * @param {MouseEvent} event
   */
  $cartModalRoot.addEventListener("click", async (event) => {
    console.log("[Click Event] cart-modal-root", event);
    if (event.target.closest("#cart-modal-close-btn")) {
      console.log("[Click Event] cart-modal-close-btn", event);
      $cartModalRoot.innerHTML = "";
      appStore.setSelectedCartIds([]);
    }
  });

  // Root Event Handlers
  /**
   * @param {MouseEvent} event
   */
  $root.addEventListener("click", async (event) => {
    console.log("[Click Event]", event.target);
    if (!event.target) return;

    if (event.target.id === "category-filter-btn") {
      console.log("[Click Event] category-filter-btn", event);
      const value1 = event.target.dataset.category1;
      const value2 = event.target.dataset.category2;
      if (value1 === appState.listResponse.filters.category1 && value2 === appState.listResponse.filters.category2)
        return;
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
    } else if (event.target.dataset.breadcrumb === "reset") {
      console.log("[Click Event] breadcrumb - reset", event);
      if (appState.listResponse.filters.category1 === "" && appState.listResponse.filters.category2 === "") return;
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
    } else if (event.target.dataset.breadcrumb === "category1") {
      console.log("[Click Event] breadcrumb - category1", event);
      const value = event.target.dataset.category1;
      if (value === appState.listResponse.filters.category1 && appState.listResponse.filters.category2 === "") return;
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
    } else if (event.target.id === "add-to-cart-btn") {
      console.log("[Click Event] add-to-cart-btn", event);
      const productId = event.target.dataset.productId;
      if (!productId) return;
      appStore.addToCart(productId, appState.cartItemCount);
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
        const route = Object.values(ROUTES).find((route) => route.pattern.test(linkHref));
        if (!route) throw new Error("Route not found");
        history.pushState(null, "", `${basePath}${linkHref.replace("/", "")}`);
        const params = extractParams(route.path, linkHref);
        const props = await route.loader(params);
        $root.innerHTML = `
          ${route.render(props)}
        `;
      } else if (linkElement.closest("[data-go-back]")) {
        history.back();
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
    } else if (event.target.id === "sort-select") {
      console.log("[Change Event] sort-select", event);
      const value = event.target.value;
      if (value === appState.listResponse.filters.sort) return;
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
  enableMocking().then(main);
} else {
  main();
}
