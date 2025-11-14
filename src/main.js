import App from "./App.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
      onUnhandledRequest: "bypass",
    }),
  );

// 랜더링 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(() => {
    App();
  });
} else {
  App();
}
