/**
 * 루트 요소에 컴포넌트 렌더링
 */
export const renderToRoot = (component) => {
  const $root = document.querySelector("#root");
  $root.innerHTML = component;
};

/**
 * 특정 선택자의 요소에 렌더링
 * @param {string} selector - CSS 선택자
 * @param {string} component - 렌더링할 HTML 문자열
 * @param {Object} options - 렌더링 옵션
 * @param {boolean} options.replace - true면 요소를 교체(outerHTML), false면 내부만 교체(innerHTML)
 */
export const renderTo = (selector, component, options = { replace: false }) => {
  const element = document.querySelector(selector);
  if (element) {
    if (options.replace) {
      element.outerHTML = component;
    } else {
      element.innerHTML = component;
    }
  }
};

