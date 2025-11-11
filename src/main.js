import { store } from "../store.js";
import { getCategories, getProduct, getProducts } from "./api/productApi.js";
import { MainPage } from "./pages/MainPage.js";
import { ProductDetailPage } from "./pages/ProductDetailPage.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
    }),
  );

let searchKeyHandlerAttached = false;
let searchHandlerRef = null;
let detailFetchId = null;
let detailFetchPromise = null;

const syncQueryParam = (key, value, defaultValue = "") => {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const shouldRemove = value === undefined || value === null || value === "" || value === defaultValue;

  if (shouldRemove) {
    params.delete(key);
  } else {
    params.set(key, value);
  }

  const queryString = params.toString();
  const nextUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
  history.replaceState(null, "", nextUrl);
};

const searchKeyHandler = (runSearch) => {
  searchHandlerRef = runSearch;
  if (searchKeyHandlerAttached) return;

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;

    const target = event.target;
    if (!target || target.id !== "search-input") return;

    event.preventDefault();
    const input = target.value ?? "";
    if (typeof searchHandlerRef === "function") {
      searchHandlerRef(input);
    }
  });

  searchKeyHandlerAttached = true;
};

const getProductIdFromPath = (path) => {
  const match = /^\/products\/([^/]+)$/.exec(path);
  return match ? decodeURIComponent(match[1]) : null;
};

const render = () => {
  // 렌더될 root 요소
  const $root = document.getElementById("root");
  // API fetch 여부
  let isFetchingProducts = false;

  // 제품 목록 로드
  const loadProducts = async () => {
    if (isFetchingProducts) return;
    if (store.state.path !== "/") return;
    if (store.state.isLoaded) return;

    isFetchingProducts = true;
    try {
      if (!store.state.categories || !Object.keys(store.state.categories).length) {
        const categories = await getCategories();
        store.setState({ categories });
      }

      const products = await getProducts({
        limit: Number(store.state.limit) || 20,
        sort: store.state.sort,
        search: store.state.search,
      });
      store.setState({ products, isLoaded: true });
    } finally {
      isFetchingProducts = false;
    }
  };

  const fetchProductDetail = async (productId) => {
    if (!productId) return;

    if (store.state.currentProduct?.productId === productId) {
      return;
    }

    if (detailFetchPromise && detailFetchId === productId) {
      return detailFetchPromise;
    }

    detailFetchId = productId;
    detailFetchPromise = (async () => {
      const currentProduct = await getProduct(productId);
      let relatedProducts = await getProducts({ category2: currentProduct.category2 });
      relatedProducts = relatedProducts.products.filter((product) => product.productId !== productId);
      store.setState({ currentProduct, relatedProducts });
    })();

    try {
      await detailFetchPromise;
    } finally {
      detailFetchPromise = null;
      detailFetchId = null;
    }
  };

  const handleStateChange = async (state) => {
    if (state.path === "/") {
      if (!state.isLoaded && !isFetchingProducts) {
        loadProducts();
      }

      $root.innerHTML = MainPage();
      return;
    }

    const productId = getProductIdFromPath(state.path);
    if (productId) {
      await fetchProductDetail(productId);
      $root.innerHTML = ProductDetailPage();
      return;
    }

    $root.innerHTML = ProductDetailPage();
  };

  store.subscribe(handleStateChange);

  // navigate 처리
  const navigate = (path) => {
    if (path === store.state.path) return;
    history.pushState(null, "", path);
    store.setState({ path });
  };

  // 클릭 이벤트
  document.body.addEventListener("click", async (e) => {
    const $productCard = e.target.closest(".product-card") || e.target.closest(".related-product-card");
    if ($productCard) {
      const productId = $productCard.dataset.productId;
      navigate(`/products/${productId}`);

      const currentProduct = await getProduct(productId);
      let relatedProducts = await getProducts({ category2: currentProduct.category2 });

      relatedProducts = relatedProducts.products.filter((product) => {
        return product.productId !== productId;
      });
      store.setState({ currentProduct, relatedProducts: relatedProducts });
      return;
    }

    const $link = e.target.closest("[data-link]");
    if ($link) {
      e.preventDefault();
      navigate($link.getAttribute("href") || "/");
    }
  });

  document.body.addEventListener("change", (e) => {
    const target = e.target;
    if (!target) return;

    if (target.id === "sort-select") {
      const sortValue = target.value;
      if (sortValue === store.state.sort) return;
      store.setState({ isLoaded: false, sort: sortValue });
      syncQueryParam("sort", sortValue, "price_asc");
      return;
    }

    if (target.id === "limit-select") {
      const limitValue = target.value;
      if (limitValue === store.state.limit) return;
      store.setState({ isLoaded: false, limit: limitValue });
      syncQueryParam("limit", limitValue, "20");
    }
  });

  window.addEventListener("popstate", () => {
    store.setState({ path: window.location.pathname });
  });

  const performSearch = (value) => {
    const trimmed = value.trim();
    if (trimmed === store.state.search) return;
    store.setState({ isLoaded: false, search: trimmed });
    syncQueryParam("search", trimmed, "");
  };

  searchKeyHandler(performSearch);

  store.setState({ path: window.location.pathname });
};

const main = () => {
  render();
};

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
