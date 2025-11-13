# 🚀 React 컨셉 적용 개선 제안

## 1. 통합 상태 관리 (State Management)

### Before (현재):

```javascript
class App {
  constructor() {
    this.state = { products: [], isLoading: false };
    this.categoriesState = { data: [], isLoading: false };
    this.cartState = { selectedIds: new Set() };
    this.detailState = { product: null };
    this.lastParams = { limit: 20, sort: "price_asc" };
  }
}
```

### After (개선):

```javascript
class Store {
  constructor() {
    this.state = {
      // 카탈로그 상태
      catalog: {
        products: [],
        pagination: null,
        isLoading: false,
        isLoadingMore: false,
        loadMoreError: null,
      },
      // 카테고리 상태
      categories: {
        data: [],
        isLoading: false,
        error: null,
      },
      // 필터/검색 파라미터
      filters: {
        limit: DEFAULT_LIMIT,
        sort: DEFAULT_SORT,
        page: 1,
        search: "",
        category1: "",
        category2: "",
      },
      // 장바구니 상태
      cart: {
        items: [],
        selectedIds: new Set(),
        isOpen: false,
      },
      // 상품 상세 상태
      productDetail: {
        product: null,
        relatedProducts: [],
        isLoading: false,
        error: null,
        quantity: 1,
      },
    };
    this.listeners = new Set();
  }

  // React의 setState와 유사
  setState(updater) {
    const newState = typeof updater === "function" ? updater(this.state) : { ...this.state, ...updater };

    this.state = newState;
    this.notify();
  }

  // 특정 상태 슬라이스만 업데이트
  updateSlice(slice, updater) {
    this.setState({
      [slice]: typeof updater === "function" ? updater(this.state[slice]) : { ...this.state[slice], ...updater },
    });
  }

  // 구독/알림 (Observer 패턴)
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  // Selector (특정 상태만 가져오기)
  getState(selector) {
    return selector ? selector(this.state) : this.state;
  }
}
```

## 2. 액션 기반 상태 변경 (Actions)

### Before:

```javascript
this.app.state = { ...this.app.state, isLoading: true };
```

### After:

```javascript
// actions/catalogActions.js
export const catalogActions = {
  setLoading: (store, isLoading) => {
    store.updateSlice("catalog", { isLoading });
  },

  setProducts: (store, products, pagination) => {
    store.updateSlice("catalog", {
      products,
      pagination,
      isLoading: false,
      loadMoreError: null,
    });
  },

  loadMoreStart: (store) => {
    store.updateSlice("catalog", { isLoadingMore: true });
  },

  loadMoreSuccess: (store, products, pagination) => {
    store.updateSlice("catalog", (state) => ({
      products: [...state.products, ...products],
      pagination,
      isLoadingMore: false,
    }));
  },

  loadMoreError: (store, error) => {
    store.updateSlice("catalog", {
      isLoadingMore: false,
      loadMoreError: error,
    });
  },
};

// 사용
catalogActions.setLoading(store, true);
```

## 3. 커스텀 훅 스타일의 로직 분리 (Hooks Pattern)

### Before:

```javascript
class CatalogPage {
  async loadProducts() {
    this.app.state = { ...this.app.state, isLoading: true };
    const data = await getProducts();
    this.app.state = { products: data.products };
    this.updateView();
  }
}
```

### After:

```javascript
// hooks/useCatalog.js
export const createCatalogHook = (store) => ({
  loadProducts: async (params) => {
    catalogActions.setLoading(store, true);
    try {
      const data = await getProducts(params);
      catalogActions.setProducts(store, data.products, data.pagination);
    } catch (error) {
      catalogActions.setError(store, error.message);
    }
  },

  loadMore: async () => {
    const { catalog, filters } = store.state;
    if (catalog.isLoadingMore || !catalog.pagination?.hasNext) return;

    catalogActions.loadMoreStart(store);
    try {
      const data = await getProducts({
        ...filters,
        page: catalog.pagination.page + 1,
      });
      catalogActions.loadMoreSuccess(store, data.products, data.pagination);
    } catch (error) {
      catalogActions.loadMoreError(store, error.message);
    }
  },

  search: (searchTerm) => {
    store.updateSlice("filters", { search: searchTerm, page: 1 });
    return this.loadProducts(store.state.filters);
  },
});
```

## 4. 선언적 렌더링 (Declarative Rendering)

### Before:

```javascript
updateView() {
  this.app.render(renderProductsContent({
    products: this.app.state.products,
    // ... 많은 props
  }));
  this.attachMainHandlers();
  this.setupInfiniteScroll();
}
```

### After:

```javascript
// pages/CatalogPage.js
export class CatalogPage {
  constructor(app, store) {
    this.app = app;
    this.store = store;
    this.catalog = createCatalogHook(store);

    // 상태 변경 시 자동 렌더링
    this.unsubscribe = store.subscribe((state) => {
      this.render(state);
    });
  }

  render(state) {
    const { catalog, categories, filters } = state;

    const content = renderProductsContent({
      products: catalog.products,
      pagination: catalog.pagination,
      isLoadingMore: catalog.isLoadingMore,
      ...filters,
      categoryState: categories,
    });

    this.app.render(content);
    this.attachEventHandlers();
  }

  destroy() {
    this.unsubscribe();
  }
}
```

## 5. 이벤트 핸들러 개선 (Event Delegation)

### Before:

```javascript
attachMainHandlers() {
  const buttons = this.rootElement.querySelectorAll('.add-to-cart-btn');
  buttons.forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = button.dataset.productId;
      this.handleAddToCart(productId);
    });
  });
}
```

### After:

```javascript
// 이벤트 위임 사용
attachEventHandlers() {
  this.app.rootElement.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    const handlers = {
      'add-to-cart': () => this.handleAddToCart(target.dataset.productId),
      'load-more': () => this.catalog.loadMore(),
      'select-category': () => this.handleCategorySelect(target.dataset),
    };

    handlers[action]?.();
  });
}
```

## 6. 폴더 구조 개선

```
src/
├── core/
│   ├── App.js              # 앱 초기화
│   ├── Store.js            # ⭐ 중앙 상태 관리
│   └── router.js
│
├── store/
│   ├── actions/            # ⭐ 액션 정의
│   │   ├── catalogActions.js
│   │   ├── cartActions.js
│   │   └── productActions.js
│   ├── selectors/          # ⭐ 상태 선택자
│   │   └── catalogSelectors.js
│   └── initialState.js     # ⭐ 초기 상태
│
├── hooks/                  # ⭐ 재사용 로직
│   ├── useCatalog.js
│   ├── useCart.js
│   └── useProduct.js
│
├── pages/                  # 페이지 컨트롤러
│   ├── catalog/
│   └── product/
│
├── components/             # UI 컴포넌트
├── lib/                    # 유틸리티
└── main.js
```

## 7. 장점

✅ **단일 진실 공급원**: 모든 상태가 한 곳에
✅ **예측 가능**: 액션을 통한 명시적 상태 변경
✅ **디버깅 용이**: 상태 변경 추적 가능
✅ **테스트 용이**: 순수 함수로 로직 분리
✅ **확장성**: 새 기능 추가 시 구조 유지
✅ **React 전환 용이**: 비슷한 패턴으로 나중에 React로 쉽게 마이그레이션

## 구현 우선순위

1. **Phase 1**: Store 클래스 생성 (가장 중요)
2. **Phase 2**: Actions 분리
3. **Phase 3**: Hooks 패턴 적용
4. **Phase 4**: 이벤트 위임으로 개선
