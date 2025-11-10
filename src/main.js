import HomePage from "./pages/HomePage";
import { getProducts, getProduct } from "./api/productApi";
import ProductDetailPage from "./pages/ProductDetailPage";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

async function main() {
  const pathName = window.location.pathname;

  const $root = document.querySelector("#root");

  if (pathName === "/") {
    $root.innerHTML = `
      ${HomePage({ loading: true })}
    `;
    const response = await getProducts();
    console.log(response);
    $root.innerHTML = `
      ${HomePage({ loading: false, response })}
    `;
  } else if (pathName.startsWith("/product/")) {
    const id = pathName.split("/")[2];
    $root.innerHTML = `
      ${ProductDetailPage({ loading: true })}
    `;
    const response = await getProduct(id);
    console.log(response);
    $root.innerHTML = `
      ${ProductDetailPage({ loading: false, response })}
    `;
  }
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
