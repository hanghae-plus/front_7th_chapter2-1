# 상품 목록 로딩/무한 스크롤 동작 정리

본 문서는 `src/main.js`와 `src/components/ItemList.js`에 구현된 주요 UX 흐름(페이지당 갯수 선택, 오류 화면, 무한 스크롤)을 설명합니다. 개발자가 구조를 빠르게 이해하고 유지보수할 수 있도록 상태 관리와 이벤트 흐름을 중심으로 정리했습니다.

---

## 1. 전역 상태 구조

- 상태 객체(`state`)는 상품 목록 UI에 필요한 모든 정보를 보관합니다.
- 핵심 키는 다음과 같습니다.
  - `limit`: 한 번에 요청할 상품 개수 (기본 20).
  - `currentPage`: 현재 불러온 페이지 번호.
  - `hasMoreProducts`: 다음 페이지 존재 여부 플래그.
  - `isLoadingProducts`/`isLoadingMore`: 초기 로딩과 추가 로딩을 구분해서 표시.
  - `productsError`/`loadMoreError`: 초기 로딩 실패와 추가 로딩 실패 메시지를 분리 저장.
  - `sort`: 현재 적용된 정렬 기준.
  - `totalProducts`: 서버에서 내려준 전체 상품 개수.

```1:18:src/main.js
const INITIAL_LOAD_ERROR_MESSAGE = "상품 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
const LOAD_MORE_ERROR_MESSAGE = "상품을 추가로 불러오지 못했습니다. 다시 시도해 주세요.";

const state = {
  products: [],
  isLoadingProducts: true,
  isLoadingMore: false,
  productsError: null,
  loadMoreError: null,
  limit: 20,
  currentPage: 0,
  hasMoreProducts: true,
  sort: "price_asc",
  totalProducts: 0,
};
```

- `render()`는 위 상태를 `Home` → `Search`, `ItemList` 컴포넌트에 내려주고, UI 요소에 이벤트를 연결합니다.

---

## 2. 페이지당 개수 선택 동작

### 사용자 흐름

1. 사용자가 `Search` 컴포넌트의 `select#limit-select`에서 개수를 선택합니다.
2. `selectLimit()`이 호출되어 유효성을 검사한 뒤 `state.limit`를 갱신합니다.
3. 새로운 개수로 1페이지부터 다시 로딩(`loadProducts()` 기본 모드)합니다.

### 주요 코드

```52:92:src/main.js
const limitSelect = root.querySelector("#limit-select");
if (limitSelect) {
  limitSelect.value = String(state.limit);
  limitSelect.addEventListener("change", selectLimit, { once: true });
}
```

```64:168:src/main.js
const sortSelect = root.querySelector("#sort-select");
if (sortSelect) {
  sortSelect.value = state.sort;
  sortSelect.addEventListener("change", selectSort, { once: true });
}

function selectSort(event) {
  const nextSort = event.target.value;
  if (!nextSort || state.sort === nextSort) {
    render();
    return;
  }

  state.sort = nextSort;
  loadProducts();
}
```

```163:173:src/main.js
function selectLimit(event) {
  const nextLimit = Number(event.target.value);
  if (Number.isNaN(nextLimit) || state.limit === nextLimit) {
    render();
    return;
  }

  state.limit = nextLimit;
  loadProducts();
}
```

### 포인트

- 이벤트를 `once: true`로 등록해 렌더링마다 중복 등록을 방지합니다.
- 기존 로딩 상태를 초기화하고 첫 페이지부터 새로 요청하기 때문에 검색 조건 변경과 동일한 흐름으로 처리됩니다.
- 정렬 셀렉트 역시 동일한 패턴으로 동작하며, 선택한 값은 `state.sort`로 반영되어 API 파라미터로 전달됩니다.

---

## 3. 로딩 실패 시 오류 페이지

### 초기 로딩 실패

- `loadProducts()`는 공통 상태 전이를 `startInitialLoad`/`startAppendLoad`, `finishLoad` 등 헬퍼로 분리해 명확하게 관리합니다.
- 실패 시 `handleLoadError()`가 상황별 메시지를 설정하고, 성공 시 `applyProductResponse()`가 상품 목록과 페이지 정보를 갱신합니다.
- 이때 `pagination.total`을 `totalProducts`로 저장해 전체 개수를 유지합니다.
- `ItemList`는 `error` 프로퍼티가 존재하면 즉시 에러 배너 + `다시 시도` 버튼 UI를 렌더링합니다.

```129:205:src/main.js
async function loadProducts({ append = false } = {}) {
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

function handleLoadError(append) {
  if (append) {
    state.loadMoreError = LOAD_MORE_ERROR_MESSAGE;
    return;
  }

  state.productsError = INITIAL_LOAD_ERROR_MESSAGE;
}

function finishLoad(append) {
  if (append) {
    state.isLoadingMore = false;
  } else {
    state.isLoadingProducts = false;
  }

  render();
}
```

```89:139:src/components/ItemList.js
if (error) {
  return renderError(error);
}
```

```55:80:src/components/ItemList.js
const renderError = (message) => `
  <section class="mb-6">
    <div class="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      ${message}
    </div>
    <div class="text-center">
      <button
        id="products-retry-button"
        class="inline-flex items-center gap-2 rounded-md border border-blue-500 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition"
        type="button"
      >
        다시 시도
      </button>
    </div>
  </section>
`;
```

### 추가 로딩 실패

- 추가 페이지 로딩 도중 실패하면 `handleLoadError(true)`가 `loadMoreError`에 메시지를 저장합니다.
- `ItemList`는 리스트 하단에 경고 배너와 `다시 시도` 버튼을 출력합니다.
- 재시도 버튼은 `loadProducts({ append: true })`를 호출합니다.

```71:80:src/main.js
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
```

```122:138:src/components/ItemList.js
${loadMoreError
  ? `<div class="mb-4 flex flex-col items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 text-center">
      <span>${loadMoreError}</span>
      <button
        id="products-load-more-retry-button"
        class="inline-flex items-center gap-2 rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition"
        type="button"
      >
        다시 시도
      </button>
    </div>`
  : ""}
```

---

## 4. 무한 스크롤 구현

### 동작 개요

1. `ItemList`는 상품 리스트 하단에 `#products-load-more-trigger` 센티넬 요소를 추가합니다 (`hasMore`가 true일 때만).
2. `render()` 이후 `setupLoadMoreObserver()`가 센티넬을 감시합니다.
3. 센티넬이 뷰포트 근처에 들어오면 `loadProducts({ append: true })`가 실행되어 다음 페이지를 요청합니다.
4. 성공하면 기존 배열 뒤에 새 상품을 붙이고, `pagination.hasNext` 값으로 `hasMoreProducts`를 갱신해 계속 감시할지 결정합니다.

### 주요 코드

```82:116:src/main.js
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
```

```171:229:src/main.js
function startAppendLoad() {
  if (state.isLoadingProducts || state.isLoadingMore || !state.hasMoreProducts) {
    return null;
  }

  state.isLoadingMore = true;
  state.loadMoreError = null;
  render();

  return { nextPage: state.currentPage + 1 };
}

function applyProductResponse(data, { append, requestedPage }) {
  const incomingProducts = data?.products ?? [];
  const resolvedPage = data?.pagination?.page ?? requestedPage;
  const hasNext = data?.pagination?.hasNext ?? incomingProducts.length >= state.limit;
  const totalCount = data?.pagination?.total;

  state.products = append ? [...state.products, ...incomingProducts] : incomingProducts;
  state.currentPage = resolvedPage;
  state.hasMoreProducts = hasNext;
  if (typeof totalCount === "number") {
    state.totalProducts = totalCount;
  } else if (!append) {
    state.totalProducts = state.products.length;
  }
}
```

```114:138:src/components/ItemList.js
${loadingMore ? LoadingMore : ""}
${hasMore ? `<div id="products-load-more-trigger" class="h-2 w-full"></div>` : ""}
```

### 추가 고려사항

- `IntersectionObserver`는 렌더링마다 새로 등록하므로 기존 옵저버를 `disconnect()`해 중복 호출을 방지합니다.
- `rootMargin`을 `0px 0px 200px 0px`으로 지정해 센티넬이 완전히 보이기 전에 미리 로딩을 시작합니다.
- `state.hasMoreProducts`가 false일 때는 센티넬 자체가 렌더링되지 않아 추가 요청이 멈춥니다.
- 추가 로딩 중 에러가 발생하면 옵저버는 잠시 해제되고(센티넬 미등록), 재시도 버튼을 눌러 성공 시 다시 센티넬이 생성되어 관찰이 재개됩니다.

---

## 5. QA 및 테스트 팁

- **초기 로딩 실패 케이스**
  - 개발자 도구 `Request blocking`에서 `/api/products`를 차단한 후 새로고침하면 오류 배너와 재시도 버튼을 확인할 수 있습니다.
- **추가 로딩 실패 케이스**
  - 첫 페이지는 정상 응답, 이후 페이지는 500 응답을 반환하도록 MSW 핸들러를 임시 수정하거나, Request blocking에 페이지 파라미터를 포함해 조건부 차단합니다.
- **무한 스크롤 동작**
  - 브라우저 네트워크 탭에서 `Slow 3G` 등 느린 네트워크 모드를 사용하면 하단 로딩 인디케이터 출력 여부를 확인하기 쉽습니다.
- **페이지당 개수 변경**
  - `limit`을 바꾸고 즉시 추가 스크롤을 시도해 페이지 리셋이 제대로 동작하는지 확인합니다.

---

## 6. 요약

- 상태 분리(`isLoadingProducts` vs `isLoadingMore`, `productsError` vs `loadMoreError`)로 초기 로딩과 추가 로딩의 UX를 독립적으로 제어합니다.
- `render()` 함수는 렌더링 후 필요한 이벤트를 모두 다시 연결하여 SPA의 단일 진입점 역할을 합니다.
- 무한 스크롤은 `IntersectionObserver` + 센티넬 요소 조합으로 구현했으며, 에러 시에도 사용자에게 명확한 재시도 액션을 제공합니다.

이 문서를 참고하면 페이지당 개수 변경, 에러 처리, 무한 스크롤 관련 코드를 빠르게 이해하고 수정할 수 있습니다.
