import { NotFoundPage } from "../pages/NotFoundPage";

function convertToRegex(routePattern) {
  // 1. 문자열의 시작과 끝에서 슬래시를 이스케이프하고 시작/끝 앵커를 추가합니다.
  //    정규 표현식의 시작(^)과 끝($)을 설정합니다.
  let regexString = routePattern.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"); // 정규 표현식 특수 문자를 모두 이스케이프

  // 2. 동적 경로 매개변수(:paramName) 부분을 정규 표현식으로 대체합니다.
  //    :postId -> ([\w]+) 또는 ([\w\-]+) 등으로 확장 가능
  //    여기서는 제시하신 대로 단어 문자(숫자, 문자, 언더바)를 의미하는 \w+를 사용합니다.
  regexString = regexString.replace(/:(\w+)/g, "([\\w]+)");

  // 3. 시작 앵커와 끝 앵커를 추가하여 전체 경로 일치를 강제합니다.
  regexString = `^${regexString}$`;

  // 4. 최종 정규 표현식 객체를 생성하여 반환합니다.
  return new RegExp(regexString);
}

export const convertToRelativePath = (pathName) => {
  const basePath = import.meta.env.BASE_URL;
  return pathName.replace(basePath, "/").replace(/^\?.+/, "").replace(/\/$/, "") || "/";
};

export const getQueryStringExcluding = (keyToExclude) => {
  const currentParams = new URLSearchParams(window.location.search);
  const newParams = new URLSearchParams();

  for (const [key, value] of currentParams.entries()) {
    if (key !== keyToExclude) {
      newParams.append(key, value);
    }
  }

  const newQueryString = "?" + newParams.toString();
  return newParams.toString() ? newQueryString : "";
};

export class Router {
  constructor($container) {
    this.routes = {};
    this._routesArray = [];
    this.$container = $container;
    window.addEventListener("popstate", this.handlePopState.bind(this));
  }

  addRoute(path, handler) {
    const regexPath = convertToRegex(path);
    this.routes[regexPath] = handler;
    this._routesArray.push(regexPath);
  }

  navigateTo(path) {
    history.pushState(null, "", path);
    this.handleRoute(path);
  }

  handlePopState() {
    this.handleRoute(location.pathname);
  }

  handleRoute(pathName) {
    const relativePath = convertToRelativePath(pathName);
    const matchedParam = this._routesArray.find((route) => route.test(relativePath));
    const handler = this.routes[matchedParam];
    if (handler) {
      handler();
    } else {
      this.$container.innerHTML = NotFoundPage();
      console.log("404 Not Found");
    }
  }
}
