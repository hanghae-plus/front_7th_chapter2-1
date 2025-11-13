import { Router } from "../core/router/router";

export function useNavigate() {
  const router = Router.getInstance();
  const basePath = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

  return {
    push: (path) => {
      const fullPath = `${basePath}${path}`;
      history.pushState(null, "", fullPath);
      router.route();
    },
    replace: (path) => {
      const fullPath = `${basePath}${path}`;
      history.replaceState(null, "", fullPath);
      router.route();
    },
  };
}
