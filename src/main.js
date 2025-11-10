import { getProducts } from "./api/productApi.js";
import { Home } from "./pages/home.js";

const state = {
  products: [],
  isLoadingProducts: true,
  productsError: null,
  limit: 20,
};

const enableMocking = async () => {
  const { worker } = await import("./mocks/browser.js");

  return worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
  });
};

function render() {
  const root = document.getElementById("root");

  root.innerHTML = Home({
    searchProps: {
      loading: state.isLoadingProducts,
      limit: state.limit,
    },
    productProps: {
      loading: state.isLoadingProducts,
      products: state.products,
      error: state.productsError,
    },
  });

  const limitSelect = root.querySelector("#limit-select");
  if (limitSelect) {
    limitSelect.value = String(state.limit);
    limitSelect.addEventListener("change", handleLimitChange, { once: true });
  }
}

async function loadProducts() {
  state.isLoadingProducts = true;
  state.productsError = null;
  render();

  try {
    const data = await getProducts({ limit: state.limit });
    state.products = data?.products ?? [];
  } catch (error) {
    console.error("상품 목록을 불러오지 못했습니다.", error);
    state.productsError = "상품 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
  } finally {
    state.isLoadingProducts = false;
    render();
  }
}

function handleLimitChange(event) {
  const nextLimit = Number(event.target.value);
  if (Number.isNaN(nextLimit) || state.limit === nextLimit) {
    render();
    return;
  }

  state.limit = nextLimit;
  loadProducts();
}

async function main() {
  render();
  await loadProducts();
}

enableMocking().then(main);
