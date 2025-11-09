import { getProducts } from "./api/productApi.js";
import { HomePage } from "./pages/HomePage.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

const main = async () => {
  const $root = document.querySelector("#root");

  $root.innerHTML = HomePage({ loading: true });
  const data = await getProducts();
  $root.innerHTML = HomePage({ ...data, loading: false });
};

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
