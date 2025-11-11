import HomePage from "./pages/HomePage";
import { getProducts, getProduct, getCategories } from "./api/productApi";
import ProductDetailPage from "./pages/ProductDetailPage";

/**
 * @typedef {import('./types.js').CategoryTreeNode} CategoryTreeNode
 * @typedef {import('./types.js').ProductListResponse} ProductListResponse
 */

let listLoading = false;
/** @type {ProductListResponse} */
let listResponse = {
  products: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: true,
    hasPrev: false,
  },
  filters: {
    search: "",
    category1: "",
    category2: "",
    sort: "price_asc",
  },
};
let ioSentinel = null;
/** @type {string[]} */
let cart = [];
/** @type {CategoryTreeNode[]} */
let categories = [];

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

  const $root = document.querySelector("#root");

  if (relativePath === "/") {
    $root.innerHTML = `
      ${HomePage({ loading: true, productListResponse: listResponse, categories, cart })}
    `;
    categories = await getCategories();
    console.log("categories", categories);
    listResponse = await getProducts({
      limit: listResponse.pagination.limit,
      search: listResponse.filters.search,
      category1: listResponse.filters.category1,
      category2: listResponse.filters.category2,
      sort: listResponse.filters.sort,
    });
    console.log(listResponse);
    $root.innerHTML = `
      ${HomePage({ loading: false, productListResponse: listResponse, categories, cart })}
    `;
  } else if (relativePath.startsWith("/product/")) {
    const id = relativePath.split("/")[2];
    $root.innerHTML = `
      ${ProductDetailPage({ loading: true, cart })}
    `;
    const response = await getProduct(id);
    console.log(response);
    $root.innerHTML = `
      ${ProductDetailPage({ loading: false, response, cart })}
    `;
  }

  /* Event Handlers */
  $root.addEventListener("click", async (event) => {
    console.log(event);
    if (event.target.id === "limit-select") {
      const value = parseInt(event.target.value);
      if (value === listResponse.pagination.limit) {
        return;
      }
      listResponse.pagination.limit = value;
      listResponse.pagination.page = 1;
      listResponse.pagination.hasNext = true;
      listResponse.pagination.hasPrev = false;
      listResponse.products = [];

      listResponse.filters.search = "";

      $root.innerHTML = `
        ${HomePage({ loading: true, productListResponse: listResponse, categories, cart })}
      `;
      listResponse = await getProducts({
        limit: listResponse.pagination.limit,
        search: listResponse.filters.search,
        category1: listResponse.filters.category1,
        category2: listResponse.filters.category2,
        sort: listResponse.filters.sort,
      });
      console.log("event", listResponse);
      $root.innerHTML = `
        ${HomePage({ loading: false, productListResponse: listResponse, categories, cart })}
      `;
    } else if (event.target.id === "sort-select") {
      const value = event.target.value;
      if (value === listResponse.filters.sort) return;
      listResponse.filters.sort = value;
      listResponse.pagination.page = 1;
      listResponse.pagination.hasNext = true;
      listResponse.pagination.hasPrev = false;
      listResponse.products = [];
      $root.innerHTML = `
        ${HomePage({ loading: true, productListResponse: listResponse, categories, cart })}
      `;
      listResponse = await getProducts({
        limit: listResponse.pagination.limit,
        search: listResponse.filters.search,
        category1: listResponse.filters.category1,
        category2: listResponse.filters.category2,
        sort: listResponse.filters.sort,
      });
      console.log("event", listResponse);
      $root.innerHTML = `
        ${HomePage({ loading: false, productListResponse: listResponse, categories, cart })}
      `;
    } else if (event.target.id === "category-filter-btn") {
      const value1 = event.target.dataset.category1;
      const value2 = event.target.dataset.category2;
      if (value1 === listResponse.filters.category1 && value2 === listResponse.filters.category2) return;
      listResponse.filters.category1 = value1;
      listResponse.filters.category2 = value2;
      listResponse.pagination.page = 1;
      listResponse.pagination.hasNext = true;
      listResponse.pagination.hasPrev = false;
      listResponse.products = [];
      $root.innerHTML = `
        ${HomePage({ loading: true, productListResponse: listResponse, categories, cart })}
      `;
      listResponse = await getProducts({
        limit: listResponse.pagination.limit,
        search: listResponse.filters.search,
        category1: listResponse.filters.category1,
        category2: listResponse.filters.category2,
        sort: listResponse.filters.sort,
      });
      $root.innerHTML = `
        ${HomePage({ loading: false, productListResponse: listResponse, categories, cart })}
      `;
    } else if (event.target.dataset.breadcrumb === "reset") {
      if (listResponse.filters.category1 === "" && listResponse.filters.category2 === "") return;
      listResponse.filters.category1 = "";
      listResponse.filters.category2 = "";
      listResponse.pagination.page = 1;
      listResponse.pagination.hasNext = true;
      listResponse.pagination.hasPrev = false;
      listResponse.products = [];
      $root.innerHTML = `
        ${HomePage({ loading: true, productListResponse: listResponse, categories, cart })}
      `;
      listResponse = await getProducts({
        limit: listResponse.pagination.limit,
        search: listResponse.filters.search,
        category1: listResponse.filters.category1,
        category2: listResponse.filters.category2,
        sort: listResponse.filters.sort,
      });
      $root.innerHTML = `
        ${HomePage({ loading: false, productListResponse: listResponse, categories, cart })}
      `;
    } else if (event.target.dataset.breadcrumb === "category1") {
      const value = event.target.dataset.category1;
      if (value === listResponse.filters.category1 && listResponse.filters.category2 === "") return;
      listResponse.filters.category1 = value;
      listResponse.filters.category2 = "";
      listResponse.pagination.page = 1;
      listResponse.pagination.hasNext = true;
      listResponse.pagination.hasPrev = false;
      listResponse.products = [];
      $root.innerHTML = `
        ${HomePage({ loading: false, productListResponse: listResponse, categories, cart })}
      `;
      listResponse = await getProducts({
        limit: listResponse.pagination.limit,
        search: listResponse.filters.search,
        category1: listResponse.filters.category1,
        category2: listResponse.filters.category2,
        sort: listResponse.filters.sort,
      });
      $root.innerHTML = `
        ${HomePage({ loading: false, productListResponse: listResponse, categories, cart })}
      `;
    } else if (event.target.id === "add-to-cart-btn") {
      const productId = event.target.dataset.productId;
      console.log("add-to-cart-btn", productId);
      if (cart.includes(productId)) return;
      cart.push(productId);
      console.log("cart", cart);
    }
  });

  $root.addEventListener("keydown", async (event) => {
    if (event.target.id === "search-input" && event.key === "Enter") {
      const value = event.target.value;

      if (value === listResponse.filters.search) return;

      listResponse.filters.search = value;
      listResponse.pagination.page = 1;
      listResponse.pagination.hasNext = true;
      listResponse.pagination.hasPrev = false;
      listResponse.products = [];

      $root.innerHTML = `
        ${HomePage({ loading: true, productListResponse: listResponse, categories, cart })}
      `;
      listResponse = await getProducts({
        limit: listResponse.pagination.limit,
        search: listResponse.filters.search,
        category1: listResponse.filters.category1,
        category2: listResponse.filters.category2,
        sort: listResponse.filters.sort,
      });
      $root.innerHTML = `
        ${HomePage({ loading: false, productListResponse: listResponse, categories, cart })}
      `;
    }
  });

  /* Intersection Observer */
  // TODO: refactor with component identification structure
  if (relativePath === "/") {
    ioSentinel = document.querySelector("#sentinel");
    const io = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || !listResponse.pagination.hasNext || listLoading) return;
        listLoading = true;
        $root.innerHTML = `
        ${HomePage({ loading: true, productListResponse: listResponse, categories, cart })}
      `;
        const response = await getProducts({
          limit: listResponse.pagination.limit,
          page: listResponse.pagination.page + 1,
        });
        listResponse.products.push(...response.products);
        listResponse.pagination.page = response.pagination.page;
        listResponse.pagination.total = response.pagination.total;
        listResponse.pagination.totalPages = response.pagination.totalPages;
        listResponse.pagination.hasNext = response.pagination.hasNext;
        listResponse.pagination.hasPrev = response.pagination.hasPrev;
        $root.innerHTML = `
        ${HomePage({ loading: false, productListResponse: listResponse, categories, cart })}
      `;
        listLoading = false;
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
