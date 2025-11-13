# React 기반 SPA vs. 순수 JavaScript SPA 비교

## 1. 컴포넌트 구성 방식

- **React**:
  `function Header() { return <header>...</header>; }`처럼 JSX로 구조를 선언하고 `ReactDOM.render()`가 DOM 반영을 관리한다.
- **Vanilla JS (현재 프로젝트)**:
  `Header()`가 템플릿 리터럴 문자열을 반환하고, 상위에서 문자열 결합 후 `innerHTML`로 DOM에 주입한다.
- **차이점**:
  React는 선언적 렌더링과 Virtual DOM diff 덕분에 재렌더링 범위가 자동 조절되고, 현재 방식은 DOM 교체 범위를 직접 제어해야 한다.

## 2. 레이아웃과 공통 UI 추상화

- **React**:
  `<Layout><Header /><main>{children}</main><Footer /></Layout>`처럼 컴포넌트를 중첩해 구조화한다.
- **Vanilla JS**:
  `Layout({ top, main, bottom })` 형태로 문자열을 조합하며, 전달되지 않은 영역은 기본값으로 처리해야 한다.
- **차이점**:
  React는 children 전달이 자연스러우나, 현재 구조는 문자열 기반이라 props 기본값과 조합 로직을 직접 관리해야 한다.
