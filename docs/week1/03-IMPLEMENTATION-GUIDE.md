# 구현 가이드

> **단계별로 차근차근 구현하기**

## 🎯 구현 순서 (우선순위 기반)

> **핵심 3요소**: Observer + Router + Store + Lifecycle 🔥
>
> 이 4가지만 제대로 구현하면 나머지는 일사천리!

```
🔥 Phase 1 (필수):
1. Observer (1h) → 2. Router (3h) → 3. Store (2h) → 4. Lifecycle (3h)

Phase 2 (선택):
5. 무한 스크롤 & 최적화 (3-5h)
```

---

## Step 1: Observer 패턴 (1시간) ⭐⭐⭐

### 왜 먼저?
Router와 Store의 기반이 되는 패턴입니다.

### 구현

**파일**: `src/core/observer.js`

```javascript
/**
 * Observer 패턴 구현
 * @returns {Object} { subscribe, unsubscribe, notify }
 */
export const createObserver = () => {
  const observers = new Set();

  const subscribe = (callback) => {
    if (typeof callback !== "function") {
      return;
    }
    observers.add(callback);
  };

  const unsubscribe = (callback) => {
    observers.delete(callback);
  };

  const notify = (data) => {
    observers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Observer callback error:', error);
      }
    });
  };

  return { subscribe, unsubscribe, notify };
};
```

### 테스트

```javascript
// 간단한 테스트
const observer = createObserver();

let count = 0;
observer.subscribe(() => count++);
observer.notify();
console.log(count); // 1

observer.notify();
console.log(count); // 2
```

✅ **완료 체크**: `createObserver`가 subscribe/notify 동작 확인

---

## Step 2: Router 시스템 (3시간) ⭐⭐⭐

### 2-1. Observer 기반 Router 구현 (2시간)

**파일**: `src/core/router.js`

```javascript
import { createObserver } from './observer.js';

const observer = createObserver();
let routes = {};
let currentRoute = { name: '', params: {}, query: {}, component: null };

/**
 * 라우트 설정 (선언형)
 * @param {Object} routeConfig - { "/": HomePage, "/product/:id": DetailPage }
 */
export const setup = (routeConfig) => {
  routes = routeConfig;
  updateCurrentRoute();
};

/**
 * 구독 - 라우트 변경 시 자동 실행
 * @param {Function} callback - 실행할 함수
 */
export const subscribe = (callback) => {
  observer.subscribe(callback);
};

/**
 * 네비게이션
 * @param {string} path - 이동할 경로
 */
export const push = (path) => {
  window.history.pushState(null, '', path);
  updateCurrentRoute();
  observer.notify(currentRoute);  // ← 구독자들에게 알림!
};

/**
 * 현재 라우트 정보
 */
export const getCurrentRoute = () => currentRoute;

/**
 * 쿼리 업데이트 (replaceState)
 */
export const updateQuery = (updates) => {
  const current = currentRoute.query;
  const merged = { ...current, ...updates };

  // 빈 값 제거
  Object.keys(merged).forEach(key => {
    if (!merged[key]) delete merged[key];
  });

  const queryString = new URLSearchParams(merged).toString();
  const newPath = `${location.pathname}${queryString ? '?' + queryString : ''}`;

  window.history.replaceState(null, '', newPath);
  updateCurrentRoute();
  observer.notify(currentRoute);
};

// ===== 내부 함수 =====

// 라우트 업데이트
const updateCurrentRoute = () => {
  const path = location.pathname;
  const query = Object.fromEntries(new URLSearchParams(location.search));

  for (const [pattern, component] of Object.entries(routes)) {
    const match = matchRoute(path, pattern);
    if (match) {
      currentRoute = { name: pattern, params: match.params, query, component };
      return;
    }
  }

  // 404
  currentRoute = { name: '*', params: {}, query, component: routes['*'] };
};

// 라우트 매칭
const matchRoute = (path, pattern) => {
  if (pattern === '*') return null;
  if (pattern === path) return { params: {} };

  const regex = new RegExp('^' + pattern.replace(/:(\w+)/g, '([^/]+)') + '$');
  const match = path.match(regex);

  if (match) {
    const paramNames = [...pattern.matchAll(/:(\w+)/g)].map(m => m[1]);
    const params = {};
    paramNames.forEach((name, i) => {
      params[name] = match[i + 1];
    });
    return { params };
  }

  return null;
};

// popstate (뒤로/앞으로 가기)
window.addEventListener('popstate', () => {
  updateCurrentRoute();
  observer.notify(currentRoute);
});
```

### 2-2. NotFoundPage 만들기 (30분)

**파일**: `src/pages/NotFoundPage.js`

```javascript
export function NotFoundPage() {
  return `
    <div class="not-found-page">
      <div class="not-found-content">
        <h1 class="not-found-title">404</h1>
        <p class="not-found-message">페이지를 찾을 수 없습니다</p>
        <a href="/" class="btn btn--primary">
          홈으로 돌아가기
        </a>
      </div>
    </div>
  `;
}
```

### 2-3. main.js 적용 (30분)

**파일**: `src/main.js`

```javascript
import * as router from './core/router.js';
import { HomePage } from './pages/HomePage.js';
import { DetailPage } from './pages/DetailPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

// 1. 라우트 설정
router.setup({
  "/": HomePage,
  "/products/:id": DetailPage,
  "*": NotFoundPage,
});

// 2. 구독 - 라우트 변경 시 자동 렌더링
router.subscribe((route) => {
  const $root = document.querySelector('#root');
  $root.innerHTML = route.component(route);
});

// 3. 이벤트 핸들러
document.body.addEventListener('click', (e) => {
  // 링크 클릭 처리
  const $link = e.target.closest('a[href^="/"]');
  if ($link) {
    e.preventDefault();
    router.push($link.getAttribute('href'));
  }
});

// 4. 초기 렌더링
router.push(location.pathname);
```

### 2-4. 테스트

```bash
# 브라우저에서 확인
pnpm run dev

# 테스트
pnpm run test:e2e:ui
```

**확인 사항**:
- [ ] 링크 클릭 → 페이지 전환 (새로고침 없음)
- [ ] 뒤로가기 → 이전 페이지
- [ ] `/asdfasdf` → 404 페이지
- [ ] 콘솔에 에러 없음

✅ **완료**: Router가 Observer 패턴으로 동작!

---

## Step 3: Store 시스템 (2시간) ⭐⭐⭐

### 3-1. createStore 팩토리 함수 (1시간)

**파일**: `src/core/store.js`

```javascript
import { createObserver } from './observer.js';

/**
 * Store 생성
 * @param {Object} config - { state, actions }
 * @returns {Object} { subscribe, getState, dispatch }
 */
export const createStore = (config) => {
  const observer = createObserver();
  let state = config.state;
  const actions = config.actions;

  // 1. 구독
  const subscribe = (callback) => {
    observer.subscribe(callback);
  };

  // 2. 상태 읽기
  const getState = () => state;

  // 3. 상태 업데이트 (내부용)
  const setState = (updates) => {
    state = { ...state, ...updates };
    observer.notify(state);  // ← 구독자들에게 알림!
  };

  // 4. 액션 디스패치
  const dispatch = ({ type, payload }) => {
    const action = actions[type];
    if (action) {
      action(setState, payload, getState);  // setState, payload, getState 전달
    } else {
      console.warn(`Unknown action: ${type}`);
    }
  };

  return { subscribe, getState, dispatch };
};
```

### 3-2. 앱 전역 Store 생성 (1시간)

**파일**: `src/state/store.js`

**Q&A에서 강조한 loading/error 패턴 적용!**

```javascript
import { createStore } from '../core/store.js';
import { save, load } from '../core/storage.js';

export const store = createStore({
  state: {
    home: {
      products: [],
      loading: false,
      error: null,
    },
    detail: {
      product: null,
      relatedProducts: [],
      loading: false,
      error: null,
    },
    cart: load('cart') || [],
  },

  actions: {
    // ===== Home =====

    // 로딩 시작
    pendingProducts(set) {
      set({ home: { loading: true, error: null } });
    },

    // 성공
    setProducts(set, products) {
      set({ home: { products, loading: false, error: null } });
    },

    // 에러
    errorProducts(set, error) {
      set({ home: { loading: false, error: error.message } });
    },

    // ===== Detail =====

    pendingProduct(set) {
      set({ detail: { loading: true, error: null } });
    },

    setProduct(set, product) {
      set({ detail: { product, loading: false, error: null } });
    },

    // ===== Cart =====

    addToCart(set, product, get) {
      const currentState = get();
      const cart = [...currentState.cart];
      const existing = cart.find(item => item.id === product.id);

      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }

      save('cart', cart);
      set({ cart });
    },

    removeFromCart(set, productId, get) {
      const currentState = get();
      const cart = currentState.cart.filter(item => item.id !== productId);
      save('cart', cart);
      set({ cart });
    },

    updateQuantity(set, { productId, quantity }, get) {
      const currentState = get();
      const cart = [...currentState.cart];
      const item = cart.find(item => item.id === productId);

      if (item) {
        item.quantity = Math.max(1, quantity);
        save('cart', cart);
        set({ cart });
      }
    },
  },
});
```

**localStorage 래퍼** (`src/core/storage.js`):

```javascript
export const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Storage save error:', error);
  }
};

export const load = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Storage load error:', error);
    return null;
  }
};
```

### 3-3. main.js에 Store 연결

```javascript
// main.js
import * as router from './core/router.js';
import { store } from './state/store.js';
import { HomePage, DetailPage, NotFoundPage } from './pages/index.js';

// 라우트 설정
router.setup({
  "/": HomePage,
  "/products/:id": DetailPage,
  "*": NotFoundPage,
});

// 통합 렌더링 함수
const render = () => {
  const route = router.getCurrentRoute();
  const state = store.getState();

  const $root = document.querySelector('#root');
  $root.innerHTML = route.component({ ...route, ...state });
};

// Router, Store 모두 구독
router.subscribe(render);
store.subscribe(render);

// 초기 렌더링
router.push(location.pathname);
```

### 3-4. API 호출 패턴 (pending → success/error)

```javascript
// api/productApi.js 활용 예시

import { store } from '../state/store.js';
import { getProducts } from '../api/productApi.js';

async function loadProducts(query) {
  // 1. 로딩 시작
  store.dispatch({ type: 'pendingProducts' });

  try {
    // 2. API 호출
    const products = await getProducts(query);

    // 3. 성공
    store.dispatch({ type: 'setProducts', payload: products });
  } catch (error) {
    // 4. 에러
    store.dispatch({ type: 'errorProducts', payload: error });
  }
}
```

✅ **완료**: Store가 Observer 패턴으로 동작! 상태 변경 시 자동 렌더링!

---

## Step 4: Lifecycle 시스템 (3시간) ⭐⭐⭐

### 4-1. withLifecycle HOC 구현 (1시간)

**파일**: `src/core/lifecycle.js`

```javascript
/**
 * Lifecycle HOC
 * @param {Object} hooks - { mount, watchs, unmount }
 * @param {Function} renderFn - 렌더링 함수
 * @returns {Function} 래핑된 컴포넌트
 */
export function withLifecycle(hooks, renderFn) {
  let isMounted = false;
  let oldValues = {};

  const wrappedComponent = (props) => {
    // 1. mount 실행 (1번만)
    if (!isMounted && hooks.mount) {
      hooks.mount();
      isMounted = true;
    }

    // 2. watch 체크
    if (hooks.watchs) {
      hooks.watchs.forEach(({ target, callback }) => {
        const newValue = target();
        const key = target.toString();
        const oldValue = oldValues[key];

        // 값이 변경되었는지 확인
        if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
          callback(newValue, oldValue);
          oldValues[key] = newValue;
        }
      });
    }

    // 3. 렌더링
    return renderFn(props);
  };

  // unmount 훅
  wrappedComponent.unmount = () => {
    if (hooks.unmount) {
      hooks.unmount();
    }
    isMounted = false;
  };

  return wrappedComponent;
}
```

### 4-2. HomePage에 적용 (1시간)

**파일**: `src/pages/HomePage.js`

```javascript
import { withLifecycle } from '../core/lifecycle.js';
import * as router from '../core/router.js';
import { store } from '../state/store.js';
import { getProducts } from '../api/productApi.js';
import { ProductCard } from '../components/product/ProductCard.js';

export const HomePage = withLifecycle(
  {
    // 1. 마운트 - 초기 로드
    mount() {
      loadProducts();
    },

    // 2. Watch - 쿼리 변경 시 리로드
    watchs: [
      {
        target() {
          return router.getCurrentRoute().query;
        },
        callback() {
          loadProducts();
        },
      }
    ],
  },

  // 3. 렌더링 함수
  () => {
    const { products, loading, error } = store.getState().home;

    if (loading) {
      return '<div class="loading">로딩 중...</div>';
    }

    if (error) {
      return `<div class="error">${error}</div>`;
    }

    if (products.length === 0) {
      return '<div class="empty">상품이 없습니다</div>';
    }

    return `
      <div class="home-page">
        <div class="product-grid">
          ${products.map(product => ProductCard({ product })).join('')}
        </div>
      </div>
    `;
  }
);

// 상품 로드 함수
async function loadProducts() {
  const query = router.getCurrentRoute().query;

  store.dispatch({ type: 'pendingProducts' });

  try {
    const data = await getProducts(query);
    store.dispatch({ type: 'setProducts', payload: data });
  } catch (error) {
    store.dispatch({ type: 'errorProducts', payload: error });
  }
}
```

### 4-3. DetailPage에 적용 (1시간)

**파일**: `src/pages/DetailPage.js`

```javascript
import { withLifecycle } from '../core/lifecycle.js';
import * as router from '../core/router.js';
import { store } from '../state/store.js';
import { getProduct } from '../api/productApi.js';

export const DetailPage = withLifecycle(
  {
    mount() {
      const { id } = router.getCurrentRoute().params;
      loadProduct(id);
    },

    watchs: [
      {
        target() {
          return router.getCurrentRoute().params.id;
        },
        callback(newId) {
          loadProduct(newId);
        },
      }
    ],
  },

  () => {
    const { product, loading, error } = store.getState().detail;

    if (loading) {
      return '<div class="loading">로딩 중...</div>';
    }

    if (error) {
      return `<div class="error">${error}</div>`;
    }

    if (!product) {
      return '<div class="empty">상품을 찾을 수 없습니다</div>';
    }

    return `
      <div class="detail-page">
        <h1>${product.title}</h1>
        <img src="${product.thumbnail}" alt="${product.title}">
        <p class="price">$${product.price}</p>
        <p>${product.description}</p>
        <button
          data-action="add-to-cart"
          data-product-id="${product.id}"
        >
          장바구니 담기
        </button>
      </div>
    `;
  }
);

async function loadProduct(id) {
  store.dispatch({ type: 'pendingProduct' });

  try {
    const product = await getProduct(id);
    store.dispatch({ type: 'setProduct', payload: product });
  } catch (error) {
    store.dispatch({ type: 'errorProduct', payload: error });
  }
}
```

### 4-4. main.js 업데이트 (unmount 처리)

```javascript
// main.js
import * as router from './core/router.js';
import { store } from './state/store.js';
import { HomePage, DetailPage, NotFoundPage } from './pages/index.js';

router.setup({
  "/": HomePage,
  "/products/:id": DetailPage,
  "*": NotFoundPage,
});

let currentComponent = null;

const render = () => {
  const route = router.getCurrentRoute();
  const $root = document.querySelector('#root');

  // 이전 컴포넌트 unmount
  if (currentComponent?.unmount) {
    currentComponent.unmount();
  }

  // 새 컴포넌트 렌더링
  currentComponent = route.component;
  $root.innerHTML = route.component();
};

router.subscribe(render);
store.subscribe(render);

router.push(location.pathname);
```

✅ **완료**: 🎉 핵심 4요소 완성! (Observer + Router + Store + Lifecycle)

---

## 🎉 Phase 1 완료!

여기까지 구현하면 **실용적인 SPA의 핵심**이 완성됩니다!

**완성된 것들**:
- ✅ Observer 패턴
- ✅ Router (subscribe로 자동 렌더링)
- ✅ Store (loading/error 패턴, dispatch)
- ✅ Lifecycle (mount, watch, unmount)

**이제 가능한 것들**:
- 새로고침 없는 페이지 전환
- URL 파라미터/쿼리 기반 렌더링
- 상태 변경 시 자동 UI 업데이트
- API 로딩/에러 상태 관리
- 값 변경 감지 및 자동 리로드

---

## Phase 2: 추가 기능 (선택사항)

### Step 5: 무한 스크롤 & 최적화 (3-5시간)

**파일**: `src/core/events.js`

```javascript
export const EVENTS = Object.freeze({
  // 장바구니
  CART_UPDATED: 'cart:updated',

  // 라우팅
  ROUTE_CHANGED: 'route:changed',

  // UI
  TOAST_SHOW: 'toast:show',
  MODAL_OPEN: 'modal:open',
  MODAL_CLOSE: 'modal:close',

  // 로딩
  LOADING_START: 'loading:start',
  LOADING_END: 'loading:end',
});
```

### 3-2. 토스트 시스템

**컴포넌트**: `src/components/common/Toast.js`

```javascript
export function Toast({ message, type = 'info' }) {
  return `
    <div class="toast toast--${type}">
      <p class="toast__message">${message}</p>
      <button class="toast__close" data-action="close-toast">×</button>
    </div>
  `;
}
```

**토스트 매니저**: `src/utils/toast.js`

```javascript
import { Toast } from '../components/common/Toast.js';

let $container = null;

const getContainer = () => {
  if (!$container) {
    $container = document.createElement('div');
    $container.id = 'toast-container';
    $container.className = 'toast-container';
    document.body.appendChild($container);
  }
  return $container;
};

export const showToast = (message, type = 'info', duration = 3000) => {
  const container = getContainer();

  const $toast = document.createElement('div');
  $toast.innerHTML = Toast({ message, type });

  const $toastEl = $toast.firstElementChild;
  container.appendChild($toastEl);

  // 자동 제거
  setTimeout(() => {
    $toastEl.classList.add('toast--fade-out');
    setTimeout(() => $toastEl.remove(), 300);
  }, duration);

  // 닫기 버튼
  $toastEl.querySelector('[data-action="close-toast"]')
    .addEventListener('click', () => $toastEl.remove());
};
```

**사용**:

```javascript
import { on } from './core/eventBus.js';
import { EVENTS } from './core/events.js';
import { showToast } from './utils/toast.js';

// 장바구니 추가 시 토스트
on(EVENTS.CART_UPDATED, () => {
  showToast('장바구니에 추가되었습니다', 'success');
});
```

---

## Step 4: 무한 스크롤 (3시간)

### 4-1. IntersectionObserver 유틸

**파일**: `src/utils/infiniteScroll.js`

```javascript
/**
 * 무한 스크롤 초기화
 * @param {string} selector - 감지할 요소 선택자
 * @param {Function} callback - 화면에 보일 때 실행할 함수
 * @returns {IntersectionObserver}
 */
export const setupInfiniteScroll = (selector, callback) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback();
        }
      });
    },
    {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    }
  );

  const $target = document.querySelector(selector);
  if ($target) {
    observer.observe($target);
  }

  return observer;
};
```

### 4-2. 페이지네이션 로직

```javascript
// main.js에 추가
let currentPage = 0;
let isLoading = false;
let hasMore = true;

const loadMoreProducts = async () => {
  if (isLoading || !hasMore) return;

  isLoading = true;
  const query = getQuery();

  const data = await getProducts({
    search: query.search,
    limit: 20,
    skip: currentPage * 20,
  });

  // 기존 상품에 추가
  const $grid = document.querySelector('.product-grid');
  const fragment = document.createDocumentFragment();

  data.products.forEach(product => {
    const div = document.createElement('div');
    div.innerHTML = ProductCard({ product });
    fragment.appendChild(div.firstElementChild);
  });

  $grid.appendChild(fragment);

  currentPage += 1;
  hasMore = data.products.length === 20;
  isLoading = false;
};

// 무한 스크롤 초기화
setupInfiniteScroll('#scroll-trigger', loadMoreProducts);
```

---

## Step 5: 최적화 (2시간)

### 5-1. Debounce

**파일**: `src/utils/debounce.js`

```javascript
/**
 * 디바운스 (마지막 호출만 실행)
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export const debounce = (fn, delay = 300) => {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};
```

**사용**:

```javascript
import { debounce } from './utils/debounce.js';

// 검색 input
const $searchInput = document.querySelector('#search');
$searchInput.addEventListener('input', debounce((e) => {
  updateQuery({ search: e.target.value });
}, 300));
```

### 5-2. DocumentFragment

```javascript
// 대량 DOM 추가 시
const renderProducts = (products) => {
  const fragment = document.createDocumentFragment();

  products.forEach(product => {
    const div = document.createElement('div');
    div.innerHTML = ProductCard({ product });
    fragment.appendChild(div.firstElementChild);
  });

  $container.innerHTML = '';
  $container.appendChild(fragment);
};
```

---

## 🎯 최종 체크리스트

### 라우팅
- [ ] 페이지 전환 시 새로고침 없음
- [ ] URL 파라미터 추출 (`/product/:id`)
- [ ] 쿼리 파라미터 관리
- [ ] 404 페이지
- [ ] 뒤로/앞으로 가기 동작

### 상태 관리
- [ ] localStorage에 장바구니 저장
- [ ] 새로고침 후에도 장바구니 유지
- [ ] URL 쿼리로 검색/필터 상태 관리

### 이벤트
- [ ] 이벤트 위임
- [ ] 토스트 메시지
- [ ] 장바구니 업데이트 시 뱃지 변경

### 성능
- [ ] DocumentFragment 사용
- [ ] Debounce 적용
- [ ] 무한 스크롤 동작

### 테스트
- [ ] e2e 테스트 통과
- [ ] 배포 완료

---

**이제 시작하세요!** 🚀
