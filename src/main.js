import { getCategories, getProduct, getProducts } from "./api/productApi.js";
import { DetailPage } from "./pages/DetailPage.js";
import { HomePage } from "./pages/HomePage.js";
import { getQueryStringAdding, getQueryStringExcluding } from "./utils/queryString.js";
import { convertToRelativePath, Router } from "./utils/Router.js";

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
let categories;

router.addRoute("/", async () => {
  const params = new URLSearchParams(window.location.search);
  const search = params.get("search") ?? "";
  const category1 = params.get("category1") ?? "";

  $root.innerHTML = HomePage({ loading: true, categories, filters: { search, category1 } });
  const data = await getProducts({ search, category1 });
  if (!categories) {
    categories = await getCategories();
  }
  $root.innerHTML = HomePage({ ...data, filters: { search, category1 }, categories, loading: false });
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
  } else if (e.target.tagName === "A") {
    e.preventDefault();
    // if (location.pathname === e.target.pathname) {
    //   return;
    // }
    router.navigateTo(e.target.pathname);
  }
});

$root.addEventListener("click", (e) => {
  if (e.target.closest(".category1-filter-btn")) {
    const $category1Btn = e.target.closest(".category1-filter-btn");
    const category1 = $category1Btn.dataset.category1;
    const newQueryString = getQueryStringAdding("category1", category1);
    router.navigateTo(`${BASE_URL}${newQueryString}`);
  } else if (e.target.closest(".category2-filter-btn")) {
    const $category2Btn = e.target.closest(".category2-filter-btn");
    $category2Btn.classList.add("bg-blue-100", "border-blue-300", "text-blue-800");
    $category2Btn.classList.remove("bg-white", "border-gray-300", "text-gray-700", "hover:bg-gray-50");

    const $allCategory2Btns = $root.querySelectorAll(".category2-filter-btn");
    $allCategory2Btns.forEach(($c2Btn) => {
      if ($category2Btn.dataset.category2 !== $c2Btn.dataset.category2) {
        $c2Btn.classList.remove("bg-blue-100", "border-blue-300", "text-blue-800");
        $c2Btn.classList.add("bg-white", "border-gray-300", "text-gray-700", "hover:bg-gray-50");
      }
    });
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
