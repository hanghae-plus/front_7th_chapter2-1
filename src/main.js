import { createRouter } from "./router/Router.js";
import { Homepage } from "./pages/Homepage.js";
import { DetailPage } from "./pages/DetailPage.js";
import { getProducts, getProduct } from "./api/productApi.js";
import { eventBus } from "./utils/EventBus.js";
import { attachSearchFormEnhancer } from "./router/enhancers/searchForm.js";
import { attachProductListEnhancer } from "./router/enhancers/productList.js";
import { renderProductItems } from "./components/ProductList.js";

const homepageState = {
  filters: {},
  products: [],
  pagination: null,
};

let isLoadingMore = false;

const resetHomepageState = () => {
  homepageState.filters = {};
  homepageState.products = [];
  homepageState.pagination = null;
  isLoadingMore = false;
};

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) => worker.start({ onUnhandledRequest: "bypass" }));

// 1) 라우트 정의
const routes = [
  {
    path: "/",
    element: async ({ query }) => {
      resetHomepageState();

      const root = document.querySelector("#root");
      root.innerHTML = Homepage({ loading: true, filters: query });

      const data = await getProducts(query);
      const mergedFilters = {
        ...query,
        ...(data?.filters ?? {}),
      };
      const products = Array.isArray(data?.products) ? data.products : [];
      const pagination = data?.pagination ?? null;

      homepageState.filters = mergedFilters;
      homepageState.products = products;
      homepageState.pagination = pagination;
      isLoadingMore = false;

      return Homepage({
        loading: false,
        filters: mergedFilters,
        products,
        pagination,
      });
    },
  },
  {
    path: "/products/:id",
    element: async ({ params }) => {
      const root = document.querySelector("#root");
      root.innerHTML = DetailPage({ loading: true });

      const product = await getProduct(params.id);
      return DetailPage({ loading: false, ...product });
    },
  },
];

// 2) 라우터 생성
const router = createRouter({
  routes,
  rootSelector: "#root",
});

eventBus.on("filters:change", (params) => {
  const search = params instanceof URLSearchParams ? params.toString() : new URLSearchParams(params).toString();
  const url = search ? `/?${search}` : "/";
  router.push(url);
});

attachSearchFormEnhancer(router);
attachProductListEnhancer(router);

eventBus.on("products:loadMore", async () => {
  if (isLoadingMore) {
    return;
  }

  const pagination = homepageState.pagination;
  if (!pagination || !pagination.hasNext) {
    const sentinel = document.querySelector("[data-infinite-trigger]");
    if (sentinel) {
      sentinel.dataset.loading = "false";
      sentinel.dataset.hasNext = "false";
      sentinel.innerHTML = `<span class="text-xs text-gray-500">모든 상품을 불러왔습니다</span>`;
    }
    return;
  }

  isLoadingMore = true;

  const nextPage = Number(pagination.page ?? 1) + 1;
  const params = {
    ...homepageState.filters,
    page: nextPage,
  };

  try {
    const data = await getProducts(params);
    const newProducts = Array.isArray(data?.products) ? data.products : [];
    const updatedPagination = data?.pagination ?? {
      ...pagination,
      page: nextPage,
      hasNext: false,
    };

    if (newProducts.length) {
      const grid = document.querySelector("#products-grid");
      if (grid) {
        grid.insertAdjacentHTML("beforeend", renderProductItems(newProducts));
      }
    }

    homepageState.products = homepageState.products.concat(newProducts);
    homepageState.pagination = updatedPagination;

    const sentinel = document.querySelector("[data-infinite-trigger]");
    if (sentinel) {
      sentinel.dataset.loading = "false";
      sentinel.dataset.hasNext = updatedPagination.hasNext ? "true" : "false";
      sentinel.dataset.nextPage = String((updatedPagination.page ?? nextPage) + 1);
      const message = updatedPagination.hasNext
        ? "아래로 스크롤하면 더 많은 상품을 불러옵니다"
        : "모든 상품을 불러왔습니다";
      sentinel.innerHTML = `<span class="text-xs text-gray-500">${message}</span>`;
    }
  } catch (error) {
    console.error("상품 추가 로딩에 실패했습니다.", error);
    const sentinel = document.querySelector("[data-infinite-trigger]");
    if (sentinel) {
      sentinel.dataset.loading = "false";
      sentinel.innerHTML = `
        <button type="button" class="text-xs text-red-500 underline" data-infinite-retry>
          상품을 불러오지 못했습니다. 다시 시도하기
        </button>
      `;
    }
  } finally {
    isLoadingMore = false;
  }
});

// 3) 카드 클릭 시 SPA 네비게이션
const handleCardClick = (event) => {
  const card = event.target.closest(".product-card");
  if (!card) return;

  const productId = card.dataset.productId;
  if (!productId) return;

  router.push(`/products/${productId}`);
};

document.body.addEventListener("click", handleCardClick);

// 4) 애플리케이션 시작
const startApp = () => {
  router.start();
};

if (import.meta.env.MODE !== "test") {
  enableMocking().then(startApp);
} else {
  startApp();
}
