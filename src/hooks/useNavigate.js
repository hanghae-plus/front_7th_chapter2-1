import { Router } from "../core/router/router";

export function useNavigate() {
  return {
    push: (path) => {
      history.pushState(null, "", path);
      Router.getInstance().route();
    },
    replace: (path) => {
      history.replaceState(null, "", path);
      Router.getInstance().route();
    },
  };
}
