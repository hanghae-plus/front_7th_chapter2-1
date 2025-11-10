# 프로젝트 개요

- **프로젝트 이름**: `front-chapter1-1`
- **버전**: `0.0.0`
- **번들러/개발 서버**: Vite (`rolldown-vite`)
- **주요 언어**: 바닐라 JavaScript (`type: module`)
- **테스트/도구**: Playwright, Vitest, ESLint, Prettier, Husky, MSW

## 📦 패키지 스크립트

- `dev`: 개발 서버 실행
- `build`: 프로덕션 번들 빌드
- `preview`: 빌드 결과 미리보기 서버
- `test:e2e*`: Playwright 기반 E2E 테스트 스위트
- `lint:fix`, `prettier:write`: 코드 품질 자동화

## 🧱 디렉터리 구조

```
src/
├── api/
│   └── productApi.js          # 상품 데이터 조회 유틸
├── components/
│   ├── Footer.js
│   ├── Header.js
│   ├── ProductList.js
│   ├── SearchForm.js
│   └── index.js               # 컴포넌트 모듈 진입점
├── mocks/
│   ├── browser.js             # MSW 브라우저 워커 초기화
│   ├── handlers.js            # 상품 API 모킹 핸들러
│   └── items.json             # 상품 더미 데이터
├── pages/
│   ├── DetailPage.js
│   ├── HomPage.js
│   └── PageLayout.js
├── main.js                    # 애플리케이션 엔트리 포인트
├── setupTests.js
├── styles.css
└── template.js                # 템플릿/유틸 모음
```

## 🔗 라우팅 및 렌더링 흐름

- `src/main.js`에서 MSW 워커를 기동 후 `render()` 실행
- URL 경로에 따라 `HomePage` 혹은 `DetailPage` 템플릿을 동적으로 렌더링
- `history.pushState`, `popstate` 이벤트로 SPA 내비게이션 처리

## 🔍 데이터 소스

- `src/api/productApi.js`가 MSW 핸들러(`handlers.js`)와 연동
- `items.json`을 기반으로 목록/상세 데이터를 제공

## 🧪 품질 관리 도구

- ESLint + Prettier 조합으로 코드 스타일 검사 및 자동 수정
- Husky, lint-staged로 커밋 훅에서 포맷팅/린트 자동 실행
- Playwright로 E2E 시나리오 구성, 실패 자료는 `test-results/`에 수집

## 🌐 배포 방식

- GitHub Pages(`https://<username>.github.io/front-7th-chapter2-1/`)를 기본 배포 채널로 사용
- Vite `build` 산출물을 `gh-pages` 브랜치 혹은 GitHub Actions로 자동 배포하는 흐름 권장
