import { getCategories, getProduct, getProducts } from "./api/productApi.js";
import { ProductList } from "./components/ProductList.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";
import { updateCategoryUI } from "./utils/categoryUI.js";
import { findRoute, initRouter, push } from "./utils/router.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

const render = async () => {
  const $root = document.querySelector("#root");

  const { route, params } = findRoute(location.pathname);
  console.log("main.js", location.pathname, route, params);

  if (!route) {
    $root.innerHTML = NotFoundPage();
    return;
  }

  if (route.path === "/") {
    $root.innerHTML = route.component({ loading: true });
    const query = new URLSearchParams(location.search);
    const search = query.get("search") || "";
    const limit = Number(query.get("limit")) || 20;
    const sort = query.get("sort") || "price_asc";
    //TODO : Q. 병렬 구성은 어려울까?? (렌더링을 html태그 단위로 하게 될것같아서, 내부에서 처리해야하나???)
    const [categories, products] = await Promise.all([
      getCategories(),
      getProducts({ search: search, category1: selectedCat1, category2: selectedCat2, limit, sort }),
    ]);
    $root.innerHTML = route.component({
      categories,
      products,
      loading: false,
    });
  } else if (route.path === "/cart") {
    $root.innerHTML = route.component({ cartProducts: ["pr"] });
  } else if (route.path === "/products/:id") {
    $root.innerHTML = route.component({ loading: true });
    const productId = params[0];
    const data = await getProduct(productId);
    console.log("product data:", data);
    if (!data || data.error) {
      $root.innerHTML = NotFoundPage();
      return;
    }
    $root.innerHTML = route.component({ product: data });
  }
};
const refreshProducts = async () => {
  const query = new URLSearchParams(location.search);
  const search = query.get("search") || "";
  const limit = Number(query.get("limit")) || 20;
  const sort = query.get("sort") || "price_asc";
  const [products] = await Promise.all([
    getProducts({ search, category1: selectedCat1, category2: selectedCat2, limit, sort }),
  ]);
  const $productListContainer = document.querySelector("#product-container");

  if ($productListContainer) {
    $productListContainer.outerHTML = ProductList({
      loading: false,
      products: products.products,
    });
  }
  query.set("search", "");
};

//TODO: Q. 이렇게 모든 액션에 대해 이벤트 등록을 해야한다고??
/* 이벤트 등록 영역 */
// 카테고리 상태 관리
let selectedCat1 = null;
let selectedCat2 = null;
// 통합 클릭 이벤트 핸들러
document.body.addEventListener("click", (e) => {
  const target = e.target;

  //상품 카드 클릭
  const productCard = target.closest(".product-card");
  if (productCard) {
    push(`/products/${productCard.dataset.productId}`);
    return;
  }

  // 카테고리 필터 클릭
  const resetBtn = target.closest('[data-breadcrumb="reset"]');
  const cat1Btn = target.closest(".category1-filter-btn, [data-breadcrumb='category1']");
  const cat2Btn = target.closest(".category2-filter-btn");

  if (resetBtn) {
    selectedCat1 = null;
    selectedCat2 = null;

    const query = new URLSearchParams(location.search);
    query.delete("category1");
    query.delete("category2");
    history.pushState(null, null, query.toString() ? `/?${query}` : "/");

    updateCategoryUI(selectedCat1, selectedCat2);
    refreshProducts();
  } else if (cat1Btn) {
    selectedCat1 = cat1Btn.dataset.category1;
    selectedCat2 = null;

    const query = new URLSearchParams(location.search);
    query.set("category1", selectedCat1);
    query.delete("category2");

    history.pushState(null, null, `/?${query}`);
    updateCategoryUI(selectedCat1, selectedCat2);
    refreshProducts();
  } else if (cat2Btn) {
    selectedCat1 = cat2Btn.dataset.category1;
    selectedCat2 = cat2Btn.dataset.category2;

    const query = new URLSearchParams(location.search);
    query.set("category1", selectedCat1);
    query.set("category2", selectedCat2);

    history.pushState(null, null, `/?${query}`);
    updateCategoryUI(selectedCat1, selectedCat2);
    refreshProducts();
  }
});

document.addEventListener("change", (e) => {
  const target = e.target;

  const selectedLimit = target.closest("#limit-select")?.value;
  const selectedSort = target.closest("#sort-select")?.value;
  const query = new URLSearchParams(location.search);
  if (selectedLimit) query.set("limit", selectedLimit);
  if (selectedSort) query.set("sort", selectedSort);
  history.pushState(null, null, `/?${query}`);
  refreshProducts();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.closest("#search-input")) {
    e.preventDefault();
    const keyword = e.target.value.trim();
    const query = new URLSearchParams(location.search);
    if (keyword) {
      query.set("search", keyword);
      history.pushState(null, null, `/?${query}`);
    } else {
      query.delete("search");
      history.pushState(null, null, `/`);
    }

    refreshProducts();
  }
});

initRouter(render);

const main = async () => {
  render();
};

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
