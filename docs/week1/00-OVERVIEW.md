# Week 1: 프레임워크 없이 SPA 만들기

> **목표**: React나 Vue 없이 바닐라 JavaScript로 실용적인 SPA를 구현하며, 프레임워크가 해결하는 문제를 직접 경험합니다.

## 📋 이번주 목표

### 핵심 요구사항
- ✅ **URL 기반 라우팅** - 새로고침 없는 페이지 전환
- ✅ **상태 유지** - URL 쿼리, localStorage 활용
- ✅ **이벤트 기반 렌더링** - 효율적인 DOM 업데이트
- ✅ **테스트 통과** - e2e 테스트 100% 통과

### 구현할 기능
1. **상품 목록** - 검색, 필터, 정렬, 무한 스크롤
2. **상품 상세** - 동적 라우팅, 관련 상품
3. **장바구니** - 모달, CRUD, 로컬 저장
4. **카테고리** - 계층 구조, 브레드크럼
5. **사용자 피드백** - 토스트, 로딩 상태

---

## 🏗️ 프로젝트 구조

```
src/
├── core/                    # 핵심 유틸리티
│   ├── observer.js         # ⭐ Observer 패턴 (핵심!)
│   ├── router.js           # Observer 기반 라우팅
│   ├── store.js            # Observer 기반 상태 관리
│   └── storage.js          # localStorage 래퍼
│
├── utils/                   # 헬퍼 함수
│   ├── dom.js              # DOM 조작 유틸
│   ├── debounce.js         # 디바운스
│   └── formatters.js       # 데이터 포맷팅
│
├── components/              # 재사용 가능한 UI
│   ├── common/
│   │   ├── Toast.js        # 토스트 메시지
│   │   ├── LoadingSpinner.js
│   │   └── Modal.js
│   ├── product/
│   │   ├── ProductCard.js
│   │   └── ProductGrid.js
│   └── cart/
│       ├── CartModal.js
│       └── CartItem.js
│
├── pages/                   # 페이지 컴포넌트
│   ├── HomePage.js
│   ├── DetailPage.js
│   └── NotFoundPage.js
│
├── state/                   # 상태 관리
│   └── store.js            # 앱 전역 Store
│
├── api/                     # API 호출
│   └── productApi.js
│
└── main.js                  # 진입점
```

---

## 🎯 개발 원칙

### 1. 단순함 우선 (Keep It Simple)
```javascript
// ✅ Good - 직관적이고 명확
const navigate = (path) => {
  history.pushState(null, '', path);
  render();
};

// ❌ Bad - 과도한 추상화
class RouterManager {
  #history;
  #middleware = [];
  navigate(path, options = {}) { ... }
}
```

### 2. 테스트 통과가 최우선
- 아키텍처보다 **동작하는 코드** 먼저
- 리팩토링은 테스트 통과 후

### 3. 다음주를 위한 준비
- 깔끔한 코드 작성 (네이밍, 함수 분리)
- 다음주에 React 패턴으로 쉽게 전환 가능하도록

---

## 📚 학습 단계 (우선순위 기반)

> **핵심**: Router + Store + Lifecycle 이 3가지만 제대로 구현하면 나머지는 일사천리! 🔥

### 🔥 Phase 1: 핵심 시스템 (필수, 9시간)

#### Step 1: Observer 패턴 (1시간) ⭐⭐⭐
- [ ] `createObserver()` 구현
- [ ] subscribe/notify 패턴 이해

**목표**: Router와 Store의 기반이 되는 Observer 패턴 구축

#### Step 2: Router 시스템 (3시간) ⭐⭐⭐
- [ ] Observer 기반 Router 구현
- [ ] `router.setup()` - 선언형 라우팅 설정
- [ ] `router.subscribe()` - 자동 렌더링
- [ ] `router.push()` - 프로그래밍 방식 네비게이션
- [ ] URL 파라미터/쿼리 관리

**목표**: 새로고침 없이 페이지 전환 + 자동 렌더링

#### Step 3: Store 시스템 (2시간) ⭐⭐⭐
- [ ] Observer 기반 Store 구현
- [ ] loading/error/data 패턴
- [ ] `store.dispatch()` - 액션 시스템
- [ ] `store.subscribe()` - 자동 렌더링

**목표**: 상태 변경 시 자동 UI 업데이트

#### Step 4: Lifecycle 시스템 (3시간) ⭐⭐⭐
- [ ] `withLifecycle` HOC 구현
- [ ] mount 훅 - 컴포넌트 초기화
- [ ] watch 패턴 - 반응형 데이터
- [ ] unmount 훅 - 정리 작업

**목표**: 컴포넌트 생명주기 관리

✅ **여기까지만 해도 실용적인 SPA 완성!**

---

### Phase 2: 추가 기능 (선택, 3-5시간)

#### Step 5: 무한 스크롤 & 최적화
- [ ] IntersectionObserver
- [ ] DocumentFragment
- [ ] Debounce/Throttle

#### Step 6: 나머지 UI
- [ ] 토스트, 모달
- [ ] 로딩 스피너
- [ ] 에러 처리

---

## 🚀 시작하기

### 1. 첫 번째 작업
```bash
# 1. 핵심 유틸리티 만들기
touch src/core/observer.js   # ⭐ 가장 먼저!
touch src/core/router.js
touch src/core/store.js

# 2. NotFoundPage 만들기
touch src/pages/NotFoundPage.js

# 3. main.js 리팩토링
```

### 2. 다음 단계
- [01-ARCHITECTURE.md](./01-ARCHITECTURE.md) - 아키텍처 설계 (Observer 패턴)
- [02-CODING-STYLE.md](./02-CODING-STYLE.md) - 코딩 스타일 가이드
- [03-IMPLEMENTATION-GUIDE.md](./03-IMPLEMENTATION-GUIDE.md) - 단계별 구현 방법
- [04-LIFECYCLE-SYSTEM.md](./04-LIFECYCLE-SYSTEM.md) - 라이프사이클 시스템

---

## 📖 참고 자료

### MDN 문서
- [History API](https://developer.mozilla.org/ko/docs/Web/API/History_API)
- [URLSearchParams](https://developer.mozilla.org/ko/docs/Web/API/URLSearchParams)
- [IntersectionObserver](https://developer.mozilla.org/ko/docs/Web/API/Intersection_Observer_API)
- [DocumentFragment](https://developer.mozilla.org/ko/docs/Web/API/DocumentFragment)

### 학습 포인트
- 왜 React Router가 필요한지
- 왜 useState/useEffect가 필요한지
- 왜 Virtual DOM이 필요한지

---

**다음**: [01-ARCHITECTURE.md - 아키텍처 설계](./01-ARCHITECTURE.md) →
