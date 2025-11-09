import "./styles.css";

import { getProducts } from "./api/productApi.js";
import HomePage from "./pages/HomePage.js";
import { getQueryParams, updateQueryParams } from "./utils/queryParams.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
    }),
  );

async function render() {
  const $root = document.querySelector("#root");
  const params = getQueryParams();

  $root.innerHTML = HomePage({ loading: true, error: null, products: [] }); // loading
  try {
    const data = await getProducts(params);
    $root.innerHTML = HomePage({ loading: false, error: null, products: data.products }); // 성공

    setupEventListeners();
  } catch (error) {
    $root.innerHTML = HomePage({ loading: false, error: error, products: [] }); // 실패
  }
  setupRetryButton();
}
// 재시도 버튼 제공
function setupRetryButton() {
  const retryBtn = document.querySelector("#retry-btn");
  retryBtn.addEventListener("click", () => {
    render();
  });
}

function setupEventListeners() {
  const urlParams = new URLSearchParams(window.location.search);

  // 데이터 갯수 필터
  const limitSelect = document.querySelector("#limit-select");
  if (limitSelect) {
    limitSelect.value = urlParams.get("limit") || "20"; // url에서 쿼리파라미터로 뽑아옴 (기본값: 20)
    limitSelect.addEventListener("change", (e) => {
      updateQueryParams({ limit: e.target.value });
      render();
    });
  }
}

function main() {
  render();
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
