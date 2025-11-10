import { HomePage } from "./pages/HomePage.js";
import { getCategories, getProducts } from "./api/productApi.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

async function main() {
  const $root = document.querySelector("#root");
  $root.innerHTML = HomePage({ loading: true, categories: {} });
  // 처음에 렌더링
  const data = await getProducts();
  const categories = await getCategories();

  // 렌더링 끝나고 다시 데이터 넘겨 줌
  $root.innerHTML = HomePage({ ...data, categories, loading: false });
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
