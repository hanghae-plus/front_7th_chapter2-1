import { getProduct, getProducts } from "./api/productApi.js";
import { DetailPage } from "./pages/DetailPage.js";
import { HomePage } from "./pages/HomePage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

const render = async () => {
  const $root = document.querySelector("#root");
  if (location.pathname === "/") {
    $root.innerHTML = HomePage({ loading: true });
    const data = await getProducts();
    $root.innerHTML = HomePage({ ...data, loading: false });
  } else if (location.pathname.startsWith("/product/")) {
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
  } else {
    $root.innerHTML = NotFoundPage();
  }
};

const main = async () => {
  render();
};

document.body.addEventListener("click", (e) => {
  const productCard = e.target.closest(".product-card") ?? e.target.closest(".related-product-card");
  if (productCard) {
    const productId = productCard.dataset.productId;
    history.pushState(null, null, `/product/${productId}`);
    render();
  }
});

window.addEventListener("popstate", () => {
  render();
});

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
