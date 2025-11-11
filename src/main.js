import { getProduct, getProducts } from "./api/productApi.js";
import { DetailPage } from "./pages/DetailPage.js";
import { HomePage } from "./pages/HomePage.js";
import { Router } from "./utils/Router.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
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

router.addRoute("/", async () => {
  const $root = document.querySelector("#root");
  $root.innerHTML = HomePage({ loading: true });
  const data = await getProducts();
  $root.innerHTML = HomePage({ ...data, loading: false });
});

router.addRoute("/product/:productId", async () => {
  const $root = document.querySelector("#root");
  $root.innerHTML = DetailPage({ loading: true });
  const productId = location.pathname.split("/")[2];
  const product = await getProduct(productId);
  $root.innerHTML = DetailPage({ loading: false, product: product.error ? undefined : product, relatedProducts: [] });
  if (!product.error) {
    const relatedProducts = (await getProducts({ page: 1, category2: product.category2 })).products.filter(
      (product) => product.productId !== productId,
    );
    $root.innerHTML = DetailPage({ loading: false, product: product, relatedProducts });
  }
});

document.body.addEventListener("click", (e) => {
  const productCard = e.target.closest(".product-card") ?? e.target.closest(".related-product-card");
  if (productCard) {
    const productId = productCard.dataset.productId;
    history.pushState(null, null, `/product/${productId}`);
    render();
  }
  if (e.target.tagName === "A") {
    e.preventDefault();
    if (location.pathname === e.target.pathname) {
      return;
    }
    router.navigateTo(e.target.pathname);
  }
});

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
