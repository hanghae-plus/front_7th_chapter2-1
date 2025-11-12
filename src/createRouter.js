import { createObserver } from "./createObserver";

export const createRouter = () => {
  const { notify, subscribe } = createObserver();

  const push = (path) => {
    const prevPath = window.location.pathname;
    const nextUrl = new URL(path, window.location.origin);

    history.pushState(null, "", path);
    const isQueryOnly = prevPath === nextUrl.pathname;

    notify({ isQueryOnly });
  };

  const setup = () => {
    window.addEventListener("popstate", () => {
      const prevPath = window.location.pathname;
      const currentUrl = new URL(window.location.href);
      const isQueryOnly = prevPath === currentUrl.pathname;

      notify({ isQueryOnly }); // ✅ popstate도 동일하게 처리
    });
  };
  return {
    get path() {
      return window.location.pathname;
    },
    push,
    setup,
    subscribe,
  };
};
