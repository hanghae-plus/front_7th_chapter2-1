import { BASE_URL } from "./constants";

// src/router.js
class Router {
  constructor({ routes, rootId = "root" }) {
    this.routes = routes;
    this.root = document.getElementById(rootId);
    if (!this.root) throw new Error(`#${rootId} 엘리먼트를 찾을 수 없습니다.`);

    this.currentComponent = null;
    this.popState = this.popState.bind(this); // 이벤트 대상을 router 객체에 고정
    this.handleLinkClick = this.handleLinkClick.bind(this);
  }

  init() {
    window.addEventListener("popstate", this.popState);
    document.addEventListener("click", this.handleLinkClick);
    this.push(window.location.pathname, { replace: true });
  }

  popState() {
    this.push(window.location.pathname, { replace: true });
  }

  match(path) {
    let exceptBaseUrl = path.replace(BASE_URL, "");

    // /product/:id 패턴 매칭 로직 추가
    const pathToRegex = /^\/product\/\d+$/;
    console.log(exceptBaseUrl, pathToRegex.test(exceptBaseUrl));
    if (pathToRegex.test(exceptBaseUrl)) {
      exceptBaseUrl = "/product/:id";
    }
    return this.routes[exceptBaseUrl] || this.routes["/404"];
  }

  push(path, { replace = false } = {}) {
    const matchedComponent = this.match(path);
    if (!matchedComponent) return;

    if (!replace) history.pushState(null, "", `${BASE_URL}${path}`);
    console.log("matchedComponent", matchedComponent());
    this.render(matchedComponent);
  }

  handleLinkClick(event) {
    const anchor = event.target.closest("a[data-link]");
    if (!anchor) return;
    event.preventDefault();

    const link = anchor.dataset.link || anchor.getAttribute("href") || "/";

    this.push(link.slice(BASE_URL.length) || "/", { replace: false });
  }

  render(matchedComponent) {
    if (this.currentComponent?.unmount) {
      this.currentComponent.unmount();
    }

    this.currentComponent = matchedComponent();

    const element = this.currentComponent.create();
    this.root.innerHTML = element;

    if (typeof this.currentComponent.mount === "function") {
      this.currentComponent.mount();
    }
  }
}

export default Router;
