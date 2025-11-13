import { getCategories, getProduct, getProducts } from "./api/productApi.js";
import { DetailPage2 } from "./pages/DetailPage2.js";
import { HomePage2 } from "./pages/HomePage2.js";
import { CartUtil } from "./utils/cart.js";
import { LocalStorageUtil } from "./utils/localstorage.js";
import { Router2 } from "./utils/Router2.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker
      .start({
        serviceWorker: {
          url: `${BASE_URL}mockServiceWorker.js`,
        },
        onUnhandledRequest: "bypass",
      })
      .then(() => {
        console.log("MSW 초기화 완료!");
        // MSW 완전히 준비될 때까지 잠시 대기
        return new Promise((resolve) => setTimeout(resolve, 100));
      }),
  );

const BASE_URL = import.meta.env.BASE_URL;

// V2
const $root = document.querySelector("#root");
const router = new Router2($root);
window.router2Instance = router;
window.BASE_URL = import.meta.env.BASE_URL;

let categories;
router.addRoute({
  path: "/",
  loader: async ({ queryString }) => {
    const search = queryString.search ?? "";
    const category1 = queryString.category1 ?? "";
    const category2 = queryString.category2 ?? "";
    const sort = queryString.sort ?? "";
    const limit = queryString.limit ?? "";

    const data = await getProducts({ search, category1, category2, sort, limit });
    if (!categories) {
      categories = await getCategories();
    }
    return { ...data, categories };
  },
  component: HomePage2,
  cacheKeys: ["categories"],
});

router.addRoute({
  path: "/product/:productId",
  loader: async ({ params }) => {
    const productId = params.productId;
    const product = await getProduct(productId);
    let relatedProducts = [];
    if (!product.error) {
      relatedProducts = (await getProducts({ page: 1, category2: product.category2 })).products.filter(
        (product) => product.productId !== productId,
      );
    }
    return { product, relatedProducts };
  },
  component: DetailPage2,
  cacheKeys: ["product"],
});

const updateCartItemCount = () => {
  const $cart = $root.querySelector("#cart-icon-btn");
  const $count = $cart.querySelector(".bg-red-500");
  $count.textContent = CartUtil.getCartItems().length;
};

const handler = (e) => {
  if (e.detail.key === "shopping_cart") {
    updateCartItemCount();
    router.render({ withLoader: false });
  }
};

const main = async () => {
  LocalStorageUtil.init(handler);
  await router.render(location.pathname);
};

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(async () => {
    await main();
  });
} else {
  main();
}
