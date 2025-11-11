# 라이프사이클 시스템

> **목표**: 컴포넌트의 생명주기를 관리하고 반응형 데이터를 구현합니다.

## 🎯 왜 필요한가?

### 문제 상황

```javascript
// ❌ 문제: 컴포넌트가 렌더링될 때마다 API를 호출해야 하는데...
const DetailPage = ({ id }) => {
  // 여기서 API 호출하면?
  // 1. 렌더링할 때마다 호출됨 (비효율)
  // 2. 비동기 처리 어려움
  // 3. id가 변경될 때 감지 못함

  return `<div>...</div>`;
};
```

### 해결책: Lifecycle Hooks

```javascript
// ✅ 해결: mount/watch로 제어
const DetailPage = withLifecycle(
  {
    mount() {
      // 컴포넌트 초기화 시 1번만 실행
      loadProduct(router.params.id);
    },

    watchs: [
      {
        target() { return router.params.id },
        callback(newId) {
          // id가 변경될 때만 실행
          loadProduct(newId);
        },
      }
    ],
  },

  () => {
    // 렌더링 함수
    const { product } = store.getState().detail;
    return `<div>${product.title}</div>`;
  }
);
```

---

## 📚 Lifecycle Hooks

### 1. mount - 컴포넌트 초기화

**언제 실행?** 컴포넌트가 처음 렌더링될 때 **1번만**

**용도:**
- API 요청
- 초기 데이터 로드
- 이벤트 리스너 등록

**예시:**

```javascript
export const HomePage = withLifecycle(
  {
    mount() {
      const { search, category, sort } = router.getCurrentRoute().query;

      // 초기 상품 로드
      store.dispatch({ type: 'pendingProducts' });

      getProducts({ search, category, sort })
        .then(products => {
          store.dispatch({ type: 'setProducts', payload: products });
        })
        .catch(error => {
          store.dispatch({ type: 'errorProducts', payload: error });
        });
    },
  },

  () => {
    const { products, loading, error } = store.getState().home;
    return HomePage({ products, loading, error });
  }
);
```

---

### 2. watchs - 반응형 데이터

**언제 실행?** 감시하는 값이 변경될 때마다

**용도:**
- 쿼리 파라미터 변경 감지
- URL 파라미터 변경 감지
- Store 특정 값 변경 감지

**예시 1: Query 파라미터 감시**

```javascript
export const HomePage = withLifecycle(
  {
    mount() {
      loadProducts();
    },

    watchs: [
      {
        // router.query가 변경되면 자동 실행
        target() {
          return router.getCurrentRoute().query;
        },

        callback(newQuery, oldQuery) {
          console.log('Query 변경:', oldQuery, '->', newQuery);

          // 쿼리가 변경되면 상품 다시 로드
          loadProducts();
        },
      }
    ],
  },

  () => {
    const { products, loading } = store.getState().home;
    return HomePage({ products, loading });
  }
);

function loadProducts() {
  const { search, category, sort } = router.getCurrentRoute().query;

  store.dispatch({ type: 'pendingProducts' });

  getProducts({ search, category, sort })
    .then(products => {
      store.dispatch({ type: 'setProducts', payload: products });
    });
}
```

**예시 2: URL 파라미터 감시**

```javascript
export const DetailPage = withLifecycle(
  {
    mount() {
      const { id } = router.getCurrentRoute().params;
      loadProduct(id);
    },

    watchs: [
      {
        // params.id가 변경되면 자동 실행
        target() {
          return router.getCurrentRoute().params.id;
        },

        callback(newId, oldId) {
          console.log('상품 ID 변경:', oldId, '->', newId);
          loadProduct(newId);
        },
      }
    ],
  },

  () => {
    const { product, loading } = store.getState().detail;
    return DetailPage({ product, loading });
  }
);

function loadProduct(id) {
  store.dispatch({ type: 'pendingProduct' });

  getProduct(id)
    .then(product => {
      store.dispatch({ type: 'setProduct', payload: product });
    });
}
```

---

### 3. unmount - 정리 작업

**언제 실행?** 컴포넌트가 사라질 때

**용도:**
- 이벤트 리스너 해제
- 타이머 정리
- 구독 해제

**예시:**

```javascript
export const HomePage = withLifecycle(
  {
    mount() {
      // 이벤트 리스너 등록
      window.addEventListener('scroll', handleScroll);
    },

    unmount() {
      // 정리: 이벤트 리스너 해제
      window.removeEventListener('scroll', handleScroll);
    },
  },

  () => {
    return HomePage();
  }
);

const handleScroll = () => {
  console.log('스크롤 중...');
};
```

---

## 🔧 withLifecycle HOC 구현

### 기본 구현

```javascript
// core/lifecycle.js

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
        const oldValue = oldValues[target.toString()];

        // 값이 변경되었는지 확인
        if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
          callback(newValue, oldValue);
          oldValues[target.toString()] = newValue;
        }
      });
    }

    // 3. 렌더링
    return renderFn(props);
  };

  // unmount 훅을 외부에서 호출할 수 있도록
  wrappedComponent.unmount = () => {
    if (hooks.unmount) {
      hooks.unmount();
    }
    isMounted = false;
  };

  return wrappedComponent;
}
```

---

## 💡 실전 패턴

### 패턴 1: API 로딩 패턴

```javascript
export const HomePage = withLifecycle(
  {
    mount() {
      loadProducts();
    },

    watchs: [
      {
        target() { return router.getCurrentRoute().query },
        callback() { loadProducts() },
      }
    ],
  },

  () => {
    const { products, loading, error } = store.getState().home;

    if (loading) {
      return LoadingSpinner();
    }

    if (error) {
      return ErrorMessage({ error });
    }

    return HomePage({ products });
  }
);

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

---

### 패턴 2: 여러 Watch 사용

```javascript
export const HomePage = withLifecycle(
  {
    mount() {
      loadProducts();
      loadCategories();
    },

    watchs: [
      // Watch 1: 쿼리 변경 시
      {
        target() { return router.getCurrentRoute().query.search },
        callback() { loadProducts() },
      },

      // Watch 2: 카테고리 변경 시
      {
        target() { return router.getCurrentRoute().query.category },
        callback() { loadProducts() },
      },

      // Watch 3: 정렬 변경 시
      {
        target() { return router.getCurrentRoute().query.sort },
        callback() { loadProducts() },
      },
    ],
  },

  () => {
    const state = store.getState().home;
    return HomePage(state);
  }
);
```

---

### 패턴 3: 무한 스크롤과 함께

```javascript
export const HomePage = withLifecycle(
  {
    mount() {
      loadProducts();
      setupInfiniteScroll();
    },

    watchs: [
      {
        target() { return router.getCurrentRoute().query },
        callback() {
          resetPage();
          loadProducts();
        },
      }
    ],

    unmount() {
      cleanupInfiniteScroll();
    },
  },

  () => {
    const { products, loading } = store.getState().home;
    return HomePage({ products, loading });
  }
);

let currentPage = 0;
let observer = null;

function loadProducts() {
  // 페이지 로드 로직
}

function setupInfiniteScroll() {
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      currentPage++;
      loadProducts();
    }
  });

  const trigger = document.querySelector('#scroll-trigger');
  if (trigger) observer.observe(trigger);
}

function cleanupInfiniteScroll() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

function resetPage() {
  currentPage = 0;
}
```

---

## 🚦 main.js 통합 예시

```javascript
// main.js
import * as router from './core/router.js';
import { store } from './state/store.js';
import { HomePage } from './pages/HomePage.js';
import { DetailPage } from './pages/DetailPage.js';

// 1. 라우트 설정
router.setup({
  "/": HomePage,
  "/products/:id": DetailPage,
});

// 2. 렌더링 함수
const render = () => {
  const route = router.getCurrentRoute();
  const $root = document.querySelector('#root');

  // 이전 컴포넌트 unmount
  if (window.currentComponent?.unmount) {
    window.currentComponent.unmount();
  }

  // 새 컴포넌트 렌더링
  window.currentComponent = route.component;
  $root.innerHTML = route.component(route);
};

// 3. 구독
router.subscribe(render);
store.subscribe(render);

// 4. 초기 렌더링
router.push(location.pathname);
```

---

## 📋 체크리스트

### Lifecycle 구현 확인

- [ ] `withLifecycle` 함수 구현
- [ ] mount 훅 동작 확인
- [ ] watch 훅 값 변경 감지 확인
- [ ] unmount 훅 정리 작업 확인

### 실전 적용

- [ ] HomePage에 lifecycle 적용
- [ ] DetailPage에 lifecycle 적용
- [ ] 쿼리 파라미터 변경 시 자동 리로드
- [ ] URL 파라미터 변경 시 자동 리로드

### 성능 최적화

- [ ] mount는 1번만 실행되는가?
- [ ] watch는 값이 변경될 때만 실행되는가?
- [ ] unmount에서 정리 작업이 되는가?

---

## 🎯 핵심 정리

1. **mount**: 컴포넌트 초기화, API 로드
2. **watchs**: 값 변경 감지, 자동 리로드
3. **unmount**: 정리 작업

이 3가지만 구현하면 **React의 useEffect와 유사한** 생명주기 관리가 가능합니다!

---

**다음**: [03-IMPLEMENTATION-GUIDE.md - 단계별 구현 가이드](./03-IMPLEMENTATION-GUIDE.md) →
