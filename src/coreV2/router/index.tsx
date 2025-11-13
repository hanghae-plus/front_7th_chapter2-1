import { DomNode } from "@core/jsx/factory";
import { useEffect } from "@core/state/useEffect";
import { useMemo } from "@core/state/useMemo";
import { useState } from "@core/state/useState";
import { cloneDeep, isNil, isNotNil } from "es-toolkit";
import qs from "query-string";
import { useGlobalState } from "@core/state/useGlobalState";
import { renderTree } from "@core/render";
import { cleanup } from "@core/render/cleanup";

export type Route = {
  path: string;
  component: (...args: any[]) => DomNode;
};

type RouterProps = {
  fallback: {
    notFound: () => DomNode;
    error: (error: unknown) => DomNode;
  };
};

export function createRouter<Routes extends Record<string, any>>(
  routes: Routes,
) {
  function useInternalRouter<RouteName extends keyof Routes = keyof Routes>() {
    const [route, setRoute] = useGlobalState<RouteName | undefined>(
      "route",
      detectCurrentRoute(routes) as RouteName | undefined,
    );

    if (isNil(route)) {
      return {
        route: undefined as unknown as RouteName,
        pathParams: {} as Record<string, string>,
        queryParams: {} as Record<string, string>,
        push: (() => {}) as <NextRouteName extends keyof Routes>(
          routeName: NextRouteName,
          options?: {
            pathParams?: Record<string, string>;
            queryParams?: Record<string, string>;
          },
        ) => void,
        replace: (() => {}) as <NextRouteName extends keyof Routes>(
          routeName: NextRouteName,
          options?: {
            pathParams?: Record<string, string>;
            queryParams?: Record<string, string>;
          },
        ) => void,
        back: () => {},
        forward: () => {},
      };
    }

    const path = useMemo(() => routes[route].path, [route]);

    const pathParams = useMemo<Record<string, string>>(
      () => extractPathParams(path) as Record<string, string>,
      [path],
    );
    const queryParams = useMemo<Record<string, string>>(
      () => qs.parse(window.location.search) as Record<string, string>,
      [window.location.search],
    );

    console.log(queryParams);

    const [error, setError] = useGlobalState<unknown>("error", null);

    const push = <NextRouteName extends keyof Routes>(
      routeName: NextRouteName,
      options?: {
        pathParams?: Record<string, string>;
        queryParams?: Record<string, string>;
      },
    ) => {
      const url = getUrl(routes, routeName, options);
      window.history.pushState({}, "", url);
      // cleanup();
      renderTree.tree = null;

      setRoute(routeName as unknown as RouteName);
    };

    const replace = <NextRouteName extends keyof Routes>(
      routeName: NextRouteName,
      options?: {
        pathParams?: Record<string, string>;
        queryParams?: Record<string, string>;
      },
    ) => {
      const url = getUrl(routes, routeName, options);
      window.history.replaceState({}, "", url);
      // cleanup();
      renderTree.tree = null;

      setRoute(routeName as unknown as RouteName);
    };

    const back = () => {
      window.history.back();
      // cleanup();
      renderTree.tree = null;
      setRoute(detectCurrentRoute(routes) as RouteName);
    };

    const forward = () => {
      window.history.forward();
      // cleanup();
      setRoute(detectCurrentRoute(routes) as RouteName);
    };

    useEffect(() => {
      window.addEventListener("popstate", () => {
        // cleanup();
        renderTree.tree = null;
        setRoute(detectCurrentRoute(routes) as RouteName);
      });

      window.addEventListener("unhandledrejection", (event) => {
        // cleanup();
        setError(event.reason);
      });

      window.addEventListener("error", (event) => {
        // cleanup();
        console.log("error", event.error);
        if (event.error === error) return;

        setError(event.error);
      });
    }, []);

    return {
      route,
      error,
      pathParams,
      queryParams,
      push,
      replace,
      back,
      forward,
    };
  }

  function useRouter(): ReturnType<typeof useInternalRouter> {
    return (window as any).__router;
  }

  function Router({ fallback }: RouterProps) {
    const router = useInternalRouter();
    const { route, error, pathParams, queryParams } = router;

    if (isNotNil(error)) {
      return fallback.error(error);
    }

    if (isNil(route)) {
      return fallback.notFound();
    }

    const RouteComponent = routes[route].component;

    (window as any).__router = router;

    return (
      <>
        <div>
          <RouteComponent
            pathParams={pathParams as Record<string, string>}
            queryParams={queryParams as Record<string, string>}
          />
        </div>
      </>
    );
  }

  return {
    Router,
    useRouter,
  };
}

function applyPathParams(path: string, pathParams: Record<string, string>) {
  return path.replace(/:(\w+)/g, (match, p1) => pathParams[p1] ?? match);
}

function extractPathParams(path: string) {
  const splittedWindowPath = window.location.pathname.split("/");
  const result: Record<string, string> = {};

  for (const [idx, token] of path.split("/").entries()) {
    if (token.startsWith(":")) {
      result[token.slice(1)] = splittedWindowPath[idx];
    }
  }

  return result;
}

function detectCurrentRoute<Routes extends Record<string, Route>>(
  routes: Routes,
): keyof Routes | undefined {
  const splittedPath = window.location.pathname.split("/");

  return Object.entries(routes).find(([_, route]) =>
    route.path
      .split("/")
      .every(
        (token, idx) =>
          token === splittedPath[idx] ||
          (token.startsWith(":") && isNotNil(splittedPath[idx])),
      ),
  )?.[0];
}

export function getUrl<Routes extends Record<string, Route>>(
  routes: Routes,
  routeName: keyof Routes,
  options?: {
    pathParams?: Record<string, string>;
    queryParams?: Record<string, string>;
  },
) {
  const route = routes[routeName];
  const appliedPath = applyPathParams(route.path, options?.pathParams ?? {});
  const queryString = qs.stringify(options?.queryParams ?? {});
  return `${appliedPath}${queryString === "" ? "" : `?${queryString}`}`;
}
