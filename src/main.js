import { getCategories, getProduct, getProducts } from "./api/productApi.js";
import { DetailPage } from "./pages/DetailPage.js";
import { HomePage } from "./pages/HomePage.js";
import { filters } from "./store/filters.js";

let categories = [];

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

const init = async () => {
  const $root = document.getElementById("root");
  $root.innerHTML = HomePage({ isLoading: true });
  const data = await getProducts();

  // 카테고리 담기
  const newCategories = await getCategories();
  categories = newCategories;

  $root.innerHTML = HomePage({ ...data, categories, isLoading: false });

  filters.subscribe(render);
  eventHandlers();
};

const render = async () => {
  const $root = document.getElementById("root");

  if (window.location.pathname === "/") {
    const data = await getProducts(filters.getState());
    $root.innerHTML = HomePage({ ...data, categories, isLoading: false });

    // 상품 카드 클릭 이벤트 핸들러 -> 상세 페이지로 이동
    document.addEventListener("click", (event) => {
      if (event.target.closest(".product-card")) {
        const productId = event.target.closest(".product-card").dataset.productId;
        history.pushState("", "", `/product/${productId}`);
        render();
      }
    });
  } else {
    const productId = window.location.pathname.split("/").pop();
    $root.innerHTML = DetailPage({ isLoading: true });
    const data = await getProduct(productId);
    $root.innerHTML = DetailPage({ ...data, isLoading: false });
  }

  window.addEventListener("popstate", render);
};

const eventHandlers = () => {
  document.addEventListener("click", (event) => {
    // breadcrumb 전체 버튼 클릭 시 필터 초기화
    if (event.target.closest("button[data-breadcrumb='reset']")) {
      filters.setState({ category1: "", category2: "" });
    }

    // breadcrumb 카테고리 1 버튼 클릭 시 필터 적용
    if (event.target.closest("button[data-breadcrumb='category1']")) {
      const category1 = event.target.closest("button[data-breadcrumb='category1']").dataset.category1;
      filters.setState({ category1, category2: "" });
    }

    // 카테고리 1 필터 버튼 클릭 이벤트 핸들러
    if (event.target.closest(".category1-filter-btn")) {
      const category1 = event.target.dataset.category1;

      filters.setState({ category1 });
    }
    // 카테고리 2 버튼 클릭 이벤트 핸들러
    if (event.target.closest(".category2-filter-btn")) {
      const category1 = event.target.closest(".category2-filter-btn").dataset.category1;
      const category2 = event.target.closest(".category2-filter-btn").dataset.category2;

      filters.setState({ category1, category2 });
    }
  });

  // input 검색 이벤트 핸들러
  document.addEventListener("keyup", async (event) => {
    const target = document.getElementById("search-input");
    if (target && event.key === "Enter") {
      const search = target.value;

      if (search.length > 0) {
        filters.setState({ search });
      } else {
        filters.setState({ search: "" });
      }
    }
  });

  document.addEventListener("change", () => {
    // 개수 선택 이벤트 핸들러
    const limitSelect = document.getElementById("limit-select");
    if (limitSelect) {
      const limit = limitSelect.value;
      filters.setState({ limit });
    }
    // 정렬 선택 이벤트 핸들러
    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) {
      const sort = sortSelect.value;
      filters.setState({ sort });
    }
  });
};

async function main() {
  init();
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
