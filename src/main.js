import { HomePage } from "./pages/HomePage.js";
import { getCategories, getProducts } from "./api/productApi.js";
import { App } from "./App.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      serviceWorker: {
        url: "/front_7th_chapter2-1/mockServiceWorker.js",
      },
      onUnhandledRequest: "bypass",
    }),
  );

function itemLimitSelectEventListener() {
  const itemLimitSelector = document.querySelector("#limit-select");

  itemLimitSelector.addEventListener("change", async (event) => {
    const selectedLimit = event.target.value;

    const $root = document.querySelector("#root");
    const data = await getProducts({ limit: selectedLimit });
    const categories = await getCategories();

    $root.innerHTML = HomePage({ ...data, categories, loading: false, limit: selectedLimit });
    itemLimitSelectEventListener();
  });
}

function searchEventListener() {
  const searchInput = document.querySelector("#search-input");

  searchInput.addEventListener("keydown", async (event) => {
    if (event.key !== "Enter") return;

    const searchValue = event.target.value;
    const $root = document.querySelector("#root");
    const data = await getProducts({ search: searchValue });
    const categories = await getCategories();

    $root.innerHTML = HomePage({ ...data, categories, loading: false, search: searchValue });
    searchEventListener();
  });
}

async function main() {
  App();

  itemLimitSelectEventListener();
  searchEventListener();
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
