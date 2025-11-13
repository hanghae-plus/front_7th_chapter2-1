# 리팩토링 계획서

## 현재 상황
- `main.js`: 1666줄, 75개 함수
- 모든 로직이 단일 파일에 집중
- 기능 추가/수정 시 영향 범위가 넓음

## 리팩토링 전략

### 1단계: 상수와 유틸리티 분리 (낮은 위험)
- `src/utils/constants.js` - 상수들
- `src/utils/storage.js` - localStorage 관련
- `src/utils/dom.js` - DOM 유틸리티

### 2단계: 상태 관리 분리 (중간 위험)
- `src/state/appState.js` - state 객체와 상태 관리

### 3단계: 서비스 레이어 분리 (중간 위험)
- `src/services/cartService.js` - 장바구니 로직
- `src/services/productService.js` - 상품 로딩
- `src/services/routerService.js` - 라우팅
- `src/services/categoryService.js` - 카테고리

### 4단계: 렌더러 분리 (높은 위험)
- `src/renderers/homeRenderer.js`
- `src/renderers/detailRenderer.js`
- `src/renderers/cartRenderer.js`

### 5단계: 이벤트 핸들러 분리 (높은 위험)
- `src/handlers/productHandlers.js`
- `src/handlers/categoryHandlers.js`
- `src/handlers/cartHandlers.js`

## 리팩토링 원칙
1. **단계별 진행**: 한 번에 하나씩, 각 단계마다 테스트
2. **기능 유지**: 리팩토링 후 동일한 기능 보장
3. **점진적 마이그레이션**: 기존 코드를 바로 삭제하지 않고 단계적으로 교체
4. **테스트 우선**: E2E 테스트로 회귀 방지

## 예상 효과
- 가독성 향상: 파일당 100-300줄로 분리
- 유지보수성 향상: 변경 영향 범위 최소화
- 테스트 용이성: 모듈 단위 테스트 가능
- 재사용성 향상: 공통 로직 재사용 가능

