import ErrorPage from "../pages/ErrorPage.js";
import { routes } from "./routes.js";

// 라우트 패턴과 실제 경로를 비교해 동적 파라미터를 추출합니다.
const matchPath = (pattern, pathname) => {
  // 불필요한 빈 세그먼트 제거
  const patternSegments = pattern.split("/").filter(Boolean);
  const pathSegments = pathname.split("/").filter(Boolean);
  if (patternSegments.length !== pathSegments.length) return null;

  const params = {};

  for (let index = 0; index < patternSegments.length; index += 1) {
    const patternSegment = patternSegments[index];
    const pathSegment = pathSegments[index];

    if (patternSegment.startsWith(":")) {
      params[patternSegment.slice(1)] = decodeURIComponent(pathSegment);
      continue;
    }

    if (patternSegment !== pathSegment) return null;
  }

  return params;
};

export const renderRoute = async () => {
  const $root = document.getElementById("root");
  if (!$root) return;

  let cleanup = null;

  const { pathname } = window.location;

  for (const route of routes) {
    const params = matchPath(route.path, pathname);
    if (!params) continue;

    try {
      const { html, init } = await route.render({ params, path: pathname });
      $root.innerHTML = html;
      if (typeof init === "function") {
        cleanup = init(); // 필요하면 cleanup 함수 반환
      }
    } catch (error) {
      console.error("라우트 렌더링 실패", error);
      $root.innerHTML = ErrorPage();
    }

    return cleanup;
  }

  $root.innerHTML = ErrorPage();
};

export const navigate = (path) => {
  if (window.location.pathname === path) {
    return renderRoute();
  }

  window.history.pushState({}, "", path);
  return renderRoute();
};

window.addEventListener("popstate", () => {
  renderRoute();
});
