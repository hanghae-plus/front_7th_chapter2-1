import { getProduct, getProducts } from "./api/productApi.js";
import { DetailPage } from "./pages/DetailPage.js";
import { HomePage } from "./pages/HomePage.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

async function render() {
  const $root = document.querySelector("#root");

  if (location.pathname === "/") {
    $root.innerHTML = HomePage({ loading: true });
    const data = await getProducts();
    $root.innerHTML = HomePage({ ...data, loading: false });

    document.body.addEventListener("click", (e) => {
      if (e.target.closest(".product-card")) {
        const productId = e.target.closest(".product-card").dataset.productId;
        history.pushState(null, null, `/products/${productId}`);
        render();
      }
    });
  } else {
    $root.innerHTML = DetailPage({ loading: true });
    const data = await getProduct(location.pathname.replace("/products/", ""));
    console.log(data, "data");
    $root.innerHTML = DetailPage({ product: data, loading: false });
  }

  window.addEventListener("popstate", () => {
    render();
  });
}

async function main() {
  render();
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
