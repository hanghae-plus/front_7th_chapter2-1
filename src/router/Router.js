export class Router {
  constructor(routes = [], basePath = "/") {
    this.routes = routes;
    this.currentRoute = null;
    this.basePath = basePath;
    // search랑 searchParams는 같은 값을 가지고 있음
    // params랑 queryParams는 같은 값을 가지고 있음? 아님
    // queryParams 값은 뭐지?
    this.params = {};
    this.queryParams = {};
  }

  init() {}
  // getUrl() {
  //   const url = new URL(window.location.href);
  //   console.log(url);
  // }

  // constructor() {
  //   this.routes = {
  //     "/": () => renderHomePage(),
  //     "/about": () => renderAboutPage(),
  //     "/contact": () => renderContactPage(),
  //     "/user/:id": (id) => renderUserProfile(id),
  //     "/post/:id": (id) => renderPost(id),
  //   };
  // }
  // addRoute(path, component) {
  //   routes[path] = component;
  // }
  // navigate(path) {
  //   const component = routes[path] || routes["404"];
  //   // document.getElementById("app").innerHTML = component();
  //   handler();
  // }
  // init() {
  //   window.addEventListener("hashchange", () => {
  //     const path = window.location.hash.slice(1) || "/";
  //     navigate(path);
  //   });
  //   // 초기 라우트 처리
  //   navigate(window.location.hash.slice(1) || "/");
  // }
}

// const router = () => {
//   const path = window.location.hash.slice(1) || "/";
//   const route = routes[path];
//   route();

//   //  const [route, ...params] = path.split("/");
//   //  const handler = routes[`/${route}/:id`];
//   //  if (handler) {
//   //    handler(...params);
//   //  }
// };

// // 사용
// Router.addRoute("/", () => "<h1>Home Page</h1>");
// Router.addRoute("/about", () => "<h1>About Page</h1>");
// Router.addRoute("404", () => "<h1>404 Not Found</h1>");
// Router.init();

// // 사용 예
// Router.addRoute("/", () => {
//   document.body.innerHTML = "<h1>Home Page</h1>";
// });

// Router.addRoute("/about", () => {
//   document.body.innerHTML = "<h1>About Page</h1>";
// });

// Router.addRoute("404", () => {
//   document.body.innerHTML = "<h1>404 Not Found</h1>";
// });

// Router.init();

// window.addEventListener("hashchange", router);
// window.addEventListener("load", router);

// ------------------------------------------------------------

// // 콜백
// function route(path, callback) {
//   if (window.location.pathname === path) {
//     callback();
//   }
// }

// function loadContent(elementId, content) {
//   document.getElementById(elementId).innerHTML = content;
// }

// route("/", () => {
//   loadContent("app", "<h1>Home Page</h1>");
// });

// route("/about", () => {
//   loadContent("app", "<h1>About Page</h1>");
// });

// // 페이지 로드 시 라우팅 실행
// window.addEventListener("load", () => {
//   route("/", () => {
//     loadContent("app", "<h1>Home Page</h1>");
//   });
// });

// ------------------------------------------------------------

// // 커스텀 에러
// class RouteNotFoundError extends Error {
//   constructor(path) {
//     super(`Route not found: ${path}`);
//     this.name = "RouteNotFoundError";
//     this.path = path;
//   }
// }

// const routes = {
//   "/": () => "<h1>Home Page</h1>",
//   "/about": () => "<h1>About Page</h1>",
//   "/contact": () => "<h1>Contact Page</h1>",
// };

// function router(path) {
//   try {
//     if (routes[path]) {
//       document.getElementById("app").innerHTML = routes[path]();
//     } else {
//       throw new RouteNotFoundError(path);
//     }
//   } catch (error) {
//     document.getElementById("app").innerHTML =
//       error instanceof RouteNotFoundError
//         ? `<h1>404 - Page Not Found</h1><p>The requested page "${error.path}" does not exist.</p>`
//         : "<h1>An unexpected error occurred</h1>";

//     console.error(error);
//   }
// }

// window.addEventListener("hashchange", () => router(window.location.hash.slice(1)));
// router("/"); // 초기 라우트
