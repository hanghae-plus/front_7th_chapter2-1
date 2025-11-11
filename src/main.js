import { HomePage } from "./pages/HomePage.js";
import { getProducts, getProduct, getCategories } from "./api/productApi.js";
import { DetailPage } from "./pages/Detailpage.js";
import { bindSearchFormEvents } from "./components/SearchForm.js";

const basePath = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");

const enableMocking = () =>
  import("@/mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
    }),
  );

function getNormalizedPathname() {
  const path = location.pathname;

  if (basePath && path.startsWith(basePath)) {
    const normalized = path.slice(basePath.length);
    if (!normalized) {
      return "/";
    }
    return normalized.startsWith("/") ? normalized : `/${normalized}`;
  }

  return path || "/";
}

let currentLimit = 20;
let currentSort = "price_asc";
let currentSearch = "";
let currentCategory1 = "";
let currentCategory2 = "";
let categoriesCache = null;
let categoriesInFlight = null;

async function loadCategories() {
  if (categoriesCache) {
    return categoriesCache;
  }

  if (!categoriesInFlight) {
    categoriesInFlight = getCategories()
      .then((data) => {
        categoriesCache = data ?? {};
        return categoriesCache;
      })
      .finally(() => {
        categoriesInFlight = null;
      });
  }

  return categoriesInFlight;
}

function bindFilters() {
  bindSearchFormEvents({
    currentLimit,
    currentSort,
    currentSearch,
    onLimitChange: (nextLimit) => {
      if (currentLimit === nextLimit) {
        return;
      }
      currentLimit = nextLimit;
      render();
    },
    onSortChange: (nextSort) => {
      if (currentSort === nextSort) {
        return;
      }
      currentSort = nextSort;
      render();
    },
    onSearchSubmit: (nextSearch) => {
      if (currentSearch === nextSearch) {
        return;
      }
      currentSearch = nextSearch;
      render();
    },
    onCategoryReset: () => {
      if (!currentCategory1 && !currentCategory2) {
        return;
      }
      currentCategory1 = "";
      currentCategory2 = "";
      render();
    },
    onCategory1Change: (nextCategory1) => {
      if (currentCategory1 === nextCategory1 && !currentCategory2) {
        return;
      }
      currentCategory1 = nextCategory1;
      currentCategory2 = "";
      render();
    },
    onCategory2Change: (nextCategory1, nextCategory2) => {
      if (currentCategory1 === nextCategory1 && currentCategory2 === nextCategory2) {
        return;
      }
      currentCategory1 = nextCategory1;
      currentCategory2 = nextCategory2;
      render();
    },
  });
}

async function render() {
  const $root = document.getElementById("root");
  const pathname = getNormalizedPathname();

  if (pathname === "/" || pathname === "") {
    $root.innerHTML = HomePage({
      loading: true,
      filters: {
        limit: currentLimit,
        sort: currentSort,
        search: currentSearch,
        category1: currentCategory1,
        category2: currentCategory2,
      },
    });

    const categoriesPromise = loadCategories().catch((error) => {
      console.error("카테고리 로딩 실패:", error);
      return {};
    });

    try {
      const data = await getProducts({
        limit: currentLimit,
        sort: currentSort,
        search: currentSearch,
        category1: currentCategory1,
        category2: currentCategory2,
      });
      const categories = await categoriesPromise;
      const filters = {
        ...(data?.filters ?? {}),
        limit: currentLimit,
        sort: currentSort,
        search: currentSearch,
        category1: currentCategory1,
        category2: currentCategory2,
      };

      $root.innerHTML = HomePage({ ...data, filters, categories, loading: false });
      bindFilters();
    } catch (error) {
      console.error("상품 목록 로딩 실패:", error);
      const categories = await categoriesPromise;
      $root.innerHTML = HomePage({
        loading: false,
        products: [],
        filters: {
          limit: currentLimit,
          sort: currentSort,
          search: currentSearch,
          category1: currentCategory1,
          category2: currentCategory2,
        },
        pagination: {},
        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        categories,
      });
      bindFilters();
    }
  } else if (pathname.startsWith("/product/")) {
    $root.innerHTML = DetailPage({ loading: true });
    const productId = pathname.split("/").pop();
    const data = await getProduct(productId);
    $root.innerHTML = DetailPage({ product: data, loading: false });
  } else {
    // fallback: 홈으로 이동
    history.replaceState({}, "", `${basePath}/`);
    render();
    return;
  }
}

document.addEventListener("click", (event) => {
  const productCard = event.target.closest(".product-card");

  if (!productCard) {
    return;
  }

  const productId = productCard.dataset.productId;

  if (!productId) {
    return;
  }

  const nextUrl = `${basePath}/product/${productId}`;
  history.pushState({}, "", nextUrl);
  render();
});

window.addEventListener("popstate", () => {
  render();
});

function main() {
  render();
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
