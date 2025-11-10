import { BASE_URL } from "../config.js";
import { initailizeRouter } from "./router.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: {
        url: `${BASE_URL}mockServiceWorker.js`,
        options: { scope: BASE_URL },
      },
    }),
  );

function main() {
  initailizeRouter();
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
