import { CartModal } from "./components/cart/CartModal.js";
import { Router } from "./core/router/router.js";
import "./globals/html-global.js";
import { routes } from "./routes/routes.js";
import { modalStore } from "./stores/modal-store.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

function main() {
  const $root = document.querySelector("#root");
  const $app = document.createElement("div");
  $app.id = "app";
  $root.appendChild($app);
  new Router($app, routes);

  modalStore.init();
  modalStore.register("cart", CartModal);
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
