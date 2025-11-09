import "./styles.css";

import { getProducts } from "./api/productApi.js";
import HomePage from "./pages/HomePage.js";

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
    $root.innerHTML = HomePage({ loading: false, products: data.products });
  }
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
