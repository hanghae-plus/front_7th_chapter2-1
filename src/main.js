import { router } from "./router.js";
import { store } from "./store/store.js";
import { HomePage } from "./pages/HomePage.js";
import { DetailPage } from "./pages/DetailPage.js";
import { getProducts, getCategories } from "./api/productApi";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

document.body.addEventListener("click", (e) => {
  if (e.target.closest(".product-card")) {
    const productId = e.target.closest(".product-card").dataset.productId;
    router.push(`/products/${productId}`);
  }

  // category1 버튼 클릭
  if (e.target.closest(".category1-filter-btn")) {
    const category1 = e.target.closest(".category1-filter-btn").dataset.category1;
    store.setState({ category1, category2: "" });
    router.push(`?category1=${category1}`);
  }

  // category2 버튼 클릭
  if (e.target.closest(".category2-filter-btn")) {
    const category1 = e.target.closest(".category2-filter-btn").dataset.category1;
    const category2 = e.target.closest(".category2-filter-btn").dataset.category2;
    store.setState({ category1, category2 });
    router.push(`?category1=${category1}&category2=${category2}`);
  }

  // 전체 버튼 클릭
  if (e.target.closest('[data-breadcrumb="reset"]')) {
    store.setState({ category1: "", category2: "" });
    router.push(`?`);
  }
});

function syncStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const category1 = params.get("category1") || "";
  const category2 = params.get("category2") || "";

  if (store.state.category1 !== category1 || store.state.category2 !== category2) {
    store.setState({ category1, category2 });
  }
}

const loadProducts = async () => {
  const { category1, category2, pagination } = store.state;
  const filters = {
    page: pagination.page,
    limit: pagination.limit,
    ...(category1 && { category1 }),
    ...(category2 && { category2 }),
  };

  store.setState({ loading: true });
  const response = await getProducts(filters);
  store.setState({
    products: response.products,
    pagination: response.pagination,
    loading: false,
  });
};

const loadCategories = async () => {
  const response = await getCategories();
  store.setState({ categories: response });
};

// 라우터 초기 세팅
const render = async ({ isQueryOnly = false } = {}) => {
  syncStateFromUrl();
  const path = router.path;
  if (path === "/") {
    if (!isQueryOnly) {
      await HomePage(); // 전체 렌더
      await loadCategories();
    }
    await loadProducts(); // 공통
  } else if (path.startsWith("/products")) {
    DetailPage();
  }
};

async function main() {
  router.setup();
  render();
  router.subscribe(render);
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
