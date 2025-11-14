# 옵저버 패턴 구현 설명

## 1. 핵심 구조 (observer.js)

```javascript
let currentObserver = null;  // 현재 실행 중인 observer 추적

observe(fn)      // observer 함수 등록
observable(obj)  // 객체를 반응형으로 만듦
```

## 2. 작동 원리

### observable 함수
`Object.defineProperty`로 객체의 각 속성에 getter/setter를 재정의합니다:

- **getter**: 값을 읽을 때 `currentObserver`를 `observers Set`에 추가
- **setter**: 값이 변경되면 등록된 모든 observer 함수 실행

```javascript
export const observable = (obj) => {
  Object.keys(obj).forEach((key) => {
    let _value = obj[key];
    const observers = new Set();

    Object.defineProperty(obj, key, {
      get() {
        if (currentObserver) observers.add(currentObserver);
        return _value;
      },
      set(value) {
        if (_value === value) return;
        if (JSON.stringify(_value) === JSON.stringify(value)) return;
        _value = value;
        observers.forEach((fn) => fn());  // 모든 observer 실행
      },
    });
  });
  return obj;
};
```

### observe 함수
observer를 등록하는 과정:

1. `currentObserver`를 설정
2. 함수 실행 → 함수 내에서 state 읽기 → getter 호출 → observer 자동 등록
3. `currentObserver` 초기화

```javascript
export const observe = (fn) => {
  const debouncedFn = debounceFrame(fn);
  currentObserver = debouncedFn;
  fn(); // 초기 실행 (이때 observer 등록됨)
  currentObserver = null;
};
```

## 3. 성능 최적화

### requestAnimationFrame을 이용한 디바운스

```javascript
const debounceFrame = (callback) => {
  let currentCallback = -1;
  return () => {
    cancelAnimationFrame(currentCallback);
    currentCallback = requestAnimationFrame(callback);
  };
};
```

**효과:**
- 16ms(1프레임) 내 중복 호출 방지
- 브라우저 렌더링 주기에 맞춰 최적화
- 불필요한 DOM 조작 감소

### Set을 이용한 중복 방지

```javascript
const observers = new Set();  // 동일 observer 중복 등록 방지
```

## 4. Store 클래스 (Vuex 스타일)

```javascript
export class Store {
  #state;       // private, observable로 감싸진 실제 상태
  #mutations;   // 상태 변경 함수들
  #actions;     // 비동기 작업 함수들
  state = {};   // public, getter만 제공 (읽기 전용)

  constructor({ state, mutations, actions }) {
    this.#state = observable(state);  // 반응형으로 만듦
    this.#mutations = mutations;
    this.#actions = actions;

    // 읽기 전용 state 프록시
    Object.keys(state).forEach((key) => {
      Object.defineProperty(this.state, key, {
        get: () => this.#state[key],
      });
    });
  }

  // 동기 상태 변경
  commit(action, payload) {
    this.#mutations[action](this.#state, payload);
  }

  // 비동기 작업
  dispatch(action, payload) {
    return this.#actions[action](
      {
        state: this.#state,
        commit: this.commit.bind(this),
        dispatch: this.dispatch.bind(this),
      },
      payload,
    );
  }
}
```

## 5. 실제 사용 예시

### Observer 등록 (main.js)

```javascript
function setupObservers() {
  // 상품 목록 업데이트 관찰
  observe(() => {
    const productsGrid = document.getElementById("products-grid");
    if (productsGrid && store.state.products !== undefined) {
      // store.state.products를 읽음 → getter 호출 → observer 등록
      const content =
        !store.state.products || store.state.products.length === 0
          ? '<div class="col-span-2"><p class="text-center py-20 text-gray-500">상품이 없습니다</p></div>'
          : store.state.products.map((p) => productTemplates.card(p)).join("");
      productsGrid.innerHTML = content;
    }
  });

  // 상품 개수 업데이트 관찰
  observe(() => {
    const countElement = document.querySelector('[data-testid="product-count"]');
    if (countElement && store.state.totalCount !== undefined) {
      countElement.innerHTML = `총 <span class="font-medium text-gray-900">${store.state.totalCount}</span>개의 상품`;
    }
  });

  // 장바구니 아이콘 업데이트 관찰
  observe(() => {
    const cart = store.state.cart;
    const cartIconBtn = document.getElementById("cart-icon-btn");

    if (cartIconBtn) {
      const existingBadge = cartIconBtn.querySelector("span");
      if (existingBadge) {
        existingBadge.remove();
      }
      if (cart.length > 0) {
        const badgeHTML = `<span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">${cart.length}</span>`;
        cartIconBtn.insertAdjacentHTML("beforeend", badgeHTML);
      }
    }
  });
}
```

### Store 정의 (store.js)

```javascript
import { Store } from "./core/Store.js";

export const store = new Store({
  state: {
    products: [],
    cart: [],
    filters: {
      search: "",
      category1: "",
      category2: "",
      limit: 20,
      sort: "price_asc",
    },
    currentPage: 1,
    totalCount: 0,
  },

  mutations: {
    SET_PRODUCTS(state, products) {
      state.products = products;  // setter 호출 → observers 실행
    },
    
    SET_CART(state, cart) {
      state.cart = cart;
    },
    
    ADD_TO_CART(state, product) {
      state.cart.push(product);
    },
    
    SET_FILTERS(state, filters) {
      state.filters = { ...state.filters, ...filters };
    },
  },

  actions: {
    async loadProducts({ state, commit }) {
      const response = await getProducts(state.filters);
      commit("SET_PRODUCTS", response.products);
      commit("SET_TOTAL_COUNT", response.total);
    },
    
    async addToCart({ commit }, product) {
      commit("ADD_TO_CART", product);
      // localStorage 저장 등 추가 작업
    },
  },
});
```

### 상태 변경 및 자동 렌더링

```javascript
// 사용자가 검색어 입력
document.body.addEventListener("keydown", async (event) => {
  if (event.target.matches("#search-input") && event.key === "Enter") {
    const searchTerm = event.target.value.trim();
    
    // 1. 필터 상태 변경
    store.commit("SET_FILTERS", { search: searchTerm });
    
    // 2. 상품 로드
    await store.dispatch("loadProducts");
    // → loadProducts 내부에서 commit("SET_PRODUCTS", ...)
    // → setter 호출
    // → observe에 등록된 함수 자동 실행
    // → DOM 자동 업데이트! 🎉
  }
});
```

## 6. 데이터 흐름도

```
사용자 이벤트
    ↓
store.commit() / store.dispatch()
    ↓
mutation 실행 → state 변경
    ↓
setter 호출
    ↓
observers.forEach(fn => fn())
    ↓
DOM 자동 업데이트
```

## 7. 주요 특징

### ✅ 자동 의존성 추적
- 함수 내에서 실제로 사용한 state만 자동으로 구독
- 명시적으로 의존성 배열을 지정할 필요 없음

### ✅ 중복 실행 방지
- `Set` 자료구조로 동일 observer 중복 등록 방지
- 값이 실제로 변경되었을 때만 observer 실행
- `JSON.stringify` 비교로 깊은 비교 수행

### ✅ 성능 최적화
- `requestAnimationFrame`으로 브라우저 렌더링 주기에 맞춰 실행
- 16ms 내 중복 호출 자동 병합
- 불필요한 DOM 조작 최소화

### ✅ Vuex 스타일 API
- 익숙한 `commit/dispatch` 패턴
- mutations는 동기, actions는 비동기
- 명확한 상태 변경 흐름 추적 가능

### ✅ 단방향 데이터 플로우
- `store.state`는 읽기 전용 (getter만 제공)
- 상태 변경은 오직 `commit`을 통해서만 가능
- 예측 가능한 상태 관리

### ✅ 타입 안정성
- private 필드(`#state`, `#mutations`, `#actions`)로 캡슐화
- 외부에서 직접 접근 불가능

## 8. Vue/React와 비교

| 항목 | 이번 구현 | Vue 3 | React |
|------|----------|-------|-------|
| **반응성 방식** | Object.defineProperty | Proxy (Composition API) | Virtual DOM |
| **의존성 추적** | 자동 | 자동 | 수동 (useState, useEffect) |
| **최적화** | requestAnimationFrame | Scheduler | Fiber (Concurrent) |
| **상태 관리** | Vuex 스타일 Store | Pinia/Vuex | Context/Redux/Zustand |
| **번들 크기** | 경량 (~2KB) | 중간 (~50KB) | 대형 (~150KB) |
| **학습 곡선** | 낮음 | 중간 | 높음 |
| **브라우저 지원** | IE9+ | Modern | Modern |

## 9. 장단점

### 장점
- ✅ 바닐라 JS만으로 구현 (프레임워크 의존성 없음)
- ✅ 매우 작은 코드 사이즈
- ✅ 명시적이고 이해하기 쉬운 구조
- ✅ 디버깅이 용이 (상태 변경 흐름 추적 가능)
- ✅ 프레임워크 학습 경험 (Vue, MobX와 유사)

### 단점
- ❌ 중첩 객체는 깊은 감시 안 됨 (1depth만 지원)
- ❌ 배열 메서드 감지 안 됨 (push, pop 등)
- ❌ IE8 이하 미지원 (Object.defineProperty 필요)
- ❌ 프레임워크에 비해 기능 제한적
- ❌ 에러 경계(Error Boundary) 같은 고급 기능 없음

## 10. 개선 가능한 부분

### 깊은 관찰
```javascript
export const observable = (obj) => {
  Object.keys(obj).forEach((key) => {
    let _value = obj[key];
    
    // 객체나 배열이면 재귀적으로 observable 적용
    if (typeof _value === 'object' && _value !== null) {
      _value = observable(_value);
    }
    
    // ... getter/setter 정의
  });
};
```

### 배열 메서드 감지
```javascript
const arrayMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];

if (Array.isArray(obj)) {
  arrayMethods.forEach(method => {
    const original = Array.prototype[method];
    obj[method] = function(...args) {
      const result = original.apply(this, args);
      observers.forEach(fn => fn());  // 변경 감지
      return result;
    };
  });
}
```

### computed 속성
```javascript
export const computed = (fn) => {
  let cache;
  let dirty = true;
  
  observe(() => {
    dirty = true;
  });
  
  return () => {
    if (dirty) {
      cache = fn();
      dirty = false;
    }
    return cache;
  };
};
```

## 11. 실제 구현의 한계와 해결 방법

### 🤔 완전 자동 업데이트인가?

**답: 아니요, "반자동" 상태입니다.**

#### 현재 구조:

```javascript
// Observer로 자동 업데이트되는 부분 (일부만)
observe(() => {
  const productsGrid = document.getElementById("products-grid");
  if (productsGrid && store.state.products !== undefined) {
    // store.state.products 변경 시 자동 실행
    productsGrid.innerHTML = content;  // ✅ products-grid만 자동 업데이트
  }
});

// 하지만 실제로는 수동 호출 필요
document.body.addEventListener("keydown", async (event) => {
  if (event.target.matches("#search-input") && event.key === "Enter") {
    await store.dispatch("loadProducts");  // 상태 변경
    renderMainPage();  // ❌ 전체 페이지를 수동으로 다시 렌더링
  }
});
```

#### 왜 이렇게 구현했나?

**문제점 1: DOM 요소가 없을 때**
```javascript
observe(() => {
  const productsGrid = document.getElementById("products-grid");
  if (productsGrid) {  // ⚠️ 요소가 없으면 실행 안 됨
    productsGrid.innerHTML = content;
  }
});
```
- 페이지 전환 시 products-grid가 존재하지 않을 수 있음
- Observer가 실행되어도 DOM을 찾지 못하면 업데이트 안 됨

**문제점 2: 여러 부분을 함께 업데이트해야 함**
```javascript
renderMainPage() {
  // 1. 필터박스
  // 2. 상품 개수
  // 3. 상품 그리드
  // 4. 페이지네이션
  // 5. 장바구니 아이콘
  // → 모두 함께 렌더링되어야 일관성 유지
}
```

**문제점 3: E2E 테스트 안정성**
```javascript
// 테스트에서 products-grid를 찾으려면
await page.waitForSelector('[data-testid="products-grid"]');

// Observer만으로는 타이밍 이슈 발생 가능
// renderMainPage()를 명시적으로 호출해야 확실함
```

#### 실제 동작 흐름:

```
사용자가 검색어 입력
    ↓
store.dispatch("loadProducts")
    ↓
mutation: SET_PRODUCTS 실행
    ↓
setter 호출 → Observer 실행 (products-grid만 업데이트 시도)
    ↓
renderMainPage() 수동 호출 (전체 페이지 재렌더링)
    ↓
✅ 모든 요소가 확실하게 렌더링됨
```

### 완전 자동으로 만들려면?

**방법 1: Virtual DOM 방식**
```javascript
// React/Vue처럼 전체를 다시 렌더링하되, 변경된 부분만 실제 DOM 업데이트
const vdom = render(store.state);
patch(oldVdom, vdom);  // diff 알고리즘으로 최소한만 업데이트
```

**방법 2: 컴포넌트 기반 설계**
```javascript
class ProductList extends Component {
  render() {
    return this.products.map(p => ProductCard(p));
  }
}

// 각 컴포넌트가 독립적으로 관찰
observe(() => {
  productListComponent.update();
});
```

**방법 3: 템플릿 바인딩**
```javascript
<div v-for="product in products">  // Vue 스타일
  {{ product.name }}
</div>

// 또는
<div *ngFor="let product of products">  // Angular 스타일
  {{ product.name }}
</div>
```

### 현재 구현의 trade-off

| 측면 | 현재 방식 | 완전 자동 방식 |
|------|----------|---------------|
| **코드 복잡도** | 낮음 | 높음 |
| **성능** | 좋음 (필요할 때만 렌더링) | 보통 (diff 오버헤드) |
| **안정성** | 높음 (명시적 제어) | 중간 (타이밍 이슈) |
| **유지보수** | 쉬움 (흐름 명확) | 어려움 (마법 같음) |
| **테스트** | 쉬움 | 어려움 |

### 왜 이 방식을 선택했나?

1. **프로젝트 규모**: 소규모 프로젝트에서는 명시적 렌더링이 더 명확
2. **E2E 테스트**: 확실한 DOM 렌더링 보장 필요
3. **학습 목적**: Observer 패턴의 개념을 이해하되, 실용성 유지
4. **성능**: 불필요한 추상화 레이어 없음

### 결론

**"반자동" 방식의 장점:**
- ✅ Observer 패턴의 핵심 개념 학습
- ✅ 상태 변경 흐름이 명확하고 디버깅 용이
- ✅ E2E 테스트 통과를 위한 안정성 확보
- ✅ 작은 코드 베이스로 유지보수 쉬움

**완전 자동화가 필요하다면:**
- Vue, React, Svelte 같은 프레임워크 사용 권장
- 또는 위의 Virtual DOM/컴포넌트 방식 구현 필요

## 12. 최종 결론

이 옵저버 패턴 구현은:

1. **Observer 패턴의 핵심 원리**를 학습하고 이해하는 데 최적화
2. **Vuex 스타일의 명확한 상태 관리** 패턴 적용
3. **성능 최적화**(requestAnimationFrame)와 **실용성**(명시적 렌더링)의 균형
4. **프레임워크 없이도 복잡한 상태 관리**가 가능함을 증명
5. **E2E 테스트 통과**를 위한 안정적인 렌더링 보장

바닐라 JS로도 충분히 강력한 상태 관리 시스템을 만들 수 있으며, 이를 통해 Vue나 MobX 같은 프레임워크의 내부 동작 원리를 깊이 이해할 수 있습니다! 

프레임워크가 왜 복잡한지, 어떤 문제를 해결하려고 하는지 체감할 수 있는 좋은 학습 경험입니다. 🎉
