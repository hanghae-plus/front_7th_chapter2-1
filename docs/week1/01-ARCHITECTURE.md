# 아키텍처 설계 가이드

> **원칙**: 과도한 추상화보다 명확한 구조. 테스트 통과가 최우선.

## 🎯 설계 철학

### YAGNI (You Aren't Gonna Need It)
지금 당장 필요하지 않은 기능은 만들지 않습니다.

```javascript
// ❌ Bad - 지금 필요 없는 복잡한 시스템
class RouterSystem {
  #routes = new Map();
  #middleware = [];
  #guards = [];
  #errorHandlers = [];
  // ... 100줄
}

// ✅ Good - 지금 필요한 것만
const routes = {
  '/': renderHome,
  '/product/:id': renderDetail
};

const navigate = (path) => {
  history.pushState(null, '', path);
  render();
};
```

### 책임 분리
각 파일/함수는 하나의 명확한 역할만 합니다.

---

## 📁 폴더 구조 상세

### `/core` - 핵심 유틸리티

**역할**: 앱의 기반이 되는 작은 유틸리티 함수들

#### ⭐ core/observer.js - Observer 패턴 (가장 중요!)

**왜 필요한가?**
Router, Store가 변경될 때 자동으로 구독자(주로 render 함수)에게 알리기 위해

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

**사용 예시:**
```javascript
const observer = createObserver();

// 구독
observer.subscribe((data) => console.log('데이터:', data));
observer.subscribe(() => render());

// 알림
observer.notify({ message: 'changed' });  // 모든 구독자 실행
```

---

#### core/router.js - Observer 기반 라우팅

**Q&A에서 강조한 패턴: subscribe로 자동 렌더링**

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

// 라우트 업데이트 (내부 함수)
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

**사용 예시 (main.js):**
```javascript
import * as router from './core/router.js';

// 1. 라우트 설정
router.setup({
  "/": HomePage,
  "/products/:id": DetailPage,
  "*": NotFoundPage,
});

// 2. 구독 - 라우트 변경 시 자동 렌더링!
router.subscribe((route) => {
  const $root = document.querySelector('#root');
  $root.innerHTML = route.component(route);
});

// 3. 초기 렌더링
router.push(location.pathname);

// 4. 네비게이션
document.body.addEventListener('click', (e) => {
  if (e.target.matches('a[href^="/"]')) {
    e.preventDefault();
    router.push(e.target.getAttribute('href'));
  }
});
```

---

#### core/storage.js - localStorage 래퍼

```javascript
export const save = (key, value) => { ... };
export const load = (key) => { ... };
export const remove = (key) => { ... };
```

**규칙**:
- ✅ 순수 함수만 (side effect 최소화)
- ✅ export된 함수는 JSDoc 필수
- ✅ 파일당 50줄 이내

---

### `/utils` - 헬퍼 함수

**역할**: 재사용 가능한 유틸리티

```javascript
// utils/dom.js
export const createElement = (tag, attrs = {}, children = []) => { ... };
export const addClass = (el, className) => { ... };
export const removeClass = (el, className) => { ... };

// utils/debounce.js
export const debounce = (fn, delay) => { ... };
export const throttle = (fn, delay) => { ... };

// utils/formatters.js
export const formatPrice = (price) => { ... };
export const formatDate = (date) => { ... };
```

**규칙**:
- ✅ 순수 함수 (입력 → 출력)
- ✅ 함수명은 동사 시작
- ✅ 한 파일에 관련된 함수만

---

### `/components` - UI 컴포넌트

**역할**: 재사용 가능한 UI 조각. 템플릿 문자열 반환.

```javascript
// components/common/Toast.js
/**
 * 토스트 메시지 UI를 생성합니다
 * @param {Object} options
 * @param {string} options.message - 표시할 메시지
 * @param {'success'|'error'|'info'} options.type - 토스트 타입
 * @returns {string} HTML 문자열
 */
export const Toast = ({ message, type = 'info' }) => {
  return `
    <div class="toast toast--${type}">
      <p>${message}</p>
      <button class="toast__close" data-action="close-toast">×</button>
    </div>
  `;
};

// components/product/ProductCard.js
export const ProductCard = ({ product }) => {
  return `
    <div class="product-card" data-product-id="${product.id}">
      <img src="${product.thumbnail}" alt="${product.title}">
      <h3>${product.title}</h3>
      <p class="price">$${formatPrice(product.price)}</p>
      <button data-action="add-to-cart">장바구니 담기</button>
    </div>
  `;
};
```

**규칙**:
- ✅ 함수명은 PascalCase (React 컴포넌트처럼)
- ✅ props 객체로 데이터 받기
- ✅ HTML 문자열 반환
- ✅ data-* 속성으로 이벤트 핸들링
- ✅ 파일당 1개 컴포넌트

---

### `/pages` - 페이지 컴포넌트

**역할**: 전체 페이지 레이아웃

```javascript
// pages/HomePage.js
import { ProductGrid } from '../components/product/ProductGrid.js';
import { SearchForm } from '../components/SearchForm.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.js';

export const HomePage = ({ products = [], loading = false, search = '' }) => {
  if (loading) {
    return LoadingSpinner();
  }

  return `
    <div class="home-page">
      <header>
        ${SearchForm({ value: search })}
      </header>
      <main>
        ${ProductGrid({ products })}
      </main>
    </div>
  `;
};

// pages/DetailPage.js
export const DetailPage = ({ product, relatedProducts = [] }) => {
  return `
    <div class="detail-page">
      <article class="product-detail">
        <img src="${product.images[0]}" alt="${product.title}">
        <div class="product-info">
          <h1>${product.title}</h1>
          <p class="price">$${product.price}</p>
          <button data-action="add-to-cart" data-product-id="${product.id}">
            장바구니 담기
          </button>
        </div>
      </article>

      <section class="related-products">
        <h2>관련 상품</h2>
        ${relatedProducts.map(p => ProductCard({ product: p })).join('')}
      </section>
    </div>
  `;
};
```

**규칙**:
- ✅ 페이지 단위 컴포넌트
- ✅ 여러 컴포넌트 조합
- ✅ 로딩/에러 상태 처리

---

### `/state` - 상태 관리

**역할**: 앱의 상태를 관리하는 Observer 기반 Store

#### core/store.js - Store 팩토리 함수

**Q&A에서 강조한 Vuex 스타일 Store**

```javascript
// core/store.js
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
      action(setState, payload);
    } else {
      console.warn(`Unknown action: ${type}`);
    }
  };

  return { subscribe, getState, dispatch };
};
```

#### state/store.js - 앱 전역 Store

**Q&A에서 강조한 loading/error 패턴**

```javascript
// state/store.js
import { createStore } from '../core/store.js';
import { save, load } from '../core/storage.js';

export const store = createStore({
  state: {
    home: {
      products: [],
      loading: false,
      error: null,
      categories: [],
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
    // Home - 로딩 시작
    pendingProducts(set) {
      set({ home: { loading: true, error: null } });
    },

    // Home - 성공
    setProducts(set, products) {
      set({ home: { products, loading: false, error: null } });
    },

    // Home - 에러
    errorProducts(set, error) {
      set({ home: { loading: false, error: error.message } });
    },

    // Detail - 로딩 시작
    pendingProduct(set) {
      set({ detail: { loading: true, error: null } });
    },

    // Detail - 성공
    setProduct(set, product) {
      set({ detail: { product, loading: false, error: null } });
    },

    // Cart - 추가
    addToCart(set, product) {
      const currentState = this.getState();
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

    // Cart - 제거
    removeFromCart(set, productId) {
      const currentState = this.getState();
      const cart = currentState.cart.filter(item => item.id !== productId);
      save('cart', cart);
      set({ cart });
    },
  },
});
```

**사용 예시:**

```javascript
// main.js
import { store } from './state/store.js';
import { getProducts } from './api/productApi.js';

// 구독 - 상태 변경 시 자동 렌더링
store.subscribe((state) => {
  render(state);
});

// API 호출 패턴
async function loadProducts(params) {
  // 1. 로딩 시작
  store.dispatch({ type: 'pendingProducts' });

  try {
    // 2. API 호출
    const products = await getProducts(params);

    // 3. 성공
    store.dispatch({ type: 'setProducts', payload: products });
  } catch (error) {
    // 4. 에러
    store.dispatch({ type: 'errorProducts', payload: error });
  }
}

// 렌더링
const render = (state) => {
  const $root = document.querySelector('#root');
  const route = router.getCurrentRoute();

  if (route.name === '/') {
    const { products, loading, error } = state.home;
    $root.innerHTML = HomePage({ products, loading, error });
  }
};
```

**규칙**:
- ✅ 상태는 Store 내부에서만 수정
- ✅ getState()로 읽기
- ✅ dispatch()로 상태 변경
- ✅ 상태 변경 시 자동으로 구독자 실행
- ✅ loading/error 패턴 필수

---

## 🔄 데이터 흐름

### 1. 단방향 데이터 플로우

```
User Action → Event Handler → State Update → Re-render
```

**예시: 장바구니에 상품 추가**

```javascript
// 1. User Action (클릭)
document.body.addEventListener('click', (e) => {
  const button = e.target.closest('[data-action="add-to-cart"]');
  if (!button) return;

  // 2. Event Handler
  const productId = button.dataset.productId;
  handleAddToCart(productId);
});

// 3. State Update
const handleAddToCart = async (productId) => {
  const product = await getProduct(productId);
  addToCart(product);  // state 업데이트
};

// 4. Re-render (이벤트 구독)
on('cart:updated', (cart) => {
  updateCartBadge(cart.length);
  showToast({ message: '장바구니에 추가되었습니다', type: 'success' });
});
```

---

### 2. 이벤트 기반 아키텍처

**이벤트 종류**:
```javascript
// core/events.js - 이벤트 타입 정의
export const EVENTS = {
  CART_UPDATED: 'cart:updated',
  ROUTE_CHANGED: 'route:changed',
  TOAST_SHOW: 'toast:show',
  LOADING_START: 'loading:start',
  LOADING_END: 'loading:end',
};
```

**발행 (Publisher)**:
```javascript
// state/cartState.js
export const addToCart = (product) => {
  cart.push(product);
  emit(EVENTS.CART_UPDATED, getCart());
};
```

**구독 (Subscriber)**:
```javascript
// main.js
import { on } from './core/eventBus.js';
import { EVENTS } from './core/events.js';

on(EVENTS.CART_UPDATED, (cart) => {
  // 장바구니 뱃지 업데이트
  const badge = document.querySelector('.cart-badge');
  badge.textContent = cart.length;
});

on(EVENTS.TOAST_SHOW, ({ message, type }) => {
  showToast(message, type);
});
```

---

## 🎨 렌더링 전략

### 1. 전체 렌더링 (페이지 전환)

```javascript
// main.js
const render = async () => {
  const $root = document.querySelector('#root');
  const path = location.pathname;
  const query = getQuery();

  // 페이지별 렌더링
  if (path === '/') {
    $root.innerHTML = HomePage({ loading: true });

    const products = await getProducts(query);

    $root.innerHTML = HomePage({
      products,
      loading: false,
      search: query.search
    });
  }
  else if (path.startsWith('/product/')) {
    const { id } = getParams();
    $root.innerHTML = DetailPage({ loading: true });

    const product = await getProduct(id);

    $root.innerHTML = DetailPage({ product });
  }
};

// 라우팅 이벤트 시 재렌더링
window.addEventListener('popstate', render);
on(EVENTS.ROUTE_CHANGED, render);
```

### 2. 부분 렌더링 (상태 변경)

```javascript
// 장바구니만 업데이트
on(EVENTS.CART_UPDATED, (cart) => {
  const $cartModal = document.querySelector('#cart-modal');
  if ($cartModal) {
    const $cartItems = $cartModal.querySelector('.cart-items');
    $cartItems.innerHTML = cart.map(item => CartItem({ item })).join('');
  }
});

// 토스트만 추가
on(EVENTS.TOAST_SHOW, ({ message, type }) => {
  const $toastContainer = document.querySelector('#toast-container');
  const toastEl = createElement('div', { class: 'toast' });
  toastEl.innerHTML = Toast({ message, type });
  $toastContainer.appendChild(toastEl);

  setTimeout(() => toastEl.remove(), 3000);
});
```

---

## 🚦 라우팅 패턴

### URL 구조
```
/                          → 홈 (상품 목록)
/?search=laptop            → 검색 결과
/?category=electronics     → 카테고리 필터
/?sort=price-asc           → 정렬
/product/123               → 상품 상세
/notfound                  → 404
```

### 라우팅 구현

```javascript
// core/router.js
const routes = {
  '/': 'home',
  '/product/:id': 'detail',
  '*': 'notfound'
};

export const matchRoute = (path) => {
  for (const [pattern, name] of Object.entries(routes)) {
    if (pattern === '*') continue;

    const regex = new RegExp('^' + pattern.replace(/:(\w+)/g, '([^/]+)') + '$');
    const match = path.match(regex);

    if (match) {
      const paramNames = [...pattern.matchAll(/:(\w+)/g)].map(m => m[1]);
      const params = {};

      paramNames.forEach((name, i) => {
        params[name] = match[i + 1];
      });

      return { name, params };
    }
  }

  return { name: 'notfound', params: {} };
};
```

---

## 📊 성능 최적화 전략

### 1. DocumentFragment 사용

```javascript
// ❌ Bad - 매번 reflow 발생
products.forEach(product => {
  container.innerHTML += ProductCard({ product });
});

// ✅ Good - 한 번에 추가
const fragment = document.createDocumentFragment();
products.forEach(product => {
  const div = document.createElement('div');
  div.innerHTML = ProductCard({ product });
  fragment.appendChild(div.firstElementChild);
});
container.appendChild(fragment);
```

### 2. 이벤트 위임

```javascript
// ❌ Bad - 각 버튼마다 리스너
buttons.forEach(btn => {
  btn.addEventListener('click', handleClick);
});

// ✅ Good - 하나의 리스너로 처리
document.body.addEventListener('click', (e) => {
  const action = e.target.dataset.action;

  if (action === 'add-to-cart') {
    handleAddToCart(e);
  } else if (action === 'remove-from-cart') {
    handleRemoveFromCart(e);
  }
});
```

### 3. Debounce/Throttle

```javascript
// 검색 입력 - debounce
searchInput.addEventListener('input', debounce((e) => {
  updateQuery({ search: e.target.value });
  render();
}, 300));

// 스크롤 - throttle
window.addEventListener('scroll', throttle(() => {
  checkInfiniteScroll();
}, 200));
```

---

## 🤔 Observer vs EventBus - 언제 무엇을 사용?

### Observer 패턴 (권장 ⭐)

**용도**: 특정 객체(Router, Store)의 변경사항 구독

**특징**:
- 단일 주체 (Router, Store)
- 타입 안전
- 간단명료

**사용처:**
- Router 변경 → 자동 렌더링
- Store 변경 → 자동 렌더링
- Lifecycle watch

**예시:**
```javascript
// Router 구독
router.subscribe((route) => {
  render(route);
});

// Store 구독
store.subscribe((state) => {
  render(state);
});

// 통합 렌더링
const render = () => {
  const route = router.getCurrentRoute();
  const state = store.getState();

  const $root = document.querySelector('#root');
  $root.innerHTML = route.component({ ...route, ...state });
};

router.subscribe(render);
store.subscribe(render);
```

---

### EventBus 패턴 (선택사항)

**용도**: 전역 이벤트 시스템 (여러 종류의 이벤트)

**특징**:
- 여러 이벤트 타입
- 느슨한 결합
- 디버깅 어려움

**사용처 (필요시만):**
- 토스트 메시지 (여러 곳에서 발생)
- 모달 제어
- 전역 알림

**예시:**
```javascript
// EventBus 구현
const listeners = {};

export const emit = (event, data) => {
  listeners[event]?.forEach(handler => handler(data));
};

export const on = (event, handler) => {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(handler);
};

// 사용
emit('toast:show', { message: '성공!' });
on('toast:show', ({ message }) => showToast(message));
```

---

### 권장: Observer만 사용하세요

**이번 과제는 Observer 패턴만으로도 충분합니다.**

```javascript
// ✅ 추천 구조
import * as router from './core/router.js';
import { store } from './state/store.js';

// Router와 Store 모두 구독
router.subscribe(render);
store.subscribe(render);

// 통합 렌더링
const render = () => {
  const route = router.getCurrentRoute();
  const state = store.getState();

  const $root = document.querySelector('#root');
  $root.innerHTML = route.component({ ...route, ...state });
};

// 초기 렌더링
router.push(location.pathname);
```

**EventBus는 생략 가능합니다.**

토스트, 모달 등은 직접 함수 호출로 처리:

```javascript
// EventBus 대신 직접 호출
import { showToast } from './utils/toast.js';

// 어디서든 호출
store.dispatch({ type: 'addToCart', payload: product });
showToast('장바구니에 추가되었습니다');
```

---

## 🎯 핵심 원칙 요약

1. **Observer 패턴** - Router, Store의 핵심
2. **단순함 우선** - 복잡한 추상화 지양
3. **명확한 책임 분리** - 한 파일/함수는 하나의 역할
4. **자동 렌더링** - subscribe로 구현
5. **테스트 우선** - 동작하는 코드가 최우선

---

**다음**: [02-CODING-STYLE.md - 코딩 스타일 가이드](./02-CODING-STYLE.md) →
