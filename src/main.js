import { getProducts } from "./api/productApi.js";
import { Home } from "./pages/home.js";

// 사용자에게 보여줄 에러 문구를 한곳에서 관리한다.
const INITIAL_LOAD_ERROR_MESSAGE = "상품 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
const LOAD_MORE_ERROR_MESSAGE = "상품을 추가로 불러오지 못했습니다. 다시 시도해 주세요.";

// 상태보관
// 화면 렌더링과 상호작용 사이에 공유해야 하는 값을 모두 여기에 저장한다.
const state = {
  // 현재 렌더링 중인 상품 목록
  products: [],
  // 초기 진입 혹은 조건 변경으로 인해 전체 목록을 로딩 중인지 여부
  isLoadingProducts: true,
  // 무한 스크롤로 추가 데이터를 가져오는 중인지 여부
  isLoadingMore: false,
  // 초기 로딩 실패 시 노출할 에러 메시지
  productsError: null,
  // 추가 로딩 실패 시 노출할 에러 메시지
  loadMoreError: null,
  // 한 번에 요청할 상품 수
  limit: 20,
  // 현재 로딩된 페이지
  currentPage: 0,
  // 다음 페이지가 더 있는지 여부
  hasMoreProducts: true,
  // 정렬 기준
  sort: "price_asc",
  // 전체 상품 개수 (서버 응답 기반)
  totalProducts: 0,
};

let loadMoreObserver = null;

// ?? 모킹 활성화
const enableMocking = async () => {
  const { worker } = await import("./mocks/browser.js");

  return worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
  });
};

// 현재 state를 기반으로 화면을 그리는 함수.
// Search와 ItemList에 필요한 상태를 내려주고, 이벤트 리스너를 연결한다.
// 이벤트들은 render안에서 실행해줘야한다. 재렌더링이 될 때가 있기 때문에.
function render() {
  const root = document.getElementById("root"); //html 뿌려주기

  // 상태를 기반으로 최상위 화면을 다시 그린다.
  root.innerHTML = Home({
    // 검색에 들어갈 props
    searchProps: {
      loading: state.isLoadingProducts,
      limit: state.limit,
      sort: state.sort,
    },
    //item에 들어갈 props
    productProps: {
      loading: state.isLoadingProducts,
      loadingMore: state.isLoadingMore,
      products: state.products,
      error: state.productsError,
      hasMore: state.hasMoreProducts,
      loadMoreError: state.loadMoreError,
      totalCount: state.totalProducts,
    },
  });

  // 페이지당 개수 선택
  const limitSelect = root.querySelector("#limit-select");
  if (limitSelect) {
    limitSelect.value = String(state.limit);
    limitSelect.addEventListener("change", selectLimit, { once: true });
  }

  // 정렬 기준 변경
  const sortSelect = root.querySelector("#sort-select");
  if (sortSelect) {
    sortSelect.value = state.sort;
    sortSelect.addEventListener("change", selectSort, { once: true });
  }

  // 로딩 실패 시 보여주는 재시도 버튼
  const retryButton = root.querySelector("#products-retry-button");
  if (retryButton) {
    retryButton.addEventListener(
      "click",
      () => {
        loadProducts();
      },
      { once: true },
    );
  }

  const loadMoreRetryButton = root.querySelector("#products-load-more-retry-button");
  if (loadMoreRetryButton) {
    loadMoreRetryButton.addEventListener(
      "click",
      () => {
        loadProducts({ append: true });
      },
      { once: true },
    );
  }

  // 재렌더링 때마다 옵저버를 다시 세팅해 무한 스크롤 트리거를 감지한다.
  setupLoadMoreObserver(root);
}
// 무한스크롤 감지
function setupLoadMoreObserver(rootElement) {
  if (loadMoreObserver) {
    loadMoreObserver.disconnect();
    loadMoreObserver = null;
  }

  if (state.loadMoreError) {
    return;
  }

  const sentinel = rootElement.querySelector("#products-load-more-trigger");
  if (!sentinel) {
    return;
  }

  loadMoreObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadProducts({ append: true });
        }
      });
    },
    {
      root: null,
      rootMargin: "0px 0px 200px 0px",
      threshold: 0,
    },
  );

  loadMoreObserver.observe(sentinel);
}

async function loadProducts({ append = false } = {}) {
  // append 여부에 따라 초기 로딩과 추가 로딩의 준비 절차를 분리한다.
  const context = append ? startAppendLoad() : startInitialLoad();
  if (!context) {
    return;
  }

  const { nextPage } = context;

  try {
    const data = await fetchProductPage(nextPage);
    applyProductResponse(data, { append, requestedPage: nextPage });
  } catch (error) {
    console.error("상품 목록을 불러오지 못했습니다.", error);
    handleLoadError(append);
  } finally {
    finishLoad(append);
  }
}

// 상품갯수 셀렉트
function selectLimit(event) {
  const nextLimit = Number(event.target.value);
  if (Number.isNaN(nextLimit) || state.limit === nextLimit) {
    render();
    return;
  }

  state.limit = nextLimit;
  loadProducts();
}
// 정렬 셀렉트
function selectSort(event) {
  const nextSort = event.target.value;
  // 동일한 값을 다시 선택한 경우 불필요한 네트워크 요청을 막는다.
  if (!nextSort || state.sort === nextSort) {
    render();
    return;
  }

  state.sort = nextSort;
  loadProducts();
}
//초기 상태 리셋
function startInitialLoad() {
  state.isLoadingProducts = true;
  state.productsError = null;
  state.loadMoreError = null;
  state.currentPage = 0;
  state.hasMoreProducts = true;
  state.totalProducts = 0;
  render();

  return { nextPage: 1 };
}

function startAppendLoad() {
  // 기존 로딩이 진행 중이거나 더 불러올 데이터가 없다면 추가 로딩을 막는다.
  if (state.isLoadingProducts || state.isLoadingMore || !state.hasMoreProducts) {
    return null;
  }

  // 추가 로딩 전용 상태를 세팅한다.
  state.isLoadingMore = true;
  state.loadMoreError = null;
  render();

  return { nextPage: state.currentPage + 1 };
}

async function fetchProductPage(page) {
  // 현재 상태값과 함께 API 호출을 수행한다.
  return await getProducts({ limit: state.limit, page, sort: state.sort });
}

function applyProductResponse(data, { append, requestedPage }) {
  // 응답값이 없을 경우에도 안전하게 처리하기 위해 널 병합을 사용한다.
  const incomingProducts = data?.products ?? [];
  const resolvedPage = data?.pagination?.page ?? requestedPage;
  const hasNext = data?.pagination?.hasNext ?? incomingProducts.length >= state.limit;
  const totalCount = data?.pagination?.total;

  // 기존 상품에 이어붙일지 여부를 append 플래그로 판단한다.
  state.products = append ? [...state.products, ...incomingProducts] : incomingProducts;
  state.currentPage = resolvedPage;
  state.hasMoreProducts = hasNext;
  if (typeof totalCount === "number") {
    state.totalProducts = totalCount;
  } else if (!append) {
    state.totalProducts = state.products.length;
  }
}

function handleLoadError(append) {
  // 추가 로딩과 초기 로딩은 서로 다른 안내 문구를 사용한다.
  if (append) {
    state.loadMoreError = LOAD_MORE_ERROR_MESSAGE;
    return;
  }

  state.productsError = INITIAL_LOAD_ERROR_MESSAGE;
}

function finishLoad(append) {
  // 로딩 플래그를 상황별로 내려주고, 변경 사항을 반영하기 위해 다시 렌더링한다.
  if (append) {
    state.isLoadingMore = false;
  } else {
    state.isLoadingProducts = false;
  }

  render();
}

async function main() {
  render();
  await loadProducts();
}

enableMocking().then(main);
