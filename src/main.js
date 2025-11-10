import { createRouter } from "./router/Router.js";
import { Homepage } from "./pages/Homepage.js";
import { DetailPage } from "./pages/DetailPage.js";
import { getProducts, getProduct } from "./api/productApi.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) => worker.start({ onUnhandledRequest: "bypass" }));

// 1) 라우트 정의
const routes = [
  {
    path: "/",
    element: async () => {
      const root = document.querySelector("#root");
      root.innerHTML = Homepage({ loading: true });

      const data = await getProducts();
      return Homepage({ loading: false, ...data });
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

// 3) 카드 클릭 시 SPA 네비게이션
const handleCardClick = (event) => {
  const card = event.target.closest(".product-card");
  if (!card) return;
  console.log("card", card);

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
