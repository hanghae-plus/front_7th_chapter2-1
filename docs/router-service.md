# 라우터 서비스 (Router Service) 문서

## 목차

1. [개요](#개요)
2. [라우터 구조](#라우터-구조)
3. [핵심 기술](#핵심-기술)
4. [핵심 함수 상세](#핵심-함수-상세)
5. [라우터 동작 원리](#라우터-동작-원리)
6. [실제 코드 흐름](#실제-코드-흐름)
7. [라우터 사용 예제](#라우터-사용-예제)

---

## 개요

### 라우터 서비스란?

이 프로젝트의 라우터 서비스는 **SPA(Single Page Application)에서 페이지 전환을 관리하는 시스템**입니다. 브라우저의 새로고침 없이 URL 변경을 감지하고, 해당하는 페이지를 렌더링합니다.

### 주요 특징

- ✅ **SPA 네비게이션**: 페이지 새로고침 없이 화면 전환
- ✅ **브라우저 히스토리 지원**: 뒤로가기/앞으로가기 버튼 작동
- ✅ **BASE_URL 지원**: 서브디렉터리 배포 환경 지원
- ✅ **URL 파라미터 처리**: 상품 ID, 쿼리 파라미터 등 처리
- ✅ **404 페이지 처리**: 존재하지 않는 경로 처리

### 지원하는 라우트

1. **홈 페이지** (`/`)
   - 상품 목록 표시
   - URL 쿼리 파라미터로 필터링 상태 관리
2. **상품 상세 페이지** (`/product/{productId}`)

   - 상품 ID를 URL 경로에 포함
   - 상품 상세 정보 표시

3. **404 페이지** (`/not-found`)
   - 존재하지 않는 경로 접근 시 표시

---

## 라우터 구조

### 파일 구조

```
src/
├── services/
│   ├── routerService.js      # 라우터 핵심 로직
│   └── urlService.js         # URL 파라미터 관리
├── main.js                   # 라우터 초기화 및 사용
└── handlers/
    ├── productHandlers.js    # 상품 클릭 시 라우팅
    └── navigationHandlers.js # 네비게이션 이벤트 처리
```

### 모듈 의존성

```
routerService.js
    ├── parseRoute()          # URL 파싱
    ├── buildUrl()            # URL 생성
    ├── navigateToDetail()    # 상세 페이지 이동
    └── navigateToHome()      # 홈 페이지 이동
        └── urlService.js     # URL 파라미터 처리
            └── buildHomeUrlWithParams()
```

---

## 핵심 기술

### 1. History API

브라우저의 **History API**를 사용하여 SPA 네비게이션을 구현합니다.

#### `pushState()`

```javascript
// 히스토리에 새로운 항목 추가 (뒤로가기 가능)
window.history.pushState(state, title, url);
```

- **용도**: 새로운 페이지로 이동 (히스토리 추가)
- **예시**: 상품 상세 페이지로 이동

#### `replaceState()`

```javascript
// 현재 히스토리 항목 교체 (뒤로가기 불가)
window.history.replaceState(state, title, url);
```

- **용도**: 현재 페이지 URL만 변경 (히스토리 추가 안 함)
- **예시**: 필터 변경 시 URL 업데이트

#### `popstate` 이벤트

```javascript
// 브라우저 뒤로가기/앞으로가기 시 발생
window.addEventListener("popstate", () => {
  handleRouteChange();
});
```

- **용도**: 브라우저 히스토리 변경 감지
- **동작**: 뒤로가기/앞으로가기 버튼 클릭 시 자동 호출

### 2. URL 파싱

현재 브라우저의 URL을 분석하여 라우트 정보를 추출합니다.

#### URL 구조

```
https://example.com/base/product/123?category1=생활&search=검색어
│                    │     │      │    │
│                    │     │      │    └─ 쿼리 파라미터 (urlService.js)
│                    │     │      └─ 경로 파라미터 (productId)
│                    │     └─ 라우트 경로
│                    └─ BASE_URL (서브디렉터리)
```

### 3. BASE_URL 처리

Vite의 `import.meta.env.BASE_URL`을 사용하여 서브디렉터리 배포를 지원합니다.

#### BASE_URL이란?

**BASE_URL**은 애플리케이션이 배포되는 **기본 경로(서브디렉터리)**를 나타냅니다.

#### 왜 필요한가?

일부 배포 환경에서는 애플리케이션이 루트 경로(`/`)가 아닌 **서브디렉터리**에 배포됩니다:

**예시:**

- **루트 배포**: `https://example.com/` → BASE_URL: `/`
- **서브디렉터리 배포**: `https://example.com/shop/` → BASE_URL: `/shop/`
- **GitHub Pages**: `https://username.github.io/repo-name/` → BASE_URL: `/repo-name/`

#### 실제 프로젝트 설정

**`vite.config.js` 설정:**

```javascript
export default defineConfig(({ mode }) => ({
  base: mode === "development" ? "/" : "/front_7th_chapter2-1/",
  // 개발 환경: "/" (로컬 개발)
  // 프로덕션: "/front_7th_chapter2-1/" (GitHub Pages 배포)
}));
```

**`package.json` 설정:**

```json
{
  "homepage": "https://hyeongwoo94.github.io/front_7th_chapter2-1"
}
```

#### BASE_URL 사용 예시

**개발 환경:**

- BASE_URL: `/`
- 실제 URL: `http://localhost:5173/product/123`
- 경로 파싱: `product/123`

**프로덕션 환경 (GitHub Pages):**

- BASE_URL: `/front_7th_chapter2-1/`
- 실제 URL: `https://hyeongwoo94.github.io/front_7th_chapter2-1/product/123`
- 경로 파싱: `product/123` (BASE_URL 제거 후)

#### BASE_URL 처리 로직

**코드 위치: `src/services/routerService.js` (6-14줄)**

```javascript
const basePath = import.meta.env.BASE_URL ?? "/";
// Vite가 자동으로 BASE_URL을 주입
// 개발: "/"
// 프로덕션: "/front_7th_chapter2-1/"

const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
// 항상 끝에 슬래시가 있도록 정규화
// "/" → "/"
// "/front_7th_chapter2-1" → "/front_7th_chapter2-1/"

let pathname = window.location.pathname;
// 현재 URL의 경로 부분
// 개발: "/product/123"
// 프로덕션: "/front_7th_chapter2-1/product/123"

if (normalizedBase !== "/" && pathname.startsWith(normalizedBase)) {
  pathname = pathname.slice(normalizedBase.length);
  // BASE_URL이 "/"가 아니고 경로가 BASE_URL로 시작하면
  // BASE_URL 부분을 제거
  // "/front_7th_chapter2-1/product/123" → "product/123"
}
```

#### BASE_URL 처리 흐름

```
[실제 URL]
https://hyeongwoo94.github.io/front_7th_chapter2-1/product/123
│                                    │
│                                    └─ BASE_URL: "/front_7th_chapter2-1/"
│
└─ window.location.pathname: "/front_7th_chapter2-1/product/123"
        │
        ▼
[parseRoute() 함수]
        │
        ├─ BASE_URL 제거
        │   "/front_7th_chapter2-1/product/123" → "product/123"
        │
        └─ 라우트 매칭
            "product/123" → { name: "detail", params: { productId: "123" } }
```

#### BASE_URL이 없으면?

BASE_URL 처리가 없으면 서브디렉터리 배포 시 라우팅이 실패합니다:

**문제 상황:**

```
실제 URL: https://example.com/shop/product/123
BASE_URL 처리 없음: "shop/product/123"로 파싱
라우트 매칭 실패: "shop/product/123" ≠ "product/123"
결과: 404 페이지 표시
```

**BASE_URL 처리 후:**

```
실제 URL: https://example.com/shop/product/123
BASE_URL 제거: "product/123"
라우트 매칭 성공: "product/123" → { name: "detail", params: { productId: "123" } }
결과: 상세 페이지 표시 ✅
```

#### BASE_URL 예시

- **개발 환경**: `/` (루트)
- **프로덕션 (GitHub Pages)**: `/front_7th_chapter2-1/` (서브디렉터리)
- **일반 서브디렉터리**: `/shop/`, `/app/` 등

---

## 핵심 함수 상세

### 1. `parseRoute()` - URL 파싱 함수

#### 함수 시그니처

```javascript
export function parseRoute() {
  // ...
  return { name: "home" | "detail" | "not_found", params?: { productId: string } };
}
```

#### 동작 원리

**Step 1: BASE_URL 처리**

```javascript
// src/services/routerService.js (5-14줄)
const basePath = import.meta.env.BASE_URL ?? "/";
const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
let pathname = window.location.pathname;

if (normalizedBase !== "/" && pathname.startsWith(normalizedBase)) {
  pathname = pathname.slice(normalizedBase.length);
} else if (normalizedBase === "/" && pathname.startsWith("/")) {
  pathname = pathname.slice(1);
}
```

**예시:**

- BASE_URL: `/shop/`
- 실제 경로: `/shop/product/123`
- 처리 후: `product/123`

**Step 2: 경로 정규화**

```javascript
// src/services/routerService.js (16줄)
pathname = pathname.replace(/^\/+/, "").replace(/\/+$/, "");
```

- 앞뒤 슬래시 제거
- 예: `///product/123///` → `product/123`

**Step 3: 라우트 매칭**

```javascript
// src/services/routerService.js (18-32줄)
if (!pathname) {
  return { name: "home" };
}

const detailMatch = pathname.match(/^product\/([^/]+)$/);
if (detailMatch) {
  return {
    name: "detail",
    params: {
      productId: decodeURIComponent(detailMatch[1]),
    },
  };
}

return { name: "not_found" };
```

**매칭 규칙:**

- 빈 경로 → `{ name: "home" }`
- `product/{productId}` → `{ name: "detail", params: { productId } }`
- 그 외 → `{ name: "not_found" }`

**정규식 설명:**

```javascript
/^product\/([^/]+)$/
│   │      │   │  │
│   │      │   │  └─ 문자열 끝
│   │      │   └─ 하나 이상의 문자 (슬래시 제외)
│   │      └─ 캡처 그룹 (productId 추출)
│   └─ 리터럴 문자열 "product/"
└─ 문자열 시작
```

#### 실제 사용 예시

```javascript
// 현재 URL: https://example.com/product/85067212996
const route = parseRoute();
// 결과: { name: "detail", params: { productId: "85067212996" } }
```

---

### 2. `buildUrl()` - URL 생성 함수

#### 함수 시그니처

```javascript
export function buildUrl(path = "") {
  // ...
  return new URL(urlString, window.location.origin);
}
```

#### 동작 원리

**Step 1: BASE_URL 정규화**

```javascript
// src/services/routerService.js (41-42줄)
const basePath = import.meta.env.BASE_URL ?? "/";
const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
```

**Step 2: 경로 정규화**

```javascript
// src/services/routerService.js (43줄)
const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
```

- 경로 앞의 슬래시 제거
- 예: `/product/123` → `product/123`

**Step 3: URL 생성**

```javascript
// src/services/routerService.js (44줄)
return new URL(`${normalizedBase}${normalizedPath}`, window.location.origin);
```

**예시:**

```javascript
// BASE_URL: "/shop/"
// path: "product/123"
// 결과: "https://example.com/shop/product/123"
```

#### 실제 사용 예시

```javascript
const url = buildUrl("product/123");
// 결과: URL 객체 (https://example.com/product/123)
```

---

### 3. `navigateToDetail()` - 상세 페이지 이동 함수

#### 함수 시그니처

```javascript
export function navigateToDetail(productId, onRouteChange) {
  // ...
}
```

#### 동작 원리

**Step 1: URL 생성**

```javascript
// src/services/routerService.js (53줄)
const detailUrl = buildUrl(`product/${encodeURIComponent(productId)}`);
```

**`encodeURIComponent()` 사용 이유:**

- 특수 문자 처리 (예: `product/123?abc` → `product/123%3Fabc`)
- URL 안전성 보장

**Step 2: 히스토리 업데이트**

```javascript
// src/services/routerService.js (54줄)
window.history.pushState({ productId }, "", detailUrl.toString());
```

**`pushState()` 파라미터:**

- `state`: 히스토리 상태 객체 (뒤로가기 시 사용 가능)
- `title`: 브라우저 탭 제목 (현재는 사용 안 함)
- `url`: 변경할 URL

**Step 3: 라우트 변경 콜백 호출**

```javascript
// src/services/routerService.js (55-57줄)
if (onRouteChange) {
  onRouteChange();
}
```

#### 실제 사용 예시

```javascript
// src/main.js (164-166줄)
function navigateToDetail(productId) {
  navigateToDetailService(productId, handleRouteChange);
}
```

**호출 흐름:**

```
상품 카드 클릭
  → handleProductCardClick()
    → navigateToDetail(productId)
      → navigateToDetailService(productId, handleRouteChange)
        → window.history.pushState()
        → handleRouteChange()
          → parseRoute()
          → render()
```

---

### 4. `navigateToHome()` - 홈 페이지 이동 함수

#### 함수 시그니처

```javascript
export function navigateToHome(
  { replace = false, category1, category2, current, search } = {},
  buildHomeUrlWithParams,
  onRouteChange,
) {
  // ...
}
```

#### 동작 원리

**Step 1: URL 생성 (쿼리 파라미터 포함)**

```javascript
// src/services/routerService.js (76-81줄)
const url = buildHomeUrlWithParams({
  current,
  category1,
  category2,
  search,
});
```

**`buildHomeUrlWithParams()` 동작:**

- `urlService.js`의 함수 사용
- 현재 상태와 전달된 파라미터를 결합하여 URL 생성
- 예: `/?category1=생활&search=검색어&current=1`

**Step 2: 히스토리 업데이트 (replace 또는 push)**

```javascript
// src/services/routerService.js (83-87줄)
if (replace) {
  window.history.replaceState({}, "", url.toString());
} else {
  window.history.pushState({}, "", url.toString());
}
```

**`replace` vs `push`:**

- `replace: true`: 현재 히스토리 항목 교체 (뒤로가기 불가)
  - 예: 필터 변경 시 URL만 업데이트
- `replace: false`: 새로운 히스토리 항목 추가 (뒤로가기 가능)
  - 예: 홈으로 돌아가기

**Step 3: 라우트 변경 콜백 호출**

```javascript
// src/services/routerService.js (89-91줄)
if (onRouteChange) {
  onRouteChange();
}
```

#### 실제 사용 예시

```javascript
// src/main.js (168-170줄)
function navigateToHome({ replace = false, category1, category2, current, search } = {}) {
  navigateToHomeService({ replace, category1, category2, current, search }, buildHomeUrlWithParams, handleRouteChange);
}
```

**호출 흐름:**

```
홈으로 이동
  → navigateToHome({ category1: "생활", search: "검색어" })
    → navigateToHomeService()
      → buildHomeUrlWithParams()
      → window.history.pushState()
      → handleRouteChange()
        → parseRoute()
        → applyHomeQueryParams()  // URL 쿼리 파라미터 복원
        → render()
```

---

## 라우터 동작 원리

### 전체 흐름도

```
[애플리케이션 시작]
        │
        ▼
[main() 함수 실행]
        │
        ├─ initializeState(parseRoute())  // 초기 라우트 파싱
        │
        ├─ window.addEventListener("popstate", handleRouteChange)  // 뒤로가기 감지
        │
        └─ handleRouteChange()  // 초기 렌더링
                │
                ├─ parseRoute()  // URL 파싱
                │
                ├─ [라우트별 처리]
                │   ├─ "detail" → loadProductDetailService()
                │   ├─ "home" → applyHomeQueryParams() → loadProductsService()
                │   └─ "not_found" → renderNotFound()
                │
                └─ render()  // 화면 렌더링
```

### 1. 초기화 단계

**코드 위치: `src/main.js` (250-259줄)**

```javascript
async function main() {
  // 상태 초기화 (라우트와 장바구니 복원)
  initializeState(parseRoute());

  window.addEventListener("popstate", () => {
    handleRouteChange();
  });

  await handleRouteChange();
}
```

**동작 순서:**

1. `parseRoute()`로 현재 URL 파싱
2. `initializeState()`로 상태 초기화 (라우트 정보 저장)
3. `popstate` 이벤트 리스너 등록 (뒤로가기 감지)
4. `handleRouteChange()` 호출 (초기 렌더링)

### 2. 라우트 변경 감지

#### 방법 1: 프로그래밍 방식 (pushState/replaceState)

```javascript
// 사용자가 상품 카드 클릭
navigateToDetail("123");
  → window.history.pushState()
  → onRouteChange() 콜백 호출
    → handleRouteChange()
```

#### 방법 2: 브라우저 히스토리 (popstate)

```javascript
// 사용자가 뒤로가기 버튼 클릭
window.history.back();
  → popstate 이벤트 발생
  → handleRouteChange() 자동 호출
```

### 3. 라우트 처리 단계

**코드 위치: `src/main.js` (216-248줄)**

```javascript
async function handleRouteChange() {
  closeCartModalWrapper();
  state.route = parseRoute();

  if (state.route.name === "detail") {
    await loadProductDetailService(state.route.params.productId, render, () => showToast(errorAlert));
    return;
  }

  if (state.route.name !== "home") {
    resetHomeShell();
    state.detail = createInitialDetailState();
    state.isLoadingProducts = false;
    state.productsError = null;
    render();
    return;
  }

  applyHomeQueryParams();
  state.detail = createInitialDetailState();

  render();

  await ensureCategoriesLoadedService(render, () => showToast(errorAlert));
  await loadProductsService({ append: false }, render, () => showToast(errorAlert), updateHomeUrlParams);
}
```

**처리 흐름:**

1. **장바구니 모달 닫기**: 라우트 변경 시 모달 자동 닫기
2. **라우트 파싱**: 현재 URL에서 라우트 정보 추출
3. **라우트별 처리**:
   - **detail**: 상품 상세 데이터 로드
   - **home**: 쿼리 파라미터 복원 → 카테고리 로드 → 상품 로드
   - **not_found**: 404 페이지 렌더링
4. **렌더링**: 변경된 라우트에 맞는 화면 렌더링

---

## 실제 코드 흐름

### 시나리오 1: 상품 상세 페이지로 이동

#### 전체 흐름도

```
[사용자가 상품 카드 클릭]
        │
        ▼
[handleProductCardClick() 실행]
        │
        ▼
[navigateToDetail(productId) 호출]
        │
        ▼
[navigateToDetailService() 실행]
        │
        ├─ buildUrl("product/85067212996")
        │   └─ URL 생성: "https://example.com/product/85067212996"
        │
        ├─ window.history.pushState()
        │   └─ 브라우저 URL 변경 (새로고침 없음)
        │
        └─ handleRouteChange() 호출
                │
                ├─ parseRoute()
                │   └─ { name: "detail", params: { productId: "85067212996" } }
                │
                ├─ loadProductDetailService()
                │   └─ 상품 상세 데이터 로드
                │
                └─ render()
                    └─ renderDetailView()
                        └─ 상세 페이지 렌더링
```

#### Step 1: 사용자 액션

**코드 위치: `src/handlers/productHandlers.js` (6-22줄)**

```javascript
export function handleProductCardClick(event, onNavigateToDetail) {
  if (event.target.closest(".add-to-cart-btn")) {
    event.stopPropagation();
    return;
  }

  const card = event.currentTarget;
  const productId = card.dataset.productId;

  if (!productId) {
    return;
  }

  if (onNavigateToDetail) {
    onNavigateToDetail(productId); // "85067212996"
  }
}
```

**동작:**

- 상품 카드 클릭 시 `productId` 추출
- 장바구니 버튼 클릭 시 이벤트 전파 중단
- `onNavigateToDetail` 콜백 호출

#### Step 2: 라우터 서비스 호출

**코드 위치: `src/main.js` (164-166줄)**

```javascript
function navigateToDetail(productId) {
  navigateToDetailService(productId, handleRouteChange);
}
```

**동작:**

- `navigateToDetailService` 호출
- `handleRouteChange` 콜백 전달

#### Step 3: URL 변경

**코드 위치: `src/services/routerService.js` (52-58줄)**

```javascript
export function navigateToDetail(productId, onRouteChange) {
  // Step 3-1: URL 생성
  const detailUrl = buildUrl(`product/${encodeURIComponent(productId)}`);
  // 입력: "85067212996"
  // buildUrl() 호출:
  //   - BASE_URL: "/"
  //   - 경로: "product/85067212996"
  //   - 결과: "https://example.com/product/85067212996"

  // Step 3-2: 브라우저 히스토리 업데이트
  window.history.pushState({ productId }, "", detailUrl.toString());
  // pushState() 파라미터:
  //   - state: { productId: "85067212996" } (히스토리 상태 객체)
  //   - title: "" (브라우저 탭 제목, 현재는 사용 안 함)
  //   - url: "https://example.com/product/85067212996"
  // 결과: 브라우저 URL 변경 (새로고침 없음)

  // Step 3-3: 라우트 변경 콜백 호출
  if (onRouteChange) {
    onRouteChange(); // handleRouteChange() 호출
  }
}
```

**동작:**

1. **URL 생성**: `buildUrl()`로 상세 페이지 URL 생성
2. **히스토리 업데이트**: `pushState()`로 브라우저 URL 변경
3. **콜백 호출**: `handleRouteChange()` 호출하여 화면 업데이트

#### Step 4: 라우트 처리

**코드 위치: `src/main.js` (216-248줄)**

```javascript
async function handleRouteChange() {
  // Step 4-1: 장바구니 모달 닫기
  closeCartModalWrapper();

  // Step 4-2: 현재 URL 파싱
  state.route = parseRoute();
  // parseRoute() 동작:
  //   - 현재 URL: "https://example.com/product/85067212996"
  //   - pathname: "/product/85067212996"
  //   - 정규식 매칭: /^product\/([^/]+)$/
  //   - 결과: { name: "detail", params: { productId: "85067212996" } }

  // Step 4-3: 라우트별 처리
  if (state.route.name === "detail") {
    await loadProductDetailService(
      state.route.params.productId, // "85067212996"
      render, // 렌더링 콜백
      () => showToast(errorAlert), // 에러 처리 콜백
    );
    return;
  }

  // ... 다른 라우트 처리
}
```

**동작:**

1. **장바구니 모달 닫기**: 라우트 변경 시 모달 자동 닫기
2. **URL 파싱**: 현재 URL에서 라우트 정보 추출
3. **라우트별 처리**: 상세 페이지인 경우 상품 데이터 로드

#### Step 5: 렌더링

**코드 위치: `src/main.js` (82-148줄)**

```javascript
function render() {
  const root = document.getElementById("root");
  if (!root) return;

  if (state.route?.name === "detail") {
    // 상세 페이지 렌더링
    renderDetailView(root, {
      disconnectLoadMoreObserver,
      attachDetailEvents: (root) =>
        attachDetailEvents(root, {
          // ... 이벤트 핸들러 설정
        }),
    });
  }
  // ... 다른 라우트 렌더링
}
```

**동작:**

- `renderDetailView()` 호출하여 상세 페이지 렌더링
- 이벤트 핸들러 연결 (뒤로가기, 장바구니 등)

#### 코드 실행 순서

```javascript
// 1. 사용자 클릭
handleProductCardClick(event, navigateToDetail)
  ↓
// 2. 라우터 서비스 호출
navigateToDetail("85067212996")
  ↓
// 3. URL 변경
navigateToDetailService("85067212996", handleRouteChange)
  ├─ buildUrl("product/85067212996")
  ├─ window.history.pushState()
  └─ handleRouteChange()
      ↓
// 4. 라우트 처리
handleRouteChange()
  ├─ parseRoute() → { name: "detail", params: { productId: "85067212996" } }
  └─ loadProductDetailService("85067212996", render, ...)
      ↓
// 5. 렌더링
render()
  └─ renderDetailView()
      └─ 상세 페이지 렌더링
```

---

### 시나리오 2: 홈 페이지로 이동 (쿼리 파라미터 포함)

#### 전체 흐름도

```
[사용자가 카테고리 선택]
        │
        ▼
[handleCategory1Select() 실행]
        │
        ▼
[handleCategory1SelectService() 실행]
        │
        ├─ state.selectedCategory1 = "생활"
        │
        └─ navigateToHomeService() 호출
                │
                ├─ buildHomeUrlWithParams()
                │   ├─ buildUrl("")
                │   ├─ buildHomeParams()
                │   └─ URL 생성: "https://example.com/?category1=생활&current=1"
                │
                ├─ window.history.pushState()
                │   └─ 브라우저 URL 변경 (새로고침 없음)
                │
                └─ handleRouteChange() 호출
                        │
                        ├─ parseRoute()
                        │   └─ { name: "home" }
                        │
                        ├─ applyHomeQueryParams()
                        │   └─ URL 쿼리 파라미터 → state 복원
                        │       state.selectedCategory1 = "생활"
                        │       state.currentPage = 1
                        │
                        ├─ ensureCategoriesLoadedService()
                        │   └─ 카테고리 데이터 로드
                        │
                        ├─ loadProductsService()
                        │   └─ 필터링된 상품 로드
                        │
                        └─ render()
                            └─ renderHomeView()
                                └─ 홈 페이지 렌더링 (필터링된 상품 목록)
```

#### Step 1: 사용자 액션

**코드 위치: `src/handlers/categoryHandlers.js` (68-80줄)**

```javascript
export function handleCategory1Select(event, onUpdateUI, onLoadProducts) {
  event.preventDefault();
  const button = event.target.closest("[data-category1]");
  if (!button) {
    return;
  }
  const { category1 } = button.dataset;
  if (!category1) {
    return;
  }

  handleCategory1SelectService(category1, onUpdateUI, onLoadProducts);
}
```

**동작:**

- 카테고리 버튼 클릭 시 `category1` 추출
- `handleCategory1SelectService` 호출

#### Step 2: 상태 업데이트 및 라우팅

**코드 위치: `src/services/categoryService.js`**

```javascript
export function handleCategory1SelectService(category1, onUpdateUI, onLoadProducts) {
  state.selectedCategory1 = category1;
  state.selectedCategory2 = null;
  state.currentPage = 0;
  state.urlTouched = true;

  // UI 업데이트
  if (onUpdateUI) {
    onUpdateUI();
  }

  // 라우팅
  if (onLoadProducts) {
    onLoadProducts();
  }
}
```

**실제 호출:**

```javascript
// src/main.js (124줄)
handleCategory1Select(event, updateSearchUI, loadProducts);
// updateSearchUI: UI 업데이트 콜백
// loadProducts: 상품 로드 콜백 (내부에서 navigateToHome 호출)
```

#### Step 3: URL 생성 (쿼리 파라미터 포함)

**코드 위치: `src/services/urlService.js` (150-155줄)**

```javascript
export function buildHomeUrlWithParams(overrides = {}) {
  // Step 3-1: 기본 URL 생성
  const url = buildUrl("");
  // 입력: ""
  // buildUrl() 호출:
  //   - BASE_URL: "/"
  //   - 경로: ""
  //   - 결과: "https://example.com/"

  // Step 3-2: 쿼리 파라미터 생성
  const params = buildHomeParams(overrides);
  // buildHomeParams() 동작:
  //   - 입력: { category1: "생활", current: 1 }
  //   - resolveHomeParams() 호출:
  //     - state.selectedCategory1 = "생활"
  //     - state.currentPage = 0
  //     - 오버라이드: { category1: "생활", current: 1 }
  //     - 결과: { category1: "생활", current: 1, ... }
  //   - createHomeSearchParams() 호출:
  //     - URLSearchParams 생성
  //     - params.set("category1", "생활")
  //     - params.set("current", "1")
  //     - 결과: "category1=생활&current=1"

  // Step 3-3: URL에 쿼리 파라미터 추가
  url.search = params.toString();
  // 결과: "https://example.com/?category1=생활&current=1"

  return url;
}
```

**동작:**

1. **기본 URL 생성**: `buildUrl("")`로 홈 URL 생성
2. **쿼리 파라미터 생성**: `buildHomeParams()`로 쿼리 파라미터 생성
3. **URL 결합**: 기본 URL + 쿼리 파라미터

#### Step 4: 히스토리 업데이트

**코드 위치: `src/services/routerService.js` (83-87줄)**

```javascript
if (replace) {
  window.history.replaceState({}, "", url.toString());
  // replaceState() 사용:
  //   - 현재 히스토리 항목 교체
  //   - 뒤로가기 불가 (히스토리 추가 안 함)
  //   - 예: 필터 변경 시 URL만 업데이트
} else {
  window.history.pushState({}, "", url.toString());
  // pushState() 사용:
  //   - 새로운 히스토리 항목 추가
  //   - 뒤로가기 가능 (히스토리 추가)
  //   - 예: 홈으로 돌아가기
}
```

**동작:**

- **replace: true**: 현재 히스토리 항목 교체 (뒤로가기 불가)
- **replace: false**: 새로운 히스토리 항목 추가 (뒤로가기 가능)

#### Step 5: 라우트 처리 및 쿼리 파라미터 복원

**코드 위치: `src/main.js` (234-247줄)**

```javascript
async function handleRouteChange() {
  closeCartModalWrapper();
  state.route = parseRoute();
  // parseRoute() 결과: { name: "home" }

  if (state.route.name !== "home") {
    // ... 다른 라우트 처리
    return;
  }

  // Step 5-1: URL 쿼리 파라미터 복원
  applyHomeQueryParams();
  // applyHomeQueryParams() 동작:
  //   - URL: "https://example.com/?category1=생활&current=1"
  //   - URLSearchParams 생성
  //   - params.get("category1") → "생활"
  //   - params.get("current") → "1"
  //   - state.selectedCategory1 = "생활"
  //   - state.currentPage = 1
  //   - state.urlTouched = true

  // Step 5-2: 상태 초기화
  state.detail = createInitialDetailState();

  // Step 5-3: 초기 렌더링 (카테고리 로딩 상태)
  render();
  // "카테고리 로딩 중..." 표시

  // Step 5-4: 카테고리 로드
  await ensureCategoriesLoadedService(render, () => showToast(errorAlert));
  // 카테고리 데이터 로드 후 UI 업데이트

  // Step 5-5: 상품 로드
  await loadProductsService(
    { append: false }, // 새로 로드 (기존 상품 목록 초기화)
    render, // 렌더링 콜백
    () => showToast(errorAlert), // 에러 처리 콜백
    updateHomeUrlParams, // URL 업데이트 콜백
  );
  // 필터링된 상품 데이터 로드 후 UI 업데이트
}
```

**동작:**

1. **쿼리 파라미터 복원**: URL에서 쿼리 파라미터를 읽어 state에 저장
2. **상태 초기화**: 상세 페이지 상태 초기화
3. **초기 렌더링**: 카테고리 로딩 상태 표시
4. **카테고리 로드**: 카테고리 데이터 로드
5. **상품 로드**: 필터링된 상품 데이터 로드

#### 코드 실행 순서

```javascript
// 1. 사용자 클릭
handleCategory1Select(event, updateSearchUI, loadProducts)
  ↓
// 2. 상태 업데이트
handleCategory1SelectService("생활", updateSearchUI, loadProducts)
  ├─ state.selectedCategory1 = "생활"
  └─ loadProducts()
      ↓
// 3. URL 생성
navigateToHome({ category1: "생활", current: 1 })
  └─ navigateToHomeService({ category1: "생활", current: 1 }, ...)
      ├─ buildHomeUrlWithParams()
      │   ├─ buildUrl("")
      │   ├─ buildHomeParams()
      │   └─ "https://example.com/?category1=생활&current=1"
      ├─ window.history.pushState()
      └─ handleRouteChange()
          ↓
// 4. 라우트 처리
handleRouteChange()
  ├─ parseRoute() → { name: "home" }
  ├─ applyHomeQueryParams()
  │   └─ state.selectedCategory1 = "생활"
  ├─ ensureCategoriesLoadedService()
  ├─ loadProductsService()
  └─ render()
      └─ renderHomeView()
          └─ 필터링된 상품 목록 렌더링
```

---

### 시나리오 3: 브라우저 뒤로가기

#### 전체 흐름도

```
[사용자가 브라우저 뒤로가기 버튼 클릭]
        │
        ▼
[브라우저가 자동으로 이전 URL로 변경]
        │
        ▼
[popstate 이벤트 발생]
        │
        ▼
[handleRouteChange() 호출]
        │
        ├─ closeCartModalWrapper()
        │   └─ 장바구니 모달 닫기
        │
        ├─ parseRoute()
        │   └─ 변경된 URL 파싱
        │       예: "/product/85067212996" → { name: "detail", params: { productId: "85067212996" } }
        │
        ├─ [라우트별 처리]
        │   ├─ "detail" → loadProductDetailService()
        │   ├─ "home" → applyHomeQueryParams() → loadProductsService()
        │   └─ "not_found" → renderNotFound()
        │
        └─ render()
            └─ 이전 화면 렌더링
```

#### Step 1: 사용자 액션

**사용자가 브라우저 뒤로가기 버튼 클릭**

- 브라우저가 자동으로 이전 URL로 변경
- 예: `/product/86940857379` → `/product/85067212996`

#### Step 2: popstate 이벤트 발생

**코드 위치: `src/main.js` (254-256줄)**

```javascript
window.addEventListener("popstate", () => {
  handleRouteChange();
});
```

**동작:**

- 브라우저가 `popstate` 이벤트 발생
- `handleRouteChange()` 자동 호출

**popstate 이벤트 특징:**

- `pushState()` 또는 `replaceState()` 호출 시 발생하지 않음
- 브라우저의 뒤로가기/앞으로가기 버튼 클릭 시에만 발생
- 브라우저가 자동으로 URL 변경 후 이벤트 발생

#### Step 3: 라우트 처리

**코드 위치: `src/main.js` (216-248줄)**

```javascript
async function handleRouteChange() {
  // Step 3-1: 장바구니 모달 닫기
  closeCartModalWrapper();

  // Step 3-2: 변경된 URL 파싱
  state.route = parseRoute();
  // 현재 URL: "https://example.com/product/85067212996"
  // parseRoute() 결과: { name: "detail", params: { productId: "85067212996" } }

  // Step 3-3: 라우트별 처리
  if (state.route.name === "detail") {
    await loadProductDetailService(state.route.params.productId, render, () => showToast(errorAlert));
    return;
  }

  if (state.route.name !== "home") {
    // 404 페이지 처리
    resetHomeShell();
    state.detail = createInitialDetailState();
    state.isLoadingProducts = false;
    state.productsError = null;
    render();
    return;
  }

  // 홈 페이지 처리
  applyHomeQueryParams();
  state.detail = createInitialDetailState();

  render();

  await ensureCategoriesLoadedService(render, () => showToast(errorAlert));
  await loadProductsService({ append: false }, render, () => showToast(errorAlert), updateHomeUrlParams);
}
```

**동작:**

1. **장바구니 모달 닫기**: 라우트 변경 시 모달 자동 닫기
2. **URL 파싱**: 변경된 URL에서 라우트 정보 추출
3. **라우트별 처리**: 라우트에 맞는 데이터 로드 및 화면 렌더링

#### 코드 실행 순서

```javascript
// 1. 사용자 액션
브라우저 뒤로가기 버튼 클릭
  ↓
// 2. 브라우저 URL 변경
"/product/86940857379" → "/product/85067212996"
  ↓
// 3. popstate 이벤트 발생
window.addEventListener("popstate", handleRouteChange)
  ↓
// 4. 라우트 처리
handleRouteChange()
  ├─ parseRoute()
  │   └─ { name: "detail", params: { productId: "85067212996" } }
  ├─ loadProductDetailService()
  └─ render()
      └─ renderDetailView()
          └─ 이전 상품 상세 페이지 렌더링
```

#### pushState vs popstate 비교

**pushState() 호출 시:**

```javascript
navigateToDetail("123");
  → window.history.pushState()
  → URL 변경: "/product/123"
  → popstate 이벤트 발생 안 함 (직접 호출 필요)
  → onRouteChange() 콜백 호출
    → handleRouteChange()
```

**popstate 이벤트 발생 시:**

```javascript
브라우저 뒤로가기 버튼 클릭
  → 브라우저 URL 변경: "/product/123"
  → popstate 이벤트 자동 발생
  → handleRouteChange() 자동 호출
```

**차이점:**

- `pushState()`: 프로그래밍 방식으로 URL 변경, 이벤트 발생 안 함
- `popstate`: 브라우저 히스토리 변경 시 자동 발생

---

## 라우터 사용 예제

### 예제 1: 상품 상세 페이지로 이동

**코드 위치: `src/main.js` (164-166줄)**

```javascript
function navigateToDetail(productId) {
  navigateToDetailService(productId, handleRouteChange);
}
```

**실제 호출:**

```javascript
// 상품 카드 클릭 시
navigateToDetail("85067212996");
// 결과: URL이 "/product/85067212996"로 변경되고 상세 페이지 렌더링
```

### 예제 2: 홈 페이지로 이동 (필터 포함)

**코드 위치: `src/main.js` (168-170줄)**

```javascript
function navigateToHome({ replace = false, category1, category2, current, search } = {}) {
  navigateToHomeService({ replace, category1, category2, current, search }, buildHomeUrlWithParams, handleRouteChange);
}
```

**실제 호출:**

```javascript
// 카테고리 선택 시
navigateToHome({ category1: "생활", category2: "생활용품", current: 1 });
// 결과: URL이 "/?category1=생활&category2=생활용품&current=1"로 변경되고 필터링된 상품 목록 표시

// 검색어 포함
navigateToHome({ search: "검색어", current: 1 });
// 결과: URL이 "/?search=검색어&current=1"로 변경되고 검색 결과 표시
```

### 예제 3: URL 직접 접근

**사용자가 브라우저 주소창에 직접 입력:**

```
https://example.com/product/85067212996
```

**처리 흐름:**

1. 페이지 로드 시 `main()` 함수 실행
2. `initializeState(parseRoute())` 호출
3. `parseRoute()`가 URL 파싱 → `{ name: "detail", params: { productId: "85067212996" } }`
4. `handleRouteChange()` 호출
5. `loadProductDetailService()`로 상품 데이터 로드
6. `render()`로 상세 페이지 렌더링

---

## 핵심 개념 정리

### 1. SPA (Single Page Application)

- **정의**: 단일 HTML 페이지에서 JavaScript로 화면 전환을 처리하는 웹 애플리케이션
- **장점**: 빠른 화면 전환, 부드러운 사용자 경험
- **구현**: History API를 사용하여 URL 변경 + DOM 조작

### 2. History API

- **`pushState()`**: 히스토리에 새 항목 추가 (뒤로가기 가능)
- **`replaceState()`**: 현재 히스토리 항목 교체 (뒤로가기 불가)
- **`popstate` 이벤트**: 브라우저 히스토리 변경 감지

### 3. URL 파싱

- **경로 파라미터**: `/product/123` → `{ productId: "123" }`
- **쿼리 파라미터**: `/?category1=생활&search=검색어` → `{ category1: "생활", search: "검색어" }`

### 4. BASE_URL 처리

- **목적**: 서브디렉터리 배포 환경 지원
- **예시**: `/shop/product/123` → BASE_URL(`/shop/`) 제거 → `product/123`

### 5. 콜백 패턴

- **목적**: 라우트 변경 후 자동으로 화면 업데이트
- **구현**: `onRouteChange` 콜백 함수 전달

---

## 코드 참조 가이드

### 라우터 서비스 코드 위치

- **핵심 로직**: `src/services/routerService.js`
- **URL 파라미터 관리**: `src/services/urlService.js`
- **라우터 초기화**: `src/main.js` (250-259줄)
- **라우트 처리**: `src/main.js` (216-248줄)

### 주요 함수 위치

- **`parseRoute()`**: `src/services/routerService.js` (5-33줄)
- **`buildUrl()`**: `src/services/routerService.js` (40-45줄)
- **`navigateToDetail()`**: `src/services/routerService.js` (52-58줄)
- **`navigateToHome()`**: `src/services/routerService.js` (71-92줄)
- **`handleRouteChange()`**: `src/main.js` (216-248줄)

### 이벤트 핸들러 위치

- **상품 카드 클릭**: `src/handlers/productHandlers.js` (6-22줄)
- **헤더 네비게이션**: `src/handlers/navigationHandlers.js` (13-36줄)
- **상세 페이지 네비게이션**: `src/handlers/detailHandlers.js` (9-38줄)

---

## 실전 활용 팁

### 1. 새로운 라우트 추가하기

**예시: 장바구니 페이지 추가**

```javascript
// src/services/routerService.js
export function parseRoute() {
  // ... 기존 코드 ...

  const cartMatch = pathname.match(/^cart$/);
  if (cartMatch) {
    return { name: "cart" };
  }

  // ... 기존 코드 ...
}

export function navigateToCart(onRouteChange) {
  const cartUrl = buildUrl("cart");
  window.history.pushState({}, "", cartUrl.toString());
  if (onRouteChange) {
    onRouteChange();
  }
}
```

### 2. 동적 파라미터 처리

**예시: 카테고리 페이지 추가**

```javascript
// src/services/routerService.js
export function parseRoute() {
  // ... 기존 코드 ...

  const categoryMatch = pathname.match(/^category\/([^/]+)\/([^/]+)$/);
  if (categoryMatch) {
    return {
      name: "category",
      params: {
        category1: decodeURIComponent(categoryMatch[1]),
        category2: decodeURIComponent(categoryMatch[2]),
      },
    };
  }

  // ... 기존 코드 ...
}
```

### 3. 라우트 가드 추가

**예시: 인증 필요 페이지**

```javascript
// src/services/routerService.js
export function navigateToDetail(productId, onRouteChange) {
  // 인증 체크
  if (!isAuthenticated()) {
    navigateToHome({}, buildHomeUrlWithParams, onRouteChange);
    return;
  }

  // ... 기존 코드 ...
}
```

---

## 문제 해결 가이드

### 문제 1: 뒤로가기가 작동하지 않음

**원인**: `popstate` 이벤트 리스너가 등록되지 않음
**해결**: `src/main.js`의 `main()` 함수에서 이벤트 리스너 확인

### 문제 2: BASE_URL이 올바르게 처리되지 않음

**원인**: `parseRoute()` 또는 `buildUrl()`에서 BASE_URL 처리 로직 오류
**해결**: `src/services/routerService.js`의 BASE_URL 정규화 로직 확인

### 문제 3: URL 파라미터가 복원되지 않음

**원인**: `applyHomeQueryParams()`가 호출되지 않음
**해결**: `src/main.js`의 `handleRouteChange()` 함수에서 `applyHomeQueryParams()` 호출 확인

### 문제 4: 새로고침 시 라우트가 복원되지 않음

**원인**: `main()` 함수에서 초기 라우트 파싱이 안 됨
**해결**: `src/main.js`의 `main()` 함수에서 `initializeState(parseRoute())` 호출 확인

---

## 마무리

이 라우터 서비스는 **단순하고 효율적인 SPA 라우팅 시스템**입니다. 복잡한 라우터 라이브러리 없이도 브라우저의 History API를 활용하여 완전한 SPA 네비게이션을 구현했습니다.

### 핵심 요약

1. **History API**: `pushState()`, `replaceState()`, `popstate` 이벤트
2. **URL 파싱**: 정규식을 사용한 경로 매칭
3. **BASE_URL 지원**: 서브디렉터리 배포 환경 지원
4. **콜백 패턴**: 라우트 변경 후 자동 화면 업데이트
5. **쿼리 파라미터**: URL과 state 동기화

### 추가 학습 자료

- [MDN - History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
- [MDN - URL API](https://developer.mozilla.org/en-US/docs/Web/API/URL)
- [Vite - BASE_URL](https://vitejs.dev/guide/build.html#public-base-path)

---

**작성일**: 2025-01-XX  
**버전**: 1.0.0  
**작성자**: AI Assistant
