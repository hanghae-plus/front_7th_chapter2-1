# AppState (애플리케이션 상태 관리) 문서

## 목차

1. [개요](#개요)
2. [AppState 구조](#appstate-구조)
3. [API 연결 방식](#api-연결-방식)
4. [상태 사용 패턴](#상태-사용-패턴)
5. [실제 사용 예제](#실제-사용-예제)
6. [데이터 흐름](#데이터-흐름)

---

## 개요

### AppState란?

**AppState**는 애플리케이션의 **전역 상태를 관리하는 중앙 집중식 상태 객체**입니다. 모든 컴포넌트와 서비스에서 공유되는 데이터를 저장하고 관리합니다.

### 주요 특징

- ✅ **전역 상태 관리**: 애플리케이션 전체에서 공유되는 단일 상태 객체
- ✅ **API 연동**: API 호출 결과를 상태에 저장하고 관리
- ✅ **UI 상태 관리**: 로딩, 에러, 선택 상태 등을 관리
- ✅ **영속성**: 장바구니 데이터는 localStorage에 저장되어 새로고침 후에도 유지

### AppState의 역할

1. **데이터 저장소**: API로부터 받은 데이터 저장
2. **UI 상태 관리**: 로딩, 에러 상태 관리
3. **사용자 입력 관리**: 검색어, 필터, 선택 상태 관리
4. **라우팅 정보 관리**: 현재 라우트 정보 저장

---

## AppState 구조

### 상태 객체 정의

**코드 위치: `src/state/appState.js` (19-43줄)**

```javascript
export const state = {
  // 상품 목록 관련
  products: [], // 상품 목록 배열
  isLoadingProducts: false, // 초기 로딩 상태
  isLoadingMore: false, // 추가 로딩 상태 (무한 스크롤)
  productsError: null, // 상품 로딩 에러
  loadMoreError: null, // 추가 로딩 에러
  limit: DEFAULT_LIMIT, // 페이지당 상품 개수
  currentPage: 0, // 현재 페이지 번호
  hasMoreProducts: true, // 더 불러올 상품이 있는지
  sort: DEFAULT_SORT, // 정렬 옵션
  totalProducts: 0, // 전체 상품 개수

  // 카테고리 관련
  categories: {}, // 카테고리 데이터
  categoriesLoaded: false, // 카테고리 로드 완료 여부
  isLoadingCategories: true, // 카테고리 로딩 상태

  // 라우팅 관련
  route: null, // 현재 라우트 정보

  // 상세 페이지 관련
  detail: createInitialDetailState(), // 상세 페이지 상태

  // 필터링 관련
  selectedCategory1: null, // 선택된 카테고리1
  selectedCategory2: null, // 선택된 카테고리2
  searchTerm: "", // 검색어

  // URL 동기화 관련
  urlTouched: false, // URL이 변경되었는지
  limitTouched: false, // limit이 변경되었는지
  sortTouched: false, // sort가 변경되었는지

  // 장바구니 관련
  isCartOpen: false, // 장바구니 모달 열림 상태
  cartItems: {}, // 장바구니 아이템 (productId를 키로 사용)
};
```

### 상태 초기화

**코드 위치: `src/state/appState.js` (49-52줄)**

```javascript
export function initializeState(route) {
  state.route = route; // 초기 라우트 설정
  state.cartItems = loadCartFromStorage(); // localStorage에서 장바구니 복원
}
```

**호출 위치: `src/main.js` (252줄)**

```javascript
async function main() {
  initializeState(parseRoute()); // 앱 시작 시 상태 초기화
  // ...
}
```

---

## API 연결 방식

### 전체 구조

```
[사용자 액션]
    │
    ▼
[Service Layer]
    │
    ├─ state에서 파라미터 읽기
    │   예: state.selectedCategory1, state.limit
    │
    ├─ API 호출
    │   └─ productApi.js의 함수 호출
    │       └─ fetch() 사용
    │
    ├─ 응답 데이터를 state에 저장
    │   예: state.products = data.products
    │
    └─ 렌더링 콜백 호출
        └─ render() → UI 업데이트
```

### 1. API 레이어 (productApi.js)

**코드 위치: `src/api/productApi.js`**

```javascript
// 상품 목록 조회
export async function getProducts(params = {}) {
  const { limit = 20, search = "", category1 = "", category2 = "", sort = "price_asc" } = params;
  const page = params.current ?? params.page ?? 1;

  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(category1 && { category1 }),
    ...(category2 && { category2 }),
    sort,
  });

  const response = await fetch(`/api/products?${searchParams}`);
  return await response.json();
}

// 상품 상세 조회
export async function getProduct(productId) {
  const response = await fetch(`/api/products/${productId}`);
  return await response.json();
}

// 카테고리 목록 조회
export async function getCategories() {
  const response = await fetch("/api/categories");
  return await response.json();
}
```

**역할:**

- 실제 HTTP 요청 처리
- URL 파라미터 구성
- JSON 응답 반환

### 2. 서비스 레이어 (Service Layer)

서비스 레이어는 **state를 읽고, API를 호출하고, state를 업데이트**하는 역할을 합니다.

#### 2-1. ProductService (상품 관련)

**코드 위치: `src/services/productService.js`**

**주요 함수:**

**`loadProducts()` - 상품 목록 로드**

```javascript
export async function loadProducts({ append = false } = {}, onRender, onShowToast, updateHomeUrlParams) {
  // Step 1: 로딩 상태 설정
  state.isLoadingProducts = true;
  state.productsError = null;
  state.products = [];

  // Step 2: state에서 파라미터 읽기
  const params = {
    limit: state.limit,
    page: state.currentPage + 1,
    sort: state.sort,
    ...(state.selectedCategory1 ? { category1: state.selectedCategory1 } : {}),
    ...(state.selectedCategory2 ? { category2: state.selectedCategory2 } : {}),
    ...(state.searchTerm ? { search: state.searchTerm } : {}),
  };

  // Step 3: API 호출
  const data = await getProducts(params);

  // Step 4: 응답 데이터를 state에 저장
  state.products = data.products;
  state.currentPage = data.pagination.page;
  state.hasMoreProducts = data.pagination.hasNext;
  state.totalProducts = data.pagination.total;

  // Step 5: 로딩 완료
  state.isLoadingProducts = false;

  // Step 6: 렌더링 콜백 호출
  if (onRender) {
    onRender();
  }
}
```

**데이터 흐름:**

```
state.selectedCategory1 = "생활"
    │
    ▼
fetchProductPage()에서 state 읽기
    │
    ▼
getProducts({ category1: "생활", ... }) 호출
    │
    ▼
API 응답: { products: [...], pagination: {...} }
    │
    ▼
state.products = 응답 데이터 저장
    │
    ▼
render() 호출 → UI 업데이트
```

**`loadProductDetail()` - 상품 상세 로드**

```javascript
export async function loadProductDetail(productId, onRender, onShowToast) {
  // Step 1: 로딩 상태 설정
  state.detail.isLoading = true;
  state.detail.error = null;

  // Step 2: API 호출
  const product = await getProduct(productId);

  // Step 3: 관련 상품 로드 (state.detail.product의 카테고리 사용)
  if (product.category1) {
    const relatedResponse = await getProducts({
      limit: 12,
      category1: product.category1,
      category2: product.category2,
    });
    const relatedProducts = relatedResponse.products.filter((item) => item.productId !== product.productId).slice(0, 4);
  }

  // Step 4: 응답 데이터를 state에 저장
  state.detail.product = {
    ...product,
    relatedProducts,
  };

  // Step 5: 로딩 완료
  state.detail.isLoading = false;

  // Step 6: 렌더링 콜백 호출
  if (onRender) {
    onRender();
  }
}
```

#### 2-2. CategoryService (카테고리 관련)

**코드 위치: `src/services/categoryService.js`**

**`ensureCategoriesLoaded()` - 카테고리 로드**

```javascript
export async function ensureCategoriesLoaded(onRender, onShowToast) {
  // 이미 로드되었으면 다시 로드하지 않음
  if (state.categoriesLoaded) {
    state.isLoadingCategories = false;
    return;
  }

  // Step 1: 로딩 상태 설정
  state.isLoadingCategories = true;

  // Step 2: API 호출
  const categories = await getCategories();

  // Step 3: 응답 데이터를 state에 저장
  state.categories = categories ?? {};
  state.categoriesLoaded = true;

  // Step 4: 로딩 완료
  state.isLoadingCategories = false;

  // Step 5: 렌더링 콜백 호출
  if (onRender) {
    onRender();
  }
}
```

**`handleCategory1Select()` - 카테고리 선택**

```javascript
export function handleCategory1Select(category1, onUpdateUI, onLoadProducts) {
  // Step 1: state 업데이트
  state.selectedCategory1 = category1;
  state.selectedCategory2 = null;
  state.currentPage = 0;
  state.products = []; // 기존 상품 목록 초기화

  // Step 2: UI 업데이트
  if (onUpdateUI) {
    onUpdateUI();
  }

  // Step 3: 새로운 카테고리로 상품 로드
  if (onLoadProducts) {
    onLoadProducts(); // 내부에서 state.selectedCategory1을 읽어서 API 호출
  }
}
```

#### 2-3. CartService (장바구니 관련)

**코드 위치: `src/services/cartService.js`**

**`handleAddToCart()` - 장바구니에 상품 추가**

```javascript
export function handleAddToCart(productId, quantity, onUpdateBadge, onShowToast) {
  // Step 1: state에서 상품 정보 찾기
  const product = findProductForCart(productId);
  // findProductForCart()는 다음 순서로 찾음:
  // 1. state.products (상품 목록)
  // 2. state.detail.product (상세 페이지)
  // 3. state.cartItems[productId] (기존 장바구니)

  // Step 2: state.cartItems에 추가/업데이트
  if (!state.cartItems[productId]) {
    state.cartItems[productId] = {
      product: { productId, title: product.title, ... },
      quantity: 0,
      selected: false,
    };
  }
  state.cartItems[productId].quantity += quantity;

  // Step 3: localStorage에 저장
  saveCartToStorage(state.cartItems);

  // Step 4: UI 업데이트
  if (onUpdateBadge) {
    onUpdateBadge();
  }
}
```

**`getCartSummary()` - 장바구니 요약 정보**

```javascript
export function getCartSummary() {
  const items = Object.values(state.cartItems ?? {});
  const totalCount = items.length;
  const totalPrice = items.reduce((sum, item) => sum + (Number(item?.product?.lprice) || 0) * (item?.quantity ?? 0), 0);
  const selectedItems = items.filter((item) => item?.selected);
  const selectedCount = selectedItems.length;
  const selectedPrice = selectedItems.reduce(
    (sum, item) => sum + (Number(item?.product?.lprice) || 0) * (item?.quantity ?? 0),
    0,
  );
  return { items, totalCount, totalPrice, selectedCount, selectedPrice };
}
```

---

## 상태 사용 패턴

### 패턴 1: API 호출 전 state 읽기

**예시: 상품 목록 로드**

```javascript
// src/services/productService.js (54-77줄)
export async function fetchProductPage(page) {
  // state에서 파라미터 읽기
  const params = {
    limit: state.limit, // state에서 읽기
    page,
    sort: state.sort, // state에서 읽기
    ...(state.selectedCategory1 ? { category1: state.selectedCategory1 } : {}), // state에서 읽기
    ...(state.selectedCategory2 ? { category2: state.selectedCategory2 } : {}), // state에서 읽기
    ...(state.searchTerm ? { search: state.searchTerm } : {}), // state에서 읽기
  };

  // API 호출
  const result = await getProducts(params);
  return result;
}
```

### 패턴 2: API 응답을 state에 저장

**예시: 상품 목록 응답 처리**

```javascript
// src/services/productService.js (87-118줄)
export function applyProductResponse(data, { append, requestedPage }, updateHomeUrlParams) {
  const incomingProducts = data?.products ?? [];

  // state에 응답 데이터 저장
  state.products = append
    ? [...state.products, ...incomingProducts] // 추가 모드: 기존 배열에 추가
    : incomingProducts; // 초기 로드: 새 배열로 교체

  state.currentPage = data?.pagination?.page ?? requestedPage;
  state.hasMoreProducts = data?.pagination?.hasNext ?? false;
  state.totalProducts = data?.pagination?.total ?? 0;
}
```

### 패턴 3: state 변경 후 렌더링

**예시: 로딩 완료 후 렌더링**

```javascript
// src/services/productService.js (138-148줄)
export function finishLoad(append, onRender) {
  // 로딩 상태 업데이트
  if (append) {
    state.isLoadingMore = false;
  } else {
    state.isLoadingProducts = false;
  }

  // 렌더링 콜백 호출
  if (onRender) {
    onRender(); // render() 함수 호출 → state를 읽어서 UI 업데이트
  }
}
```

### 패턴 4: state 기반 조건부 로직

**예시: 라우트 확인 후 처리**

```javascript
// src/services/productService.js (158-161줄)
export async function loadProducts({ append = false } = {}, onRender, onShowToast, updateHomeUrlParams) {
  // state.route를 확인하여 홈 페이지에서만 실행
  if (state.route?.name !== "home") {
    return;
  }
  // ...
}
```

---

## 실제 사용 예제

### 예제 1: 상품 목록 로드 전체 흐름

**코드 위치: `src/main.js` (247줄)**

```javascript
await loadProductsService({ append: false }, render, () => showToast(errorAlert), updateHomeUrlParams);
```

**전체 흐름:**

```
1. loadProductsService() 호출
    │
    ├─ startInitialLoad()
    │   ├─ state.isLoadingProducts = true
    │   ├─ state.products = []
    │   └─ render() 호출 (로딩 상태 표시)
    │
    ├─ fetchProductPage()
    │   ├─ state에서 파라미터 읽기
    │   │   - state.limit
    │   │   - state.sort
    │   │   - state.selectedCategory1
    │   │   - state.selectedCategory2
    │   │   - state.searchTerm
    │   │
    │   └─ getProducts(params) 호출
    │       └─ fetch("/api/products?...") 실행
    │
    ├─ applyProductResponse()
    │   ├─ state.products = 응답 데이터
    │   ├─ state.currentPage = 응답 페이지
    │   ├─ state.hasMoreProducts = 응답 hasNext
    │   └─ state.totalProducts = 응답 total
    │
    └─ finishLoad()
        ├─ state.isLoadingProducts = false
        └─ render() 호출 (상품 목록 표시)
```

### 예제 2: 카테고리 선택 후 상품 필터링

**코드 위치: `src/services/categoryService.js` (53-84줄)**

```javascript
export function handleCategory1Select(category1, onUpdateUI, onLoadProducts) {
  // Step 1: state 업데이트
  state.selectedCategory1 = category1;
  state.selectedCategory2 = null;
  state.currentPage = 0;
  state.products = [];

  // Step 2: UI 즉시 업데이트 (브레드크럼, 카테고리 버튼)
  if (onUpdateUI) {
    onUpdateUI();
  }

  // Step 3: 새로운 카테고리로 상품 로드
  if (onLoadProducts) {
    onLoadProducts();
    // 내부에서 loadProductsService() 호출
    // → fetchProductPage()에서 state.selectedCategory1 읽기
    // → API 호출: getProducts({ category1: "생활", ... })
    // → state.products에 필터링된 상품 저장
    // → render() 호출
  }
}
```

**데이터 흐름:**

```
사용자가 카테고리 버튼 클릭
    │
    ▼
handleCategory1Select("생활", ...)
    │
    ├─ state.selectedCategory1 = "생활"
    │
    ├─ onUpdateUI() → 브레드크럼 업데이트
    │
    └─ onLoadProducts()
        │
        ▼
loadProductsService()
    │
    ├─ fetchProductPage()
    │   └─ state.selectedCategory1 읽기 → "생활"
    │
    ├─ getProducts({ category1: "생활", ... })
    │   └─ fetch("/api/products?category1=생활&...")
    │
    ├─ 응답: { products: [필터링된 상품들], ... }
    │
    ├─ state.products = 필터링된 상품들
    │
    └─ render() → 필터링된 상품 목록 표시
```

### 예제 3: 장바구니에 상품 추가

**코드 위치: `src/services/cartService.js` (73-111줄)**

```javascript
export function handleAddToCart(productId, quantity, onUpdateBadge, onShowToast) {
  // Step 1: state에서 상품 정보 찾기
  const product = findProductForCart(productId);
  // findProductForCart()는 다음 순서로 찾음:
  // 1. state.products.find(...)  // 상품 목록에서 찾기
  // 2. state.detail.product       // 상세 페이지에서 찾기
  // 3. state.cartItems[productId] // 기존 장바구니에서 찾기

  // Step 2: state.cartItems에 추가/업데이트
  if (!state.cartItems[productId]) {
    state.cartItems[productId] = {
      product: { productId, title: product.title, image: product.image, lprice: product.lprice },
      quantity: 0,
      selected: false,
    };
  }
  state.cartItems[productId].quantity += quantity;

  // Step 3: localStorage에 저장 (영속성)
  saveCartToStorage(state.cartItems);

  // Step 4: UI 업데이트
  if (onUpdateBadge) {
    onUpdateBadge(); // 장바구니 배지 업데이트
  }
}
```

**데이터 흐름:**

```
사용자가 "장바구니 담기" 버튼 클릭
    │
    ▼
handleAddToCart("85067212996", 2, ...)
    │
    ├─ findProductForCart("85067212996")
    │   ├─ state.products에서 찾기
    │   └─ 찾은 상품: { productId: "85067212996", title: "...", lprice: 220 }
    │
    ├─ state.cartItems["85067212996"] = {
    │     product: { productId: "85067212996", ... },
    │     quantity: 2,
    │     selected: false
    │   }
    │
    ├─ saveCartToStorage(state.cartItems)
    │   └─ localStorage.setItem("cart", JSON.stringify(state.cartItems))
    │
    └─ onUpdateBadge()
        └─ 장바구니 배지에 "1" 표시
```

### 예제 4: 상품 상세 페이지 로드

**코드 위치: `src/services/productService.js` (190-241줄)**

```javascript
export async function loadProductDetail(productId, onRender, onShowToast) {
  // Step 1: 로딩 상태 설정
  state.detail = createInitialDetailState();
  state.detail.isLoading = true;
  if (onRender) {
    onRender(); // 로딩 화면 표시
  }

  // Step 2: API 호출
  const product = await getProduct(productId);

  // Step 3: 관련 상품 로드 (state.detail.product의 카테고리 사용)
  if (product.category1) {
    const relatedResponse = await getProducts({
      limit: 12,
      category1: product.category1,
      category2: product.category2,
    });
    const relatedProducts = relatedResponse.products.filter((item) => item.productId !== product.productId).slice(0, 4);
  }

  // Step 4: state에 저장
  state.detail.product = {
    ...product,
    relatedProducts,
  };

  // Step 5: 로딩 완료
  state.detail.isLoading = false;
  if (onRender) {
    onRender(); // 상세 페이지 표시
  }
}
```

**데이터 흐름:**

```
사용자가 상품 카드 클릭
    │
    ▼
loadProductDetail("85067212996", render, ...)
    │
    ├─ state.detail.isLoading = true
    ├─ render() → 로딩 화면 표시
    │
    ├─ getProduct("85067212996")
    │   └─ fetch("/api/products/85067212996")
    │
    ├─ 응답: { productId: "85067212996", title: "...", category1: "생활", ... }
    │
    ├─ getProducts({ category1: "생활", category2: "생활용품" })
    │   └─ 관련 상품 로드
    │
    ├─ state.detail.product = {
    │     ...product,
    │     relatedProducts: [...]
    │   }
    │
    ├─ state.detail.isLoading = false
    │
    └─ render() → 상세 페이지 표시
```

---

## 데이터 흐름

### 전체 데이터 흐름도

```
[사용자 액션]
    │
    ▼
[Handler Layer]
    │
    ├─ 이벤트 처리
    │   예: handleCategory1Select()
    │
    └─ Service Layer 호출
        │
        ▼
[Service Layer]
    │
    ├─ state에서 파라미터 읽기
    │   예: state.selectedCategory1
    │
    ├─ API Layer 호출
    │   └─ productApi.js
    │       └─ fetch() 실행
    │
    ├─ 응답 데이터를 state에 저장
    │   예: state.products = 응답 데이터
    │
    └─ 렌더링 콜백 호출
        │
        ▼
[Renderer Layer]
    │
    ├─ state에서 데이터 읽기
    │   예: state.products, state.isLoadingProducts
    │
    └─ DOM 조작
        └─ UI 업데이트
```

### 구체적인 예시: 카테고리 선택 → 상품 필터링

```
[1. 사용자 액션]
사용자가 "생활" 카테고리 버튼 클릭
    │
    ▼
[2. Handler Layer]
handleCategory1Select("생활", ...)
    │
    ├─ state.selectedCategory1 = "생활"
    │
    └─ onLoadProducts() 호출
        │
        ▼
[3. Service Layer]
loadProductsService()
    │
    ├─ startInitialLoad()
    │   ├─ state.isLoadingProducts = true
    │   └─ render() → 로딩 상태 표시
    │
    ├─ fetchProductPage()
    │   └─ state에서 파라미터 읽기
    │       - state.selectedCategory1 = "생활"
    │       - state.limit = 20
    │       - state.sort = "price_asc"
    │
    ├─ getProducts({ category1: "생활", limit: 20, ... })
    │   └─ fetch("/api/products?category1=생활&limit=20&...")
    │
    ├─ 응답: { products: [...], pagination: {...} }
    │
    ├─ applyProductResponse()
    │   ├─ state.products = 필터링된 상품들
    │   ├─ state.currentPage = 1
    │   └─ state.hasMoreProducts = true
    │
    └─ finishLoad()
        ├─ state.isLoadingProducts = false
        └─ render() 호출
            │
            ▼
[4. Renderer Layer]
render()
    │
    ├─ state.products 읽기
    │   └─ 필터링된 상품 배열
    │
    ├─ state.isLoadingProducts 읽기
    │   └─ false
    │
    └─ DOM 조작
        └─ 필터링된 상품 목록 표시
```

---

## 핵심 개념 정리

### 1. 단방향 데이터 흐름

```
state (데이터 소스)
    │
    ▼
Service Layer (비즈니스 로직)
    │
    ├─ state 읽기
    ├─ API 호출
    └─ state 업데이트
        │
        ▼
Renderer Layer (UI)
    │
    └─ state 읽기 → DOM 업데이트
```

### 2. state는 단일 진실 공급원 (Single Source of Truth)

- 모든 데이터는 `state` 객체에 저장
- API 응답은 `state`에 저장 후 UI에 반영
- 여러 곳에서 같은 데이터를 참조할 때 `state`를 사용

### 3. state 업데이트 패턴

**패턴 1: 직접 할당**

```javascript
state.selectedCategory1 = "생활";
state.products = [...];
```

**패턴 2: 객체 병합**

```javascript
state.detail.product = {
  ...product,
  relatedProducts,
};
```

**패턴 3: 배열 추가**

```javascript
state.products = append ? [...state.products, ...incomingProducts] : incomingProducts;
```

### 4. state와 localStorage 연동

**장바구니 데이터 영속성:**

```javascript
// 저장
saveCartToStorage(state.cartItems);
// → localStorage.setItem("cart", JSON.stringify(state.cartItems))

// 복원
state.cartItems = loadCartFromStorage();
// → JSON.parse(localStorage.getItem("cart") || "{}")
```

---

## 코드 참조 가이드

### AppState 관련 파일

- **상태 정의**: `src/state/appState.js`
- **상태 초기화**: `src/main.js` (252줄)

### Service Layer 파일

- **상품 서비스**: `src/services/productService.js`
- **카테고리 서비스**: `src/services/categoryService.js`
- **장바구니 서비스**: `src/services/cartService.js`
- **URL 서비스**: `src/services/urlService.js`

### API Layer 파일

- **API 함수**: `src/api/productApi.js`

### Storage 관련 파일

- **로컬 스토리지**: `src/utils/storage.js`

---

## 마무리

**AppState는:**

- ✅ 애플리케이션의 전역 상태를 중앙에서 관리
- ✅ API 호출 결과를 저장하고 관리
- ✅ UI 상태(로딩, 에러)를 관리
- ✅ 사용자 입력(검색어, 필터)을 관리
- ✅ 장바구니 데이터를 영속화

**AppState 사용 시 주의사항:**

- ⚠️ state는 직접 수정 가능 (불변성 관리 필요 시 개선 가능)
- ⚠️ state 변경 후 반드시 렌더링 콜백 호출 필요
- ⚠️ state의 구조가 변경되면 모든 참조 위치 확인 필요

---

**작성일**: 2025-01-XX  
**버전**: 1.0.0  
**작성자**: AI Assistant
