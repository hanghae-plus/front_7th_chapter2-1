import { ROUTES } from "./route";
import appStore from "./store/app-store";
import Router from "./core/router";

/** @type {string} */
const basePath = import.meta.env.BASE_URL;

/** @type {HTMLElement | null} */
const $root = document.querySelector("#root");
const $cartModalRoot = document.querySelector("#cart-modal-root");

/* Utils */
const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      serviceWorker: {
        url: `${basePath}mockServiceWorker.js`,
      },
      onUnhandledRequest: "bypass",
    }),
  );

async function main() {
  if (!$root) throw new Error("Root element not found");
  if (!$cartModalRoot) throw new Error("Cart modal root element not found");

  Router.init(ROUTES, basePath, $root);

  const pathName = window.location.pathname;
  const relativePath = pathName.replace(basePath, "/").replace(/\/$/, "") || "/";

  const homeRoute = ROUTES.home;
  const productDetailRoute = ROUTES.productDetail;

  const appState = appStore.getState();

  /* Initial Render */
  if (relativePath === homeRoute.path) {
    $root.replaceChildren(homeRoute.render({}));
  } else if (productDetailRoute.pattern.test(relativePath)) {
    const id = relativePath.split("/")[2];
    console.log("[Initial Render] Product Detail", id);
    $root.replaceChildren(productDetailRoute.render({ id, cart: appState.cart }));
  } else {
    console.log("[Initial Render] Not Found", relativePath);
    history.pushState(null, "", `${basePath}404`);
    $root.replaceChildren(ROUTES.notFound.render({}));
  }
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(() => main());
} else {
  main();
}
