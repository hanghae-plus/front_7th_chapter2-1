import { getProducts, getProduct, getCategories } from "./api/productApi";
import { ROUTES } from "./route";
import appStore from "./store/app-store";
import { extractParams } from "./utils/route";

/**
 * @typedef {import('./types.js').CategoryTreeNode} CategoryTreeNode
 * @typedef {import('./types.js').ProductListResponse} ProductListResponse
 */

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

  console.log(basePath, relativePath);
  const homeRoute = ROUTES.home;
  const productDetailRoute = ROUTES.productDetail;

  /** @type {HTMLElement | null} */
  const $root = document.querySelector("#root");

  const appState = appStore.getState();

  if (!$root) throw new Error("Root element not found");

  if (relativePath === homeRoute.path) {
    $root.innerHTML = `
      ${homeRoute.render({ loading: true, cart: appState.cart })}
    `;
    const categoriesResponse = await getCategories();
    appStore.setCategories(categoriesResponse);
    const listResponse = await getProducts({
      limit: appState.listResponse.pagination.limit,
      search: appState.listResponse.filters.search,
      category1: appState.listResponse.filters.category1,
      category2: appState.listResponse.filters.category2,
      sort: appState.listResponse.filters.sort,
    });
    appStore.setListResponse(listResponse);

    $root.innerHTML = `
      ${homeRoute.render({
        loading: false,
        productListResponse: appState.listResponse,
        categories: appState.categories,
        cart: appState.cart,
      })}
    `;
  } else if (productDetailRoute.pattern.test(relativePath)) {
    const id = relativePath.split("/")[2];
    $root.innerHTML = `
      ${productDetailRoute.render({ loading: true, cart: appState.cart })}
    `;
    const response = await getProduct(id);
    appStore.setProductDetail(response);

    $root.innerHTML = `
      ${productDetailRoute.render({ loading: false, response: appState.productDetail, cart: appState.cart })}
    `;
  }

  /* Event Handlers */
  /**
   * @param {MouseEvent} event
   */
  $root.addEventListener("click", async (event) => {
    if (!event.target) return;
    console.log(event);

    if (event.target.id === "limit-select") {
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
      const listResponse = await getProducts({
        limit: appState.listResponse.pagination.limit,
        search: appState.listResponse.filters.search,
        category1: appState.listResponse.filters.category1,
        category2: appState.listResponse.filters.category2,
        sort: appState.listResponse.filters.sort,
      });
      appStore.setListResponse(listResponse);
      $root.innerHTML = `
        ${homeRoute.render({
          loading: false,
          productListResponse: appState.listResponse,
          categories: appState.categories,
          cart: appState.cart,
        })}
      `;
    } else if (event.target.id === "sort-select") {
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
      const listResponse = await getProducts({
        limit: appState.listResponse.pagination.limit,
        search: appState.listResponse.filters.search,
        category1: appState.listResponse.filters.category1,
        category2: appState.listResponse.filters.category2,
        sort: appState.listResponse.filters.sort,
      });
      appStore.setListResponse(listResponse);
      $root.innerHTML = `
        ${homeRoute.render({
          loading: false,
          productListResponse: appState.listResponse,
          categories: appState.categories,
          cart: appState.cart,
        })}
      `;
    } else if (event.target.id === "category-filter-btn") {
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
      const listResponse = await getProducts({
        limit: appState.listResponse.pagination.limit,
        search: appState.listResponse.filters.search,
        category1: appState.listResponse.filters.category1,
        category2: appState.listResponse.filters.category2,
        sort: appState.listResponse.filters.sort,
      });
      appStore.setListResponse(listResponse);
      $root.innerHTML = `
        ${homeRoute.render({
          loading: false,
          productListResponse: appState.listResponse,
          categories: appState.categories,
          cart: appState.cart,
        })}
      `;
    } else if (event.target.dataset.breadcrumb === "reset") {
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
      const listResponse = await getProducts({
        limit: appState.listResponse.pagination.limit,
        search: appState.listResponse.filters.search,
        category1: appState.listResponse.filters.category1,
        category2: appState.listResponse.filters.category2,
        sort: appState.listResponse.filters.sort,
      });
      appStore.setListResponse(listResponse);
      $root.innerHTML = `
        ${homeRoute.render({
          loading: false,
          productListResponse: appState.listResponse,
          categories: appState.categories,
          cart: appState.cart,
        })}
      `;
    } else if (event.target.dataset.breadcrumb === "category1") {
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
      const listResponse = await getProducts({
        limit: appState.listResponse.pagination.limit,
        search: appState.listResponse.filters.search,
        category1: appState.listResponse.filters.category1,
        category2: appState.listResponse.filters.category2,
        sort: appState.listResponse.filters.sort,
      });
      appStore.setListResponse(listResponse);
      $root.innerHTML = `
        ${homeRoute.render({
          loading: false,
          productListResponse: appState.listResponse,
          categories: appState.categories,
          cart: appState.cart,
        })}
      `;
    } else if (event.target.id === "add-to-cart-btn") {
      const productId = event.target.dataset.productId;
      if (!productId) return;
      if (appState.cart.includes(productId)) return;
      appStore.setCart([...appState.cart, productId]);
    } else if (event.target.closest("[data-link]")) {
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
      } else if (linkElement.dataset.linkGoBack) {
        history.back();
      }
    }
  });

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
      const listResponse = await getProducts({
        limit: appState.listResponse.pagination.limit,
        search: appState.listResponse.filters.search,
        category1: appState.listResponse.filters.category1,
        category2: appState.listResponse.filters.category2,
        sort: appState.listResponse.filters.sort,
      });
      appStore.setListResponse(listResponse);
      $root.innerHTML = `
        ${homeRoute.render({
          loading: false,
          productListResponse: appState.listResponse,
          categories: appState.categories,
          cart: appState.cart,
        })}
      `;
    }
  });

  /* Intersection Observer */
  // TODO: refactor with component identification structure
  if (relativePath === homeRoute.path) {
    /** @type {HTMLElement | null} */
    ioSentinel = document.querySelector("#sentinel");
    if (!ioSentinel) throw new Error("Sentinel element not found");

    const io = new IntersectionObserver(
      async ([entry]) => {
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
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0,
      },
    );
    io.observe(ioSentinel);
  }
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
