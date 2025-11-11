import { getCategories, getProduct, getProducts } from "./api/productApi.js";
import { DetailPage } from "./pages/DetailPage.js";
import { HomePage } from "./pages/HomePage.js";
import { convertToRelativePath, getQueryStringExcluding, Router } from "./utils/Router.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      serviceWorker: {
        url: `${BASE_URL}mockServiceWorker.js`,
      },
      onUnhandledRequest: "bypass",
    }),
  );

const router = new Router(document.querySelector("#root"));

const render = async () => {
  router.handleRoute(location.pathname);
};

const main = async () => {
  render();
};

const BASE_URL = import.meta.env.BASE_URL;
const $root = document.querySelector("#root");

router.addRoute("/", async () => {
  const params = new URLSearchParams(window.location.search);
  const search = params.get("search") ?? "";

  $root.innerHTML = HomePage({ search, loading: true });
  const data = await getProducts({ search });
  const categories = await getCategories();
  $root.innerHTML = HomePage({ ...data, search, categories, loading: false });
});

router.addRoute("/product/:productId", async () => {
  $root.innerHTML = DetailPage({ loading: true });
  const productId = convertToRelativePath(location.pathname).split("/")[2];
  const product = await getProduct(productId);
  $root.innerHTML = DetailPage({ loading: false, product: product.error ? undefined : product, relatedProducts: [] });
  if (!product.error) {
    const relatedProducts = (await getProducts({ page: 1, category2: product.category2 })).products.filter(
      (product) => product.productId !== productId,
    );
    $root.innerHTML = DetailPage({ loading: false, product: product, relatedProducts });
  }
});

$root.addEventListener("click", (e) => {
  const productCard = e.target.closest(".product-card") ?? e.target.closest(".related-product-card");
  if (productCard) {
    const productId = productCard.dataset.productId;
    router.navigateTo(`${BASE_URL}product/${productId}`);
  }
  if (e.target.tagName === "A") {
    e.preventDefault();
    // if (location.pathname === e.target.pathname) {
    //   return;
    // }
    router.navigateTo(e.target.pathname);
  }
});

$root.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const $input = e.target.closest("#search-input");
    if ($input.value) {
      router.navigateTo(`?search=${$input.value}`);
    } else {
      const newQueryString = getQueryStringExcluding("search");
      router.navigateTo(`${BASE_URL}${newQueryString}`);
    }
  }
});

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
