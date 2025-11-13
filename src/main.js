import "./styles.css";
import { initApp } from "./App.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
    }),
  );

if (import.meta.env.MODE !== "test") {
  enableMocking().then(initApp);
} else {
  initApp();
}
