import { Router } from "../core/router/router";

export function useParams() {
  return Router.getInstance().getParams();
}
