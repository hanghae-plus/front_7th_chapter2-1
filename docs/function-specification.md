# 함수 명세서

이 문서는 프로젝트에서 사용 중인 모든 함수들을 정리하고, React의 `useState`와 유사한 기능을 구현할 수 있는지에 대한 분석을 제공합니다.

## 목차

1. [프로젝트 함수 목록](#프로젝트-함수-목록)
2. [React useState와 유사한 기능 구현 가능성](#react-usestate와-유사한-기능-구현-가능성)
3. [useState 구현 예제](#usestate-구현-예제)

---

## 프로젝트 함수 목록

### 1. 상태 관리 함수

#### `createInitialDetailState()`

- **위치**: `src/main.js`
- **설명**: 상품 상세 페이지의 초기 상태를 생성하는 함수
- **반환값**: `{ isLoading: false, error: null, product: null }`

#### `loadCartFromStorage()`

- **위치**: `src/main.js`
- **설명**: localStorage에서 장바구니 데이터를 로드하는 함수
- **반환값**: 장바구니 아이템 객체

#### `saveCartToStorage()`

- **위치**: `src/main.js`
- **설명**: 장바구니 데이터를 localStorage에 저장하는 함수
- **반환값**: 없음

### 2. 렌더링 함수

#### `render()`

- **위치**: `src/main.js`
- **설명**: 현재 라우트에 따라 적절한 뷰를 렌더링하는 메인 렌더링 함수
- **역할**: 상태 변경 시 DOM을 업데이트

#### `renderDetailView(root)`

- **위치**: `src/main.js`
- **설명**: 상품 상세 페이지를 렌더링하는 함수
- **파라미터**: `root` - 루트 DOM 요소

#### `renderHomeView(root)`

- **위치**: `src/main.js`
- **설명**: 홈 페이지를 렌더링하는 함수
- **파라미터**: `root` - 루트 DOM 요소

#### `renderNotFound(root)`

- **위치**: `src/main.js`
- **설명**: 404 페이지를 렌더링하는 함수
- **파라미터**: `root` - 루트 DOM 요소

#### `initializeSearchSection()`

- **위치**: `src/main.js`
- **설명**: 검색 섹션을 초기화하고 이벤트 리스너를 연결하는 함수

#### `updateSearchUI()`

- **위치**: `src/main.js`
- **설명**: 검색 UI를 상태에 맞게 업데이트하는 함수

#### `renderProductSection()`

- **위치**: `src/main.js`
- **설명**: 상품 목록 섹션을 렌더링하는 함수

#### `renderCartModal()`

- **위치**: `src/main.js`
- **설명**: 장바구니 모달을 렌더링하는 함수

#### `updateCartModalSelection()`

- **위치**: `src/main.js`
- **설명**: 장바구니 모달의 선택 상태를 업데이트하는 함수

### 3. API 함수

#### `getProducts(params)`

- **위치**: `src/api/productApi.js`
- **설명**: 상품 목록을 조회하는 비동기 함수
- **파라미터**:
  - `limit`: 페이지당 상품 수
  - `search`: 검색어
  - `category1`: 1차 카테고리
  - `category2`: 2차 카테고리
  - `sort`: 정렬 기준
  - `page`: 페이지 번호
- **반환값**: 상품 목록과 페이지네이션 정보

#### `getProduct(productId)`

- **위치**: `src/api/productApi.js`
- **설명**: 특정 상품의 상세 정보를 조회하는 비동기 함수
- **파라미터**: `productId` - 상품 ID
- **반환값**: 상품 상세 정보

#### `getCategories()`

- **위치**: `src/api/productApi.js`
- **설명**: 카테고리 목록을 조회하는 비동기 함수
- **반환값**: 카테고리 목록

### 4. 이벤트 핸들러 함수

#### `handleCategoryBreadcrumbClick(event)`

- **위치**: `src/main.js`
- **설명**: 카테고리 브레드크럼 클릭 이벤트를 처리하는 함수

#### `handleCategoryButtonsClick(event)`

- **위치**: `src/main.js`
- **설명**: 카테고리 버튼 클릭 이벤트를 처리하는 함수

#### `handleCategory1Select(event)`

- **위치**: `src/main.js`
- **설명**: 1차 카테고리 선택 이벤트를 처리하는 함수

#### `handleCategory2Select(event)`

- **위치**: `src/main.js`
- **설명**: 2차 카테고리 선택 이벤트를 처리하는 함수

#### `handleCategoryReset(event)`

- **위치**: `src/main.js`
- **설명**: 카테고리 리셋 이벤트를 처리하는 함수

#### `handleCategoryBreadcrumb(event)`

- **위치**: `src/main.js`
- **설명**: 카테고리 브레드크럼 이벤트를 처리하는 함수

#### `selectLimit(event)`

- **위치**: `src/main.js`
- **설명**: 상품 개수 선택 이벤트를 처리하는 함수

#### `selectSort(event)`

- **위치**: `src/main.js`
- **설명**: 정렬 기준 선택 이벤트를 처리하는 함수

#### `handleSearchInputKeyDown(event)`

- **위치**: `src/main.js`
- **설명**: 검색 입력 필드 키다운 이벤트를 처리하는 함수

#### `handleProductCardClick(event)`

- **위치**: `src/main.js`
- **설명**: 상품 카드 클릭 이벤트를 처리하는 함수

#### `handleAddToCart(productId, quantity)`

- **위치**: `src/main.js`
- **설명**: 장바구니에 상품을 추가하는 함수
- **파라미터**:
  - `productId`: 상품 ID
  - `quantity`: 수량

#### `handleCartIconClick(event)`

- **위치**: `src/main.js`
- **설명**: 장바구니 아이콘 클릭 이벤트를 처리하는 함수

#### `handleCartModalClick(event)`

- **위치**: `src/main.js`
- **설명**: 장바구니 모달 클릭 이벤트를 처리하는 함수

#### `handleCartModalChange(event)`

- **위치**: `src/main.js`
- **설명**: 장바구니 모달 변경 이벤트를 처리하는 함수

#### `handleCartCheckboxToggle(checkbox)`

- **위치**: `src/main.js`
- **설명**: 장바구니 체크박스 토글 이벤트를 처리하는 함수

#### `handleCartSelectAllChange(checked)`

- **위치**: `src/main.js`
- **설명**: 장바구니 전체 선택 변경 이벤트를 처리하는 함수

#### `handleDetailBreadcrumbClick(event)`

- **위치**: `src/main.js`
- **설명**: 상품 상세 페이지 브레드크럼 클릭 이벤트를 처리하는 함수

### 5. 라우팅 함수

#### `parseRoute()`

- **위치**: `src/main.js`
- **설명**: 현재 URL을 파싱하여 라우트 정보를 반환하는 함수
- **반환값**: `{ name: string, params?: object }`

#### `buildUrl(path)`

- **위치**: `src/main.js`
- **설명**: 기본 경로를 포함한 URL을 생성하는 함수
- **파라미터**: `path` - 경로 문자열
- **반환값**: URL 객체

#### `navigateToDetail(productId)`

- **위치**: `src/main.js`
- **설명**: 상품 상세 페이지로 이동하는 함수
- **파라미터**: `productId` - 상품 ID

#### `navigateToHome(options)`

- **위치**: `src/main.js`
- **설명**: 홈 페이지로 이동하는 함수
- **파라미터**:
  - `replace`: 히스토리 교체 여부
  - `category1`: 1차 카테고리
  - `category2`: 2차 카테고리
  - `current`: 현재 페이지
  - `search`: 검색어

#### `handleRouteChange()`

- **위치**: `src/main.js`
- **설명**: 라우트 변경 이벤트를 처리하는 비동기 함수

### 6. 데이터 로딩 함수

#### `loadProducts(options)`

- **위치**: `src/main.js`
- **설명**: 상품 목록을 로드하는 비동기 함수
- **파라미터**: `{ append: boolean }` - 추가 로드 여부

#### `startInitialLoad()`

- **위치**: `src/main.js`
- **설명**: 초기 상품 로딩을 시작하는 함수
- **반환값**: `{ nextPage: number }` 또는 `null`

#### `startAppendLoad()`

- **위치**: `src/main.js`
- **설명**: 추가 상품 로딩을 시작하는 함수
- **반환값**: `{ nextPage: number }` 또는 `null`

#### `fetchProductPage(page)`

- **위치**: `src/main.js`
- **설명**: 특정 페이지의 상품 데이터를 가져오는 비동기 함수
- **파라미터**: `page` - 페이지 번호
- **반환값**: 상품 목록과 페이지네이션 정보

#### `applyProductResponse(data, options)`

- **위치**: `src/main.js`
- **설명**: API 응답 데이터를 상태에 적용하는 함수
- **파라미터**:
  - `data`: API 응답 데이터
  - `options`: `{ append: boolean, requestedPage: number }`

#### `handleLoadError(append)`

- **위치**: `src/main.js`
- **설명**: 로딩 에러를 처리하는 함수
- **파라미터**: `append` - 추가 로드 여부

#### `finishLoad(append)`

- **위치**: `src/main.js`
- **설명**: 로딩을 완료하고 렌더링을 트리거하는 함수
- **파라미터**: `append` - 추가 로드 여부

#### `loadProductDetail(productId)`

- **위치**: `src/main.js`
- **설명**: 상품 상세 정보를 로드하는 비동기 함수
- **파라미터**: `productId` - 상품 ID

#### `ensureCategoriesLoaded()`

- **위치**: `src/main.js`
- **설명**: 카테고리 목록이 로드되었는지 확인하고 로드하는 비동기 함수

### 7. 무한 스크롤 함수

#### `setupLoadMoreObserver(rootElement)`

- **위치**: `src/main.js`
- **설명**: 무한 스크롤을 위한 IntersectionObserver를 설정하는 함수
- **파라미터**: `rootElement` - 루트 DOM 요소

#### `disconnectLoadMoreObserver()`

- **위치**: `src/main.js`
- **설명**: IntersectionObserver를 해제하는 함수

### 8. 장바구니 함수

#### `openCartModal()`

- **위치**: `src/main.js`
- **설명**: 장바구니 모달을 열는 함수

#### `closeCartModal()`

- **위치**: `src/main.js`
- **설명**: 장바구니 모달을 닫는 함수

#### `getCartItemsArray()`

- **위치**: `src/main.js`
- **설명**: 장바구니 아이템을 배열로 반환하는 함수
- **반환값**: 장바구니 아이템 배열

#### `getCartSummary()`

- **위치**: `src/main.js`
- **설명**: 장바구니 요약 정보를 반환하는 함수
- **반환값**: `{ items, totalCount, totalPrice, selectedCount, selectedPrice }`

#### `updateCartBadge(providedCount)`

- **위치**: `src/main.js`
- **설명**: 장바구니 배지의 개수를 업데이트하는 함수
- **파라미터**: `providedCount` - 개수 (선택사항)

#### `incrementCartItem(productId)`

- **위치**: `src/main.js`
- **설명**: 장바구니 아이템의 수량을 증가시키는 함수
- **파라미터**: `productId` - 상품 ID

#### `decrementCartItem(productId)`

- **위치**: `src/main.js`
- **설명**: 장바구니 아이템의 수량을 감소시키는 함수
- **파라미터**: `productId` - 상품 ID

#### `removeCartItem(productId)`

- **위치**: `src/main.js`
- **설명**: 장바구니에서 아이템을 제거하는 함수
- **파라미터**: `productId` - 상품 ID

#### `removeCartItemFromModal(productId)`

- **위치**: `src/main.js`
- **설명**: 모달에서 장바구니 아이템을 제거하는 함수
- **파라미터**: `productId` - 상품 ID

#### `removeSelectedCartItems()`

- **위치**: `src/main.js`
- **설명**: 선택된 장바구니 아이템들을 제거하는 함수

#### `clearCartItems()`

- **위치**: `src/main.js`
- **설명**: 장바구니의 모든 아이템을 제거하는 함수

#### `checkoutCart()`

- **위치**: `src/main.js`
- **설명**: 장바구니 결제를 처리하는 함수 (모의 구현)

#### `updateCartItemQuantity(productId)`

- **위치**: `src/main.js`
- **설명**: 장바구니 아이템의 수량을 업데이트하는 함수
- **파라미터**: `productId` - 상품 ID

#### `findProductForCart(productId)`

- **위치**: `src/main.js`
- **설명**: 장바구니에 추가할 상품 정보를 찾는 함수
- **파라미터**: `productId` - 상품 ID
- **반환값**: 상품 정보 객체

### 9. URL 파라미터 관리 함수

#### `applyHomeQueryParams()`

- **위치**: `src/main.js`
- **설명**: URL 쿼리 파라미터를 상태에 적용하는 함수

#### `resolveHomeParams(overrides)`

- **위치**: `src/main.js`
- **설명**: 홈 페이지 파라미터를 해석하는 함수
- **파라미터**: `overrides` - 덮어쓸 파라미터
- **반환값**: 해석된 파라미터 객체

#### `createHomeSearchParams(params)`

- **위치**: `src/main.js`
- **설명**: 홈 페이지 URLSearchParams를 생성하는 함수
- **파라미터**: 파라미터 객체
- **반환값**: URLSearchParams 객체

#### `buildHomeParams(overrides)`

- **위치**: `src/main.js`
- **설명**: 홈 페이지 파라미터를 빌드하는 함수
- **파라미터**: `overrides` - 덮어쓸 파라미터
- **반환값**: URLSearchParams 객체

#### `updateHomeUrlParams(overrides)`

- **위치**: `src/main.js`
- **설명**: 홈 페이지 URL 파라미터를 업데이트하는 함수
- **파라미터**: `overrides` - 덮어쓸 파라미터

#### `buildHomeUrlWithParams(overrides)`

- **위치**: `src/main.js`
- **설명**: 홈 페이지 URL을 파라미터와 함께 생성하는 함수
- **파라미터**: `overrides` - 덮어쓸 파라미터
- **반환값**: URL 객체

#### `resetFilters(options)`

- **위치**: `src/main.js`
- **설명**: 필터를 리셋하는 함수
- **파라미터**: `{ updateUrl: boolean }` - URL 업데이트 여부

### 10. 유틸리티 함수

#### `adjustQuantity(input, delta)`

- **위치**: `src/main.js`
- **설명**: 수량 입력 필드의 값을 조정하는 함수
- **파라미터**:
  - `input`: 입력 요소
  - `delta`: 변경량

#### `normalizeQuantityInput(input)`

- **위치**: `src/main.js`
- **설명**: 수량 입력 필드의 값을 정규화하는 함수
- **파라미터**: `input` - 입력 요소

#### `handleCartKeydown(event)`

- **위치**: `src/main.js`
- **설명**: 장바구니 키다운 이벤트를 처리하는 함수 (Escape 키)

#### `attachCartEscapeListener()`

- **위치**: `src/main.js`
- **설명**: 장바구니 Escape 키 리스너를 연결하는 함수

#### `detachCartEscapeListener()`

- **위치**: `src/main.js`
- **설명**: 장바구니 Escape 키 리스너를 해제하는 함수

#### `attachCartModalEvents(container)`

- **위치**: `src/main.js`
- **설명**: 장바구니 모달 이벤트 리스너를 연결하는 함수
- **파라미터**: `container` - 컨테이너 DOM 요소

#### `attachDetailEvents(root)`

- **위치**: `src/main.js`
- **설명**: 상품 상세 페이지 이벤트 리스너를 연결하는 함수
- **파라미터**: `root` - 루트 DOM 요소

#### `attachHeaderNavigation(root)`

- **위치**: `src/main.js`
- **설명**: 헤더 네비게이션 이벤트 리스너를 연결하는 함수
- **파라미터**: `root` - 루트 DOM 요소

### 11. 컴포넌트 함수

#### `Home()`

- **위치**: `src/pages/home.js`
- **설명**: 홈 페이지 컴포넌트 함수
- **반환값**: HTML 문자열

#### `Detail(props)`

- **위치**: `src/pages/detail.js`
- **설명**: 상품 상세 페이지 컴포넌트 함수
- **파라미터**: `{ navProps, contentProps, bottom }`
- **반환값**: HTML 문자열

#### `error404()`

- **위치**: `src/pages/404.js`
- **설명**: 404 페이지 컴포넌트 함수
- **반환값**: HTML 문자열

#### `Layout(props)`

- **위치**: `src/components/layout/Layout.js`
- **설명**: 레이아웃 컴포넌트 함수
- **파라미터**: `{ top, main, bottom, headerProps }`
- **반환값**: HTML 문자열

#### `Header(props)`

- **위치**: `src/components/layout/Header.js`
- **설명**: 헤더 컴포넌트 함수
- **파라미터**: `{ showBack }`
- **반환값**: HTML 문자열

#### `Footer()`

- **위치**: `src/components/layout/Footer.js`
- **설명**: 푸터 컴포넌트 함수
- **반환값**: HTML 문자열

#### `ItemList(props)`

- **위치**: `src/components/ItemList.js`
- **설명**: 상품 목록 컴포넌트 함수
- **파라미터**: `{ loading, loadingMore, products, error, hasMore, loadMoreError, totalCount }`
- **반환값**: HTML 문자열

#### `Cart(props)`

- **위치**: `src/components/cart/Cart.js`
- **설명**: 장바구니 컴포넌트 함수
- **파라미터**: `{ items, totalCount, totalPrice, selectedCount, selectedPrice }`
- **반환값**: HTML 문자열

#### `Search(props)`

- **위치**: `src/components/search/Search.js`
- **설명**: 검색 컴포넌트 함수
- **파라미터**: `{ loading, limit, sort, selectedCategory1, selectedCategory2, categories }`
- **반환값**: HTML 문자열

#### `updateCategoryBreadcrumb(props)`

- **위치**: `src/components/search/Search.js`
- **설명**: 카테고리 브레드크럼을 업데이트하는 함수
- **파라미터**: `{ selectedCategory1, selectedCategory2 }`
- **반환값**: HTML 문자열

#### `updateCategoryButtons(props)`

- **위치**: `src/components/search/Search.js`
- **설명**: 카테고리 버튼을 업데이트하는 함수
- **파라미터**: `{ categories, selectedCategory1, selectedCategory2, loading }`
- **반환값**: HTML 문자열

#### `SearchFirstDepth(props)`

- **위치**: `src/components/search/SearchFirstDepth.js`
- **설명**: 1차 카테고리 검색 컴포넌트 함수
- **파라미터**: `{ category1, category2List }`
- **반환값**: HTML 문자열

#### `SearchTwoDepth(props)`

- **위치**: `src/components/search/SearchTwoDepth.js`
- **설명**: 2차 카테고리 검색 컴포넌트 함수
- **파라미터**: `{ category1, activeCategory2, category2List }`
- **반환값**: HTML 문자열

#### `DetailNav(props)`

- **위치**: `src/components/detail/DetailNav.js`
- **설명**: 상품 상세 페이지 네비게이션 컴포넌트 함수
- **파라미터**: `{ product, loading }`
- **반환값**: HTML 문자열

#### `DetailContent(props)`

- **위치**: `src/components/detail/DetailContent.js`
- **설명**: 상품 상세 페이지 컨텐츠 컴포넌트 함수
- **파라미터**: `{ product, loading, error }`
- **반환값**: HTML 문자열

### 12. 알림 함수

#### `showToast(template)`

- **위치**: `src/components/Alert.js`
- **설명**: 토스트 알림을 표시하는 함수
- **파라미터**: `template` - 토스트 HTML 템플릿

#### `ensureToastRoot()`

- **위치**: `src/components/Alert.js`
- **설명**: 토스트 루트 요소를 생성하고 반환하는 함수
- **반환값**: 토스트 루트 DOM 요소

#### `scheduleRemoval(toast)`

- **위치**: `src/components/Alert.js`
- **설명**: 토스트 자동 제거를 스케줄링하는 함수
- **파라미터**: `toast` - 토스트 DOM 요소

### 13. Mock 함수

#### `enableMocking()`

- **위치**: `src/main.js`
- **설명**: MSW(Mock Service Worker)를 활성화하는 비동기 함수
- **반환값**: Worker 인스턴스

#### `getUniqueCategories()`

- **위치**: `src/mocks/handlers.js`
- **설명**: 고유한 카테고리 목록을 추출하는 함수

#### `filterProducts(products, query)`

- **위치**: `src/mocks/handlers.js`
- **설명**: 상품 목록을 검색어로 필터링하는 함수
- **파라미터**:
  - `products`: 상품 배열
  - `query`: 검색어

---

## React useState와 유사한 기능 구현 가능성

### 현재 상태 관리 방식

현재 프로젝트는 **전역 상태 객체**를 사용하여 상태를 관리하고 있습니다:

```javascript
const state = {
  products: [],
  isLoadingProducts: false,
  // ... 기타 상태들
};
```

상태 변경 시 수동으로 `render()` 함수를 호출하여 DOM을 업데이트합니다:

```javascript
state.products = newProducts;
render(); // 수동으로 렌더링 트리거
```

### React useState와의 차이점

1. **자동 리렌더링**: React의 `useState`는 상태 변경 시 자동으로 컴포넌트를 리렌더링하지만, 현재 프로젝트는 수동으로 `render()`를 호출해야 합니다.

2. **컴포넌트별 상태**: React는 각 컴포넌트가 독립적인 상태를 가질 수 있지만, 현재 프로젝트는 전역 상태 객체를 사용합니다.

3. **상태 업데이트 함수**: React의 `setState`는 함수형 업데이트를 지원하지만, 현재 프로젝트는 직접 상태를 변경합니다.

### useState와 유사한 기능 구현 가능성

**가능합니다!** Vanilla JavaScript로 React의 `useState`와 유사한 기능을 구현할 수 있습니다.

#### 구현 방법

1. **상태 저장소 생성**: 각 컴포넌트나 기능별로 독립적인 상태 저장소를 생성
2. **상태 변경 감지**: 상태 변경 시 자동으로 리렌더링을 트리거하는 메커니즘 구현
3. **구독 패턴**: 상태 변경을 구독하고 콜백을 실행하는 패턴 구현

---

## useState 구현 예제

다음은 React의 `useState`와 유사한 기능을 구현한 예제입니다:

### 기본 구현

```javascript
// useState.js
function useState(initialValue) {
  let state = initialValue;
  const listeners = [];

  const setState = (newValue) => {
    // 함수형 업데이트 지원
    if (typeof newValue === "function") {
      state = newValue(state);
    } else {
      state = newValue;
    }

    // 모든 리스너에 상태 변경 알림
    listeners.forEach((listener) => listener(state));
  };

  const subscribe = (listener) => {
    listeners.push(listener);

    // 구독 해제 함수 반환
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  };

  return [state, setState, subscribe];
}
```

### 사용 예제

```javascript
// 사용 예제
const [count, setCount, subscribeCount] = useState(0);

// 상태 변경 구독
subscribeCount((newCount) => {
  console.log("Count changed:", newCount);
  updateUI(newCount);
});

// 상태 변경
setCount(5); // UI 자동 업데이트
setCount((prev) => prev + 1); // 함수형 업데이트
```

### 컴포넌트와 통합

```javascript
// 컴포넌트에서 사용
function CounterComponent() {
  const [count, setCount, subscribeCount] = useState(0);
  const [isVisible, setIsVisible, subscribeVisible] = useState(true);

  // 렌더링 함수
  const render = () => {
    const container = document.getElementById("counter");
    if (!container) return;

    container.innerHTML = `
      <div>
        <p>Count: ${count}</p>
        <button onclick="increment()">Increment</button>
        <button onclick="decrement()">Decrement</button>
      </div>
    `;
  };

  // 상태 변경 구독
  subscribeCount(() => render());
  subscribeVisible(() => render());

  // 초기 렌더링
  render();

  // 전역 함수 (실제로는 클로저나 이벤트 위임 사용 권장)
  window.increment = () => setCount((prev) => prev + 1);
  window.decrement = () => setCount((prev) => prev - 1);
}
```

### 고급 구현 (여러 상태 관리)

```javascript
// useReducer 스타일 구현
function useReducer(reducer, initialState) {
  let state = initialState;
  const listeners = [];

  const dispatch = (action) => {
    state = reducer(state, action);
    listeners.forEach((listener) => listener(state));
  };

  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  };

  return [state, dispatch, subscribe];
}

// 사용 예제
const counterReducer = (state, action) => {
  switch (action.type) {
    case "INCREMENT":
      return { count: state.count + 1 };
    case "DECREMENT":
      return { count: state.count - 1 };
    default:
      return state;
  }
};

const [state, dispatch, subscribe] = useReducer(counterReducer, { count: 0 });

subscribe((newState) => {
  console.log("State changed:", newState);
  updateUI(newState);
});

dispatch({ type: "INCREMENT" });
```

### 현재 프로젝트에 적용

현재 프로젝트의 상태 관리 방식을 개선하려면 다음과 같이 적용할 수 있습니다:

```javascript
// 상태 관리 유틸리티
function createStateManager(initialState) {
  let state = initialState;
  const listeners = [];

  const getState = () => state;

  const setState = (updater) => {
    const newState = typeof updater === "function" ? updater(state) : { ...state, ...updater };

    state = newState;
    listeners.forEach((listener) => listener(state));
  };

  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  };

  return { getState, setState, subscribe };
}

// 사용 예제
const stateManager = createStateManager({
  products: [],
  isLoadingProducts: false,
  // ... 기타 상태들
});

// 상태 변경 구독
stateManager.subscribe((newState) => {
  render(); // 자동 리렌더링
});

// 상태 변경
stateManager.setState({ products: newProducts });
// 또는
stateManager.setState((prevState) => ({
  ...prevState,
  products: newProducts,
}));
```

### 장점

1. **자동 리렌더링**: 상태 변경 시 자동으로 UI 업데이트
2. **구독 패턴**: 필요한 부분만 업데이트 가능
3. **함수형 업데이트**: 이전 상태를 기반으로 업데이트 가능
4. **타입 안정성**: TypeScript와 함께 사용 시 타입 안정성 향상

### 단점

1. **성능**: 모든 리스너를 호출하므로 대량의 상태 변경 시 성능 이슈 가능
2. **복잡도**: 상태 관리 로직이 복잡해질 수 있음
3. **메모리**: 리스너가 제대로 해제되지 않으면 메모리 누수 가능

### 권장 사항

1. **점진적 도입**: 기존 코드를 한 번에 바꾸지 말고 점진적으로 도입
2. **성능 최적화**: 불필요한 리렌더링을 방지하기 위한 최적화 고려
3. **메모리 관리**: 컴포넌트 언마운트 시 리스너 해제
4. **테스트**: 상태 관리 로직에 대한 단위 테스트 작성

---

## 결론

현재 프로젝트는 전역 상태 객체를 사용하여 상태를 관리하고 있으며, 상태 변경 시 수동으로 `render()` 함수를 호출하여 DOM을 업데이트합니다.

React의 `useState`와 유사한 기능을 구현하는 것은 **가능**하며, 구독 패턴을 사용하여 상태 변경 시 자동으로 리렌더링을 트리거할 수 있습니다.

이를 통해 코드의 가독성과 유지보수성을 향상시킬 수 있으며, React와 유사한 개발 경험을 제공할 수 있습니다.
