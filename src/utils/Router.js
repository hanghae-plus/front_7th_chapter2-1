import { NotFoundPage } from "../pages/NotFoundPage";

export class Router {
  constructor() {
    this.routes = {};
    window.addEventListener("popstate", this.handlePopState.bind(this));
  }

  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  navigateTo(path) {
    history.pushState(null, "", path);
    this.handleRoute(path);
  }

  handlePopState() {
    const productId = (location.pathname ?? "").split("/")[2];
    const newPathName = productId ? "/product/:productId" : location.pathname;
    this.handleRoute(newPathName);
  }

  handleRoute(path) {
    const handler = this.routes[path];
    if (handler) {
      handler();
    } else {
      const $root = document.querySelector("#root");
      $root.innerHTML = NotFoundPage();
      console.log("404 Not Found");
    }
  }
}
