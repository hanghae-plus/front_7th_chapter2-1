import { createRouter } from "./router/Router.js";
import { Homepage } from "./pages/Homepage.js";
import { DetailPage } from "./pages/DetailPage.js";
import { getProducts, getProduct } from "./api/productApi.js";
import { attachSearchFormEnhancer } from "./router/enhancers/searchForm.js";
import { attachProductListEnhancer } from "./router/enhancers/productList.js";
import { registerHomepageEvents } from "./events/homepageEvents.js";
import { resetHomepageState, setHomepageState } from "./store/appStore.js";

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

      setHomepageState({
        filters: mergedFilters,
        products,
        pagination,
        isLoadingMore: false,
      });

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

attachSearchFormEnhancer(router);
attachProductListEnhancer(router);
registerHomepageEvents(router);

// 4) 애플리케이션 시작
const startApp = () => {
  router.start();
};

if (import.meta.env.MODE !== "test") {
  enableMocking().then(startApp);
} else {
  startApp();
}
