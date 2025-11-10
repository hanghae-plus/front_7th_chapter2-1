import HomePage from "./pages/HomePage";
import { getProducts, getProduct } from "./api/productApi";
import ProductDetailPage from "./pages/ProductDetailPage";

let listLoading = false;
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
let cart = [];

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

async function main() {
  const pathName = window.location.pathname;

  const $root = document.querySelector("#root");

  if (pathName === "/") {
    $root.innerHTML = `
      ${HomePage({ loading: true, cart })}
    `;
    listResponse = await getProducts({
      limit: listResponse.pagination.limit,
      search: listResponse.filters.search,
    });
    console.log(listResponse);
    $root.innerHTML = `
      ${HomePage({ loading: false, response: listResponse, cart })}
    `;
  } else if (pathName.startsWith("/product/")) {
    const id = pathName.split("/")[2];
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
        ${HomePage({ loading: true, cart })}
      `;
      listResponse = await getProducts({ limit: listResponse.pagination.limit });
      console.log("event", listResponse);
      $root.innerHTML = `
        ${HomePage({ loading: false, response: listResponse, cart })}
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
        ${HomePage({ loading: true, response: listResponse, cart })}
      `;
      listResponse = await getProducts({
        limit: listResponse.pagination.limit,
        search: listResponse.filters.search,
        sort: listResponse.filters.sort,
      });
      console.log("event", listResponse);
      $root.innerHTML = `
        ${HomePage({ loading: false, response: listResponse, cart })}
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
        ${HomePage({ loading: true, cart })}
      `;
      listResponse = await getProducts({
        limit: listResponse.pagination.limit,
        search: listResponse.filters.search,
      });
      $root.innerHTML = `
        ${HomePage({ loading: false, response: listResponse, cart })}
      `;
    }
  });

  /* Intersection Observer */
  // TODO: refactor with component identification structure
  ioSentinel = document.querySelector("#sentinel");
  const io = new IntersectionObserver(
    async ([entry]) => {
      console.log("entry", entry.isIntersecting, listResponse.pagination.hasNext, listLoading);
      if (!entry.isIntersecting || !listResponse.pagination.hasNext || listLoading) return;
      listLoading = true;
      $root.innerHTML = `
        ${HomePage({ loading: true, response: listResponse })}
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
      console.log("listResponse- IO", response, listResponse);
      $root.innerHTML = `
        ${HomePage({ loading: false, response: listResponse })}
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

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
