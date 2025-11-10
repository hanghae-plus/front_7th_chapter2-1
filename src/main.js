import { getProduct, getProducts } from "./api/productApi.js";
import { DetailPage } from "./pages/DetailPAge.js";
import { HomePage } from "./pages/Homepage.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

const push = (path) => {
  history.pushState(null, null, path);
  render();
};

async function render() {
  const $root = document.querySelector("#root");

  if (window.location.pathname === "/") {
    $root.innerHTML = HomePage({ loading: true });
    const data = await getProducts();
    console.log(data);

    $root.innerHTML = HomePage({ ...data, loading: false });

    document.body.addEventListener("click", (e) => {
      if (e.target.closest(".product-card")) {
        const productId = e.target.closest(".product-card").dataset.productId;
        console.log(e.target, productId);
        push(`/products/${productId}`);
      }
    });
  } else {
    const productId = location.pathname.split("/").pop();
    $root.innerHTML = DetailPage({ loading: true });
    const data = await getProduct(productId);
    $root.innerHTML = DetailPage({ loading: false, product: data });
  }
  window.addEventListener("popstate", () => {
    render();
  });
}

function main() {
  render();
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
