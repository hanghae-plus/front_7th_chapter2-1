import App from "./App";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
      onUnhandledRequest: "bypass",
    }),
  );

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(App);
} else {
  App();
}
