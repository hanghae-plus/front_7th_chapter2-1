import { getCategories, getProduct, getProducts } from "./api/productApi.js";
import { DetailPage } from "./pages/DetailPage.js";
import { HomePage } from "./pages/HomePage.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

const render = async () => {
  const $root = document.getElementById("root");

  if (window.location.pathname === "/") {
    $root.innerHTML = HomePage({ isLoading: true });
    const data = await getProducts();
    const categories = await getCategories();
    $root.innerHTML = HomePage({ ...data, categories, isLoading: false });

    document.addEventListener("click", (event) => {
      if (event.target.closest(".product-card")) {
        const productId = event.target.closest(".product-card").dataset.productId;
        history.pushState(null, null, `/product/${productId}`);
        render();
      }
    });
  } else {
    const productId = window.location.pathname.split("/").pop();
    $root.innerHTML = DetailPage({ isLoading: true });
    const data = await getProduct(productId);
    $root.innerHTML = DetailPage({ ...data, isLoading: false });
  }
  window.addEventListener("popstate", render);
};

async function main() {
  render();
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
