import { store } from "../store.js";
import { getProducts } from "./api/productApi.js";
import { Main } from "./pages/Main.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
    }),
  );

const main = async () => {
  const $root = document.getElementById("root");
  if (!store.state.isLoaded) {
    const products = await getProducts();
    store.setState({ products, isLoaded: true });
  }

  store.subscribe((state) => {
    $root.innerHTML = Main({ isLoaded: state.isLoaded, products: state.products });
  });
};

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
