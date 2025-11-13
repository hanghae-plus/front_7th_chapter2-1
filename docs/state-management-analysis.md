# 상태 관리 분석 및 개선 방안

## 현재 상태 객체 분석

### 상태 객체 구성 (24개 속성)

```javascript
const state = {
  // 상품 목록 관련 (10개)
  products: [],              // 상품 목록
  isLoadingProducts: false,  // 초기 로딩 상태
  isLoadingMore: false,      // 추가 로딩 상태
  productsError: null,       // 초기 로딩 에러
  loadMoreError: null,       // 추가 로딩 에러
  limit: DEFAULT_LIMIT,      // 페이지당 상품 수
  currentPage: 0,            // 현재 페이지
  hasMoreProducts: true,     // 더 많은 상품 여부
  sort: DEFAULT_SORT,        // 정렬 기준
  totalProducts: 0,          // 총 상품 수

  // 카테고리 관련 (5개)
  categories: {},            // 카테고리 목록
  categoriesLoaded: false,   // 카테고리 로드 완료 여부
  isLoadingCategories: false, // 카테고리 로딩 상태
  selectedCategory1: null,   // 선택된 1차 카테고리
  selectedCategory2: null,   // 선택된 2차 카테고리

  // 검색 관련 (1개)
  searchTerm: "",            // 검색어

  // URL 관리 관련 (3개)
  urlTouched: false,         // URL 변경 여부
  limitTouched: false,       // limit 변경 여부
  sortTouched: false,        // sort 변경 여부

  // 라우팅 관련 (2개)
  route: null,               // 현재 라우트
  detail: createInitialDetailState(), // 상품 상세 정보

  // 장바구니 관련 (2개)
  isCartOpen: false,         // 장바구니 모달 열림 여부
  cartItems: {},             // 장바구니 아이템
};
```

## 문제점 분석

### 1. 단일 책임 원칙 위반

하나의 상태 객체가 너무 많은 책임을 가지고 있습니다:
- 상품 목록 관리
- 카테고리 관리
- 검색 관리
- 라우팅 관리
- 장바구니 관리
- URL 파라미터 관리

### 2. 상태 그룹화 부족

관련된 상태들이 분산되어 있어 관리가 어렵습니다:

```javascript
// 상품 목록 관련 상태가 10개나 분산되어 있음
products: [],
isLoadingProducts: false,
isLoadingMore: false,
productsError: null,
loadMoreError: null,
limit: DEFAULT_LIMIT,
currentPage: 0,
hasMoreProducts: true,
sort: DEFAULT_SORT,
totalProducts: 0,
```

### 3. 중복된 로딩 상태

비슷한 목적의 로딩 상태가 여러 개 있습니다:
- `isLoadingProducts`: 초기 상품 로딩
- `isLoadingMore`: 추가 상품 로딩
- `isLoadingCategories`: 카테고리 로딩

### 4. 플래그 변수 남용

URL 관련 플래그 변수들이 많습니다:
- `urlTouched`
- `limitTouched`
- `sortTouched`

### 5. 상태 참조 빈도

코드 전체에서 `state` 객체가 **218번** 참조되고 있어, 상태 변경 시 영향을 받는 부분을 파악하기 어렵습니다.

## 왜 이렇게 많은가?

### 1. Vanilla JavaScript의 제약

React나 Vue 같은 프레임워크를 사용하지 않아, 상태 관리가 수동으로 이루어집니다. 이를 위해 모든 상태를 한 곳에 모아두는 것이 일반적인 패턴입니다.

### 2. 기능 추가에 따른 누적

프로젝트가 발전하면서 새로운 기능이 추가될 때마다 상태가 추가되었습니다:
- 초기: 상품 목록만
- 추가: 카테고리 필터링
- 추가: 검색 기능
- 추가: 장바구니
- 추가: URL 파라미터 관리

### 3. 상태 관리 패턴 부재

명확한 상태 관리 패턴이 없어, 필요할 때마다 상태를 추가하는 방식으로 개발되었습니다.

## 개선 방안

### 방안 1: 상태를 기능별로 그룹화

```javascript
const state = {
  // 상품 목록 상태를 하나의 객체로 그룹화
  products: {
    items: [],
    loading: {
      initial: false,
      more: false,
    },
    error: {
      initial: null,
      more: null,
    },
    pagination: {
      currentPage: 0,
      limit: DEFAULT_LIMIT,
      total: 0,
      hasMore: true,
    },
    sort: DEFAULT_SORT,
    filters: {
      category1: null,
      category2: null,
      searchTerm: "",
    },
  },

  // 카테고리 상태 그룹화
  categories: {
    items: {},
    loading: false,
    loaded: false,
  },

  // 라우팅 상태 그룹화
  routing: {
    route: null,
    detail: {
      product: null,
      loading: false,
      error: null,
    },
  },

  // 장바구니 상태 그룹화
  cart: {
    items: {},
    isOpen: false,
  },

  // URL 관리 상태 그룹화
  url: {
    touched: false,
    params: {
      limit: false,
      sort: false,
    },
  },
};
```

**장점**:
- 관련 상태들이 그룹화되어 관리가 쉬움
- 상태 접근이 더 명확해짐 (`state.products.items` vs `state.products`)
- 코드 가독성 향상

**단점**:
- 기존 코드 수정 필요
- 상태 접근 경로가 길어짐

### 방안 2: 상태 관리를 모듈화

```javascript
// state/products.js
export const createProductsState = () => ({
  items: [],
  loading: { initial: false, more: false },
  error: { initial: null, more: null },
  pagination: {
    currentPage: 0,
    limit: DEFAULT_LIMIT,
    total: 0,
    hasMore: true,
  },
  sort: DEFAULT_SORT,
  filters: {
    category1: null,
    category2: null,
    searchTerm: "",
  },
});

// state/categories.js
export const createCategoriesState = () => ({
  items: {},
  loading: false,
  loaded: false,
});

// state/cart.js
export const createCartState = () => ({
  items: {},
  isOpen: false,
});

// state/index.js
import { createProductsState } from './products.js';
import { createCategoriesState } from './categories.js';
import { createCartState } from './cart.js';

export const createState = () => ({
  products: createProductsState(),
  categories: createCategoriesState(),
  cart: createCartState(),
  routing: {
    route: null,
    detail: createInitialDetailState(),
  },
  url: {
    touched: false,
    params: { limit: false, sort: false },
  },
});

const state = createState();
```

**장점**:
- 상태 관리가 모듈화되어 유지보수가 쉬움
- 각 상태 모듈을 독립적으로 테스트 가능
- 코드 재사용성 향상

**단점**:
- 파일 구조 변경 필요
- 초기 구현 비용이 높음

### 방안 3: 상태 관리 라이브러리 도입

```javascript
// 간단한 상태 관리 라이브러리 사용 예제
import { createStore } from './store.js';

const store = createStore({
  products: {
    items: [],
    loading: false,
    // ...
  },
  categories: {
    items: {},
    loading: false,
    // ...
  },
  // ...
});

// 상태 변경 시 자동으로 리렌더링
store.subscribe('products', (products) => {
  renderProductSection();
});
```

**장점**:
- 상태 변경 시 자동 리렌더링
- 상태 관리 로직 중앙화
- 디버깅이 쉬움

**단점**:
- 추가 의존성 필요
- 학습 곡선 존재

### 방안 4: 상태 접근자 함수 생성

```javascript
// 상태 접근자 함수
const getProductsState = () => ({
  items: state.products,
  loading: state.isLoadingProducts,
  loadingMore: state.isLoadingProducts,
  error: state.productsError,
  errorMore: state.loadMoreError,
  pagination: {
    currentPage: state.currentPage,
    limit: state.limit,
    total: state.totalProducts,
    hasMore: state.hasMoreProducts,
  },
  sort: state.sort,
  filters: {
    category1: state.selectedCategory1,
    category2: state.selectedCategory2,
    searchTerm: state.searchTerm,
  },
});

// 상태 변경 함수
const setProductsState = (updates) => {
  if (updates.items !== undefined) state.products = updates.items;
  if (updates.loading?.initial !== undefined) state.isLoadingProducts = updates.loading.initial;
  if (updates.loading?.more !== undefined) state.isLoadingMore = updates.loading.more;
  // ...
  render();
};
```

**장점**:
- 기존 코드 수정 최소화
- 상태 접근이 더 구조화됨
- 점진적 리팩토링 가능

**단점**:
- 추가 추상화 레이어
- 함수 구현 필요

## 권장 개선 방안

### 단계별 개선 전략

#### 1단계: 상태 그룹화 (즉시 적용 가능)

```javascript
const state = {
  // 상품 목록 관련 상태를 객체로 그룹화
  products: {
    items: [],
    loading: {
      initial: false,
      more: false,
    },
    error: {
      initial: null,
      more: null,
    },
    pagination: {
      currentPage: 0,
      limit: DEFAULT_LIMIT,
      total: 0,
      hasMore: true,
    },
    sort: DEFAULT_SORT,
  },

  // 필터 상태 그룹화
  filters: {
    category1: null,
    category2: null,
    searchTerm: "",
  },

  // 카테고리 상태 그룹화
  categories: {
    items: {},
    loading: false,
    loaded: false,
  },

  // 라우팅 상태 그룹화
  routing: {
    route: null,
    detail: createInitialDetailState(),
  },

  // 장바구니 상태 그룹화
  cart: {
    items: {},
    isOpen: false,
  },

  // URL 관리 (플래그 통합)
  url: {
    touched: false,
    touchedParams: new Set(), // limit, sort 등을 Set으로 관리
  },
};
```

#### 2단계: 상태 관리 함수 생성

```javascript
// 상태 관리 유틸리티
const stateManager = {
  // 상품 상태 관리
  products: {
    setItems: (items) => {
      state.products.items = items;
      render();
    },
    setLoading: (type, value) => {
      state.products.loading[type] = value;
      render();
    },
    setError: (type, error) => {
      state.products.error[type] = error;
      render();
    },
    // ...
  },

  // 필터 상태 관리
  filters: {
    setCategory1: (category1) => {
      state.filters.category1 = category1;
      state.filters.category2 = null; // 2차 카테고리 초기화
      render();
    },
    setCategory2: (category2) => {
      state.filters.category2 = category2;
      render();
    },
    setSearchTerm: (searchTerm) => {
      state.filters.searchTerm = searchTerm;
      render();
    },
    reset: () => {
      state.filters.category1 = null;
      state.filters.category2 = null;
      state.filters.searchTerm = "";
      render();
    },
  },
};
```

#### 3단계: 상태 모듈화 (장기적)

상태를 별도 모듈로 분리하여 관리합니다.

## 비교표

| 방안 | 구현 난이도 | 기존 코드 수정 | 유지보수성 | 성능 | 권장도 |
|------|------------|--------------|-----------|------|--------|
| 상태 그룹화 | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 상태 모듈화 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 상태 관리 라이브러리 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 상태 접근자 함수 | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

## 결론

현재 상태 객체가 많은 이유는:
1. **Vanilla JavaScript의 제약**: 프레임워크 없이 상태 관리를 수동으로 처리
2. **기능 추가 누적**: 프로젝트 발전에 따라 상태가 계속 추가됨
3. **상태 관리 패턴 부재**: 명확한 패턴 없이 필요할 때마다 추가

**즉시 적용 가능한 개선 방안**: 상태를 기능별로 그룹화하여 관리하는 것이 가장 효과적입니다. 이를 통해 코드 가독성과 유지보수성을 크게 향상시킬 수 있습니다.



