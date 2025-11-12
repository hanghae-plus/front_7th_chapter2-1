// src/router.js
class Router {
  constructor({ routes, rootId = "root" }) {
    this.routes = routes;
    this.root = document.getElementById(rootId);
    if (!this.root) throw new Error(`#${rootId} 엘리먼트를 찾을 수 없습니다.`);

    this.currentComponent = null;
    this.popState = this.popState.bind(this); // 이벤트 대상을 router 객체에 고정
  }

  init() {
    window.addEventListener("popstate", this.popState);
    this.push(window.location.pathname, { replace: true });
  }

  popState() {
    this.push(window.location.pathname, { replace: true });
  }

  match(path) {
    return this.routes[path] || this.routes["/404"];
    // 필요하면 /product/:id 같은 패턴 매칭 로직을 추가
  }

  push(path, { replace = false } = {}) {
    const matchedComponent = this.match(path);
    if (!matchedComponent) return;

    if (!replace) history.pushState(null, "", path);
    console.log("matchedComponent", matchedComponent());
    this.render(matchedComponent);
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
