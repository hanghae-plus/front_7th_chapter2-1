import { App } from "./App.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) => {
    // base path 동적으로 설정 (프로덕션: /front_7th_chapter2-1/, 개발: /)
    const basePath = import.meta.env.BASE_URL || "/";
    const serviceWorkerUrl = `${basePath}mockServiceWorker.js`;

    return worker.start({
      serviceWorker: {
        url: serviceWorkerUrl,
      },
      onUnhandledRequest: "bypass",
    });
  });

async function main() {
  App();
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
