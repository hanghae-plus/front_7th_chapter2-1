import { HomePage } from "./pages/HomePage.js";
import { getProducts, getProduct } from "./api/productApi.js";
import { DetailPage } from "./pages/Detailpage.js";

const enableMocking = () =>
  import("@/mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
    }),
  );

async function render() {
  const $root = document.getElementById("root");

  if (location.pathname === "/") {
    $root.innerHTML = HomePage({ loading: true });
    const data = await getProducts();
    $root.innerHTML = HomePage({ ...data, loading: false });

    document.addEventListener("click", (event) => {
      if (event.target.closest(".product-card")) {
        const productId = event.target.closest(".product-card").dataset.productId;
        history.pushState({}, "", `/product/${productId}`);
        render();
      }
    });
  } else {
    $root.innerHTML = DetailPage({ loading: true });
    const productId = location.pathname.split("/").pop();
    const data = await getProduct(productId);
    $root.innerHTML = DetailPage({ product: data, loading: false });
  }
}

window.addEventListener("popstate", () => {
  render();
});

function main() {
  render();
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
