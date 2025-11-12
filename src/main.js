import { getCategories, getProduct, getProducts } from "./api/productApi.js";
import { DetailPage2 } from "./pages/DetailPage2.js";
import { HomePage2 } from "./pages/HomePage2.js";
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

    const data = await getProducts({ search, category1, category2 });
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

const main = async () => {
  await router.render(location.pathname);
};

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(async () => {
    console.log("MSW 준비 완료, DOMContentLoaded 대기 중...");
    await main();
    // if (document.readyState === "loading") {
    //   document.addEventListener("DOMContentLoaded", main);
    // } else {
    //   await main();
    // }
  });
} else {
  await main();
}
