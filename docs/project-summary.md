# 프로젝트 기능 요약

최신 기능 구현 현황과 사용 방법을 정리한 문서입니다. 홈 화면, 상세 페이지, 검색/필터, 라우팅 구조 등 주요 작업과 테스트 방법을 한눈에 확인할 수 있습니다.

## 0. API → 상태 → Props → 화면 출력 흐름

1. **API 호출 시점**
   - `main.js` 진입 시 `enableMocking().then(main)`으로 MSW를 준비합니다.
   - `main()` 내부에서 `handleRouteChange()`를 실행하여 현재 URL에 맞는 데이터를 로드합니다.
2. **홈 라우트(`/`)**
   - `parseRoute()`가 홈이라고 판단하면 `renderHomeView(root)`가 호출되어 기본 레이아웃과 `#search-section`, `#product-section` 컨테이너만 그립니다.
   - `initializeSearchSection()`에서 `Search` 컴포넌트를 최초 렌더링하고, 동시에 `getCategories()` API를 호출해 루트/1뎁스/2뎁스 데이터를 `state.categories`에 저장합니다.
   - `loadProducts()`가 `getProducts(params)`를 호출하여 현재 `state`(페이지, 제한 수, 정렬, 검색어, 카테고리)를 기반으로 상품 리스트와 페이지네이션 정보를 받아옵니다.
   - API 결과는 `state.products`, `state.hasNext`, `state.totalCount` 등에 저장되고, 이후 `renderProductSection()`이 `ItemList` 컴포넌트에 props(상품 목록, 로딩/에러 상태, 페이지 정보)를 전달하여 화면에 뿌립니다.
3. **상세 라우트(`/product/:id`)**
   - `renderDetailView(root)`가 `Layout`을 렌더링하고 즉시 `loadProductDetail(productId)` 실행.
   - `loadProductDetail`은 `getProduct(productId)`를 호출하여 단일 상품과 관련 상품 ID 목록을 받습니다. 동시에 `getProducts`를 이용해 관련 상품 리스트를 다시 요청합니다.
   - 반환된 데이터는 `state.productDetail`, `state.relatedProducts`, `state.quantity` 등에 저장되고, `DetailNav`, `DetailContent` 컴포넌트에 props로 전달되어 UI를 구성합니다.
4. **컴포넌트에서의 Props 사용**
   - `Search`는 `{ categories, selectedCategory1, selectedCategory2, loading }` 등을 받아 버튼과 브레드크럼을 렌더링하고, 선택 이벤트 발생 시 상위에 알리기 위해 `data-*` 속성을 사용합니다.
   - `ItemList`는 `{ products, loading, error, emptyMessage }` props로 카드 리스트/스켈레톤/에러 UI를 상황에 맞게 표시합니다.
   - `DetailContent`는 `{ product, quantity, relatedProducts }`를 받아 상품 상세 정보, 수량 제어, 관련 상품 섹션을 렌더링합니다.
5. **상태 업데이트와 재렌더링**
   - 검색, 카테고리, 정렬 변경 이벤트는 모두 `state`를 수정하고 `loadProducts`를 다시 호출하여 서버 데이터와 UI를 동기화합니다.
   - 브라우저 뒤/앞 이동 시 `popstate` 이벤트가 `handleRouteChange()`를 트리거하여 URL 쿼리에 맞춘 데이터를 다시 불러옵니다.
6. **API 사용 예시**
   - `getCategories()` : `await getCategories();` → `{ category1: [...], category2: {...} }` 형태의 계층 데이터를 반환.
   - `getProducts({ current, limit, sort, category1, category2, search })` : 페이징 정보를 포함한 상품 배열을 받습니다.
   - `getProduct(productId)` : 단일 상품 객체(`detail`, `images`, `stock`, `relatedProducts` 등)를 반환하며, 관련 상품 ID 목록으로 후속 요청이 이어집니다.

---

---

## 1. 홈 화면 (상품 목록)

- **무한 스크롤**: 하단 센티널(`products-load-more-trigger`)이 뷰포트에 들어오면 자동으로 다음 페이지를 요청하고 리스트에 이어 붙입니다.
- **카테고리 필터**:
  - 루트 → 1뎁스 → 2뎁스 구조로 동작하며, 선택 상태는 URL 쿼리(`category1`, `category2`)에서도 유지됩니다.
  - 브레드크럼을 통해 이전 단계로 돌아갈 수 있고, “전체” 버튼 클릭 시 모든 필터가 초기화됩니다.
- **검색 기능**:
  - 검색 입력 후 Enter 키를 누르면 검색어가 적용되며 `?search=...` 쿼리로 이동합니다.
  - `getProducts` API에 검색어를 넘겨 제목/브랜드 매칭 결과만 리스트에 표시합니다.
- **정렬 / 페이지당 개수**:
  - 정렬(`sort`)과 페이지당 상품 수(`limit`) 변경 시 URL 쿼리와 API 요청에 반영되며, 첫 페이지부터 다시 로드합니다.
- **뒤로/앞으로 히스토리**: `popstate` 이벤트를 기반으로 URL 쿼리에 맞춰 필터/검색 상태를 복원합니다.

### 테스트 방법 (홈 화면)

1. **카테고리 루트 선택**: 임의의 1뎁스 버튼 클릭 → URL에 `category1` 반영 및 필터 적용 확인.
2. **카테고리 2뎁스 선택**: 하위 버튼 클릭 → `category1 & category2`가 적용된 URL, 상품 목록 확인.
3. **검색어**: 검색 입력 후 Enter → `search` 쿼리 확인, 해당 키워드가 포함된 상품만 노출되는지 체크.
4. **정렬 & 개수**: 드롭다운 변경 후 리스트 순서 및 개수 확인, URL 쿼리 값이 갱신되는지 확인.
5. **무한 스크롤**: 리스트 하단으로 스크롤 → 다음 페이지가 자연스럽게 붙는지 확인.
6. **브라우저 뒤/앞 이동**: 검색/카테고리/정렬 상태에서 `뒤로/앞으로` 동작 → 상태가 정확히 복원되는지 확인.

---

## 2. 상세 페이지 (`/product/:id`)

- **헤더**: `상품 상세` 제목(클릭 불가)과 기본 뒤로가기 버튼.
- **상품 정보**:
  - 가격, 재고, 설명, 평점/리뷰, 썸네일 미리보기 등 표시.
  - 수량 선택(± 버튼, 직접 입력)은 최소 1, 최대 재고 범위 내에서 제어하도록 구현.
  - “장바구니 담기” 버튼 클릭 시 현재 수량과 함께 콘솔에 로그 → 추후 실제 로직과 연동 가능.
- **관련 상품**:
  - 같은 `category1` (가능하면 `category2`까지) 기준으로 최대 4개 추천.
  - 카드 클릭 시 해당 상품 상세 페이지로 이동하며, URL도 `/product/<id>` 형태로 변경.
- **카테고리 브레드크럼**:
  - `홈 > 1차 > 2차 ...` 구조로 표시.
  - “홈” 버튼: 모든 필터/검색 초기화 후 홈 화면으로 이동.
  - 카테고리 버튼: 해당 카테고리 조건이 적용된 홈 화면으로 이동 (`?current=1&category1=...&category2=...`).

### 테스트 방법 (상세 페이지)

1. 홈 목록에서 상품 카드를 클릭 → `/product/<id>`로 이동하는지 확인.
2. 수량 ± 버튼/직접 입력 제약 확인 (1 이하/재고 이상으로 입력해도 범위 내로 보정되는지).
3. “장바구니 담기” 버튼 → 콘솔에 로그 출력 확인 (추후 실제 로직 연결 시 수정).
4. 관련 상품 카드 클릭 → 다른 상세 페이지로 이동 후 정보/브레드크럼 업데이트 확인.
5. 브레드크럼의 “홈” 및 카테고리 버튼 클릭 → 필터가 반영된 홈 화면으로 이동 확인.

---

## 3. 라우팅 & URL 구조

- **페이지 경로**
  - 홈: `/` + `?current=1&category1=...&category2=...&search=...`
  - 상세: `/product/:productId`
- **URL 쿼리 처리**
  - `handleRouteChange()`에서 매번 URL을 해석하여 상태에 복원.
  - 필터/검색 상태가 변할 때마다 `updateHomeUrlParams()`로 쿼리를 갱신.
  - 브라우저 뒤/앞 이동 시 `popstate` 처리로 동일한 상태를 재렌더링.

### 테스트 시나리오

1. 홈에서 검색/필터/정렬 조합을 만든 뒤 브라우저 뒤로가기 → 상태 복원.
2. 상세 페이지로 이동 후 스크롤/뒤로가기 → 홈 화면 상태 유지 확인.
3. 브라우저 주소창에 직접 `?category1=...` 등 입력 후 새로고침 → 동일한 조건으로 홈 화면 렌더링.

---

## 4. 폴더 구조 & 모듈화

```
src/
  components/
    detail/
      DetailContent.js
      DetailNav.js
    layout/
      Header.js
      Footer.js
      Layout.js
    search/
      Search.js
      SearchFirstDepth.js
      SearchTwoDepth.js
    ItemList.js
    index.js (barrel export)
```

- `components/index.js`에서 모든 컴포넌트를 재수출하므로 `import { Layout, Search, DetailNav, ... } from "../components"` 형태로 사용 가능.
- 검색/리스트는 홈 렌더링 이후에도 각 섹션만 부분 업데이트 (`initializeSearchSection`, `updateSearchUI`, `renderProductSection`).

---

## 5. 차후 확장 포인트

- 장바구니 로직 연결 (현재 `console.log`로 placeholder 처리).
- 검색 입력을 composition 이벤트(IME) 고려하여 디바운싱/검색 버튼 등 확장.
- 관련 상품 API를 따로 제공 받는 경우, 핸들러 로직을 별도 모듈로 분리 가능.
- 다국어 지원 시, 텍스트를 상수/리소스 파일로 분리.

---

## 6. 개발/테스트 팁

1. `pnpm dev`로 Vite 개발 서버 기동 → MSW(Mock Service Worker)가 자동 구동.
2. API 호출은 콘솔에서 `getProducts`, `getProduct` 등을 직접 테스트해 볼 수 있습니다.
3. URL 쿼리 조작 후 새로고침하면서 상태 복원 로직이 정상 동작하는지 자주 확인.
4. ESLint/Prettier 설정은 기본 값으로 동작하며, `pnpm lint`로 문법 체크.

---

문의나 추가 기능 요청이 있으면 README나 이 문서를 확장/업데이트하여 협업 기준으로 활용할 수 있습니다.

## 7. 주요 메서드 & 함수 체크리스트

### 라우팅 · 상태 관리 (`src/main.js`)

- `parseRoute()` : 현재 URL(path + query)을 파싱해 `{ name, params }` 형태로 반환, 홈/상세 전환의 기준이 됩니다.
- `handleRouteChange()` : 라우트 결과에 따라 홈 혹은 상세 렌더링을 호출하고, 홈일 경우 URL 쿼리를 상태에 반영합니다.
- `applyHomeQueryParams()` : `URLSearchParams`를 읽어 `state.current`, `state.selectedCategory1/2`, `state.searchTerm`, `state.limit`, `state.sort` 등을 복원합니다.
- `updateHomeUrlParams({ current, category1, category2, search })` : 현재 상태를 쿼리 스트링으로 동기화합니다.
- `navigateToHome({ replace, category1, category2, current, search })` : 홈으로 이동하면서 필요한 쿼리 값을 설정합니다.
- `navigateToDetail(productId)` : `/product/:id` 형식 라우트로 이동합니다.
- `resetFilters({ updateUrl = true })` : 검색어, 카테고리, 페이지, 정렬/개수 상태를 초기화합니다.
- `handleDetailBreadcrumbClick(event)` : 상세 페이지 브레드크럼 클릭 시 홈으로 이동하며 관련 카테고리 쿼리를 적용합니다.

### 홈 섹션 렌더링 (`src/main.js`)

- `renderHomeView(root)` : 홈 컨테이너에 `Layout`과 섹션 뼈대를 렌더링합니다.
- `initializeSearchSection()` : `Search` 컴포넌트를 최초 1회 렌더링하고 이벤트를 바인딩합니다.
- `updateSearchUI()` : 선택된 카테고리/검색 상태에 맞춰 브레드크럼과 버튼 UI만 부분 갱신합니다.
- `renderProductSection()` : 상품 리스트, 로딩/에러 뷰를 상태에 맞춰 렌더링합니다.
- `attachHeaderNavigation(root)` : 헤더의 `쇼핑몰` 링크 클릭 시 필터 초기화 후 홈 이동을 처리합니다.

### 검색 · 카테고리 이벤트 (`src/main.js`)

- `handleSearchInputKeyDown(event)` : Enter 입력 감지 시 검색어를 적용하고 첫 페이지부터 상품을 재요청합니다.
- `handleCategoryButtonsClick(event)` : 1뎁스/2뎁스 버튼 클릭을 위임 처리하여 상태를 갱신합니다.
- `handleCategory1Select(event)` : 1뎁스 카테고리 선택 시 2뎁스와 페이지/검색 상태를 리셋합니다.
- `handleCategory2Select(event)` : 2뎁스 선택 후 상품을 재요청합니다.
- `handleCategoryReset(event)` : “전체” 버튼 클릭 시 모든 카테고리 필터를 초기화합니다.
- `handleCategoryBreadcrumb(event)` : 브레드크럼에서 상위 카테고리나 전체를 클릭했을 때 상태를 업데이트합니다.

### 상품 목록 데이터 흐름 (`src/main.js`)

- `setupLoadMoreObserver(rootElement)` : `IntersectionObserver`를 생성해 무한 스크롤 트리거를 감시합니다.
- `loadProducts({ append = false })` : `getProducts` API를 호출해 상태를 갱신하고, 필요 시 기존 리스트 뒤에 이어 붙입니다.
- `handleProductCardClick(event)` : 상품 카드 클릭을 감지해 상세 페이지로 이동합니다.

### 상세 페이지 렌더링 (`src/main.js`)

- `renderDetailView(root)` : 상세 페이지 레이아웃을 렌더링하고 데이터 로딩을 시작합니다.
- `loadProductDetail(productId)` : 단일 상품 + 관련 상품을 불러오고 상태를 갱신합니다.
- `attachDetailEvents(root)` : 수량 제어, 장바구니, 관련 상품 카드, 브레드크럼 등에 이벤트를 연결합니다.
- `normalizeQuantityInput(input)` / `handleQuantityChange(event)` : 수량 입력을 유효 범위로 보정하고 상태에 반영합니다.

### 컴포넌트 주요 API

- `Search(props)` (`src/components/search/Search.js`) : 카테고리, 검색 입력, 브레드크럼 UI를 초기 렌더링합니다.
- `updateCategoryBreadcrumb({ selectedCategory1, selectedCategory2 })` (`Search.js`) : 브레드크럼 텍스트만 다시 그립니다.
- `updateCategoryButtons({ categories, selectedCategory1, selectedCategory2, loading })` (`Search.js`) : 카테고리 버튼 영역을 동적 갱신합니다.
- `ItemList(props)` (`src/components/ItemList.js`) : 상품 카드, 로딩 스켈레톤, 오류 메시지를 상태에 맞춰 렌더링합니다.
- `DetailNav({ product })` (`src/components/detail/DetailNav.js`) : 상세 브레드크럼 및 상단 카테고리 버튼 UI를 생성합니다.
- `DetailContent({ product, quantity, relatedProducts })` (`src/components/detail/DetailContent.js`) : 상품 상세 정보, 수량 조절, 관련 상품 리스트 UI를 구성합니다.
- `Layout({ headerProps, children })` (`src/components/layout/Layout.js`) : 헤더/푸터와 콘텐츠 슬롯을 감싸는 공통 레이아웃입니다.
- `Header({ showBack })` (`src/components/layout/Header.js`) : 페이지 유형에 따라 `쇼핑몰` 링크 또는 `상품 상세` 제목을 렌더링합니다.

### API 유틸 (`src/api/productApi.js`)

- `getCategories()` : 카테고리 루트 데이터를 반환합니다.
- `getProducts(params)` : 카테고리, 검색, 정렬, 페이지 정보를 기반으로 상품 목록을 조회합니다.
- `getProduct(productId)` : 단일 상품 상세 + 관련 상품 ID 목록을 제공합니다.

---
