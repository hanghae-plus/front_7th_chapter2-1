import "./styles.css";

import { getCategories, getProducts } from "./api/productApi.js";
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
let categories = {};
async function render() {
  const $root = document.querySelector("#root");
  const params = getQueryParams();
  try {
    categories = await getCategories();
  } catch (error) {
    console.error("카테고리 로드 실패", error);
  }
  const category2List =
    params.category1 && categories[params.category1] ? Object.keys(categories[params.category1]) : [];

  $root.innerHTML = HomePage({
    loading: true,
    error: null,
    products: [],
    categories,
    selectedCategory1: params.category1,
    category2List,
  }); // loading
  try {
    const data = await getProducts(params);
    $root.innerHTML = HomePage({
      loading: false,
      error: null,
      products: data.products,
      categories,
      selectedCategory1: params.category1,
      category2List,
    }); // 성공

    setupEventListeners();
  } catch (error) {
    $root.innerHTML = HomePage({
      loading: false,
      error: error,
      products: [],
      categories,
      selectedCategory1: params.category1,
      category2List,
    }); // 실패
    setupRetryButton();
  }
}

function setupEventListeners() {
  const urlParams = new URLSearchParams(window.location.search);

  // 데이터 갯수 필터
  const limitSelect = document.querySelector("#limit-select");
  if (limitSelect) {
    limitSelect.value = urlParams.get("limit") || "20"; // 새로고침해도 필터 유지
    limitSelect.addEventListener("change", (e) => {
      // change 이벤트 발생시 URL 반영
      updateQueryParams({ limit: e.target.value });
      // 리렌더
      render();
    });
  }
  // 정렬
  const sortSelect = document.querySelector("#sort-select");
  if (sortSelect) {
    sortSelect.value = urlParams.get("sort") || "price_asc"; // 새로고침해도 정렬 유지 (URL은 그대로니까)
    sortSelect.addEventListener("change", (e) => {
      // change 이벤트 발생시 URL 반영
      updateQueryParams({ sort: e.target.value });
      // 리렌더
      render();
    });
  }
  // 검색어
  const searchInput = document.querySelector("#search-input");
  if (searchInput) {
    searchInput.value = urlParams.get("search") || ""; // 새로고침해도 검색어 유지 (URL은 그대로니까)
    // enter 이벤트 등록 -> query 업데이트
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        updateQueryParams({ search: e.target.value });
        console.log(e.target.value);
        // 리렌더
        render();
      }
    });
  }
  const category1Btn = document.querySelectorAll(".category1-filter-btn");
  category1Btn.forEach((btn) => {
    const cat1 = btn.dataset.category1;

    // category fetch
    btn.addEventListener("click", () => {
      updateQueryParams({ category1: cat1 });
      // 리렌더
      render();
    });
  });
  const category2Btn = document.querySelectorAll(".category2-filter-btn");
  category2Btn.forEach((btn) => {
    const cat2 = btn.dataset.category2;

    // 스타일 추가
    if (urlParams.get("category2") === cat2) {
      btn.classList.remove("bg-white", "border-gray-300", "text-gray-700");
      btn.classList.add("bg-blue-100", "border-blue-300", "text-blue-800");
    }

    btn.addEventListener("click", () => {
      updateQueryParams({ category2: cat2 });
      // 리렌더
      render();
    });
  });
}
// 재시도 버튼 제공
function setupRetryButton() {
  const retryBtn = document.querySelector("#retry-btn");
  retryBtn.addEventListener("click", () => {
    render();
  });
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
