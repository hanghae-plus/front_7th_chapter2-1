import { router } from "../router/Router.js";

/**
 * URL에서 필터와 페이지네이션 상태를 읽어옴
 */
export const getStateFromURL = () => {
  const queryParams = router.getQueryParams();

  return {
    filters: {
      search: queryParams.search || "",
      category1: queryParams.category1 || "",
      category2: queryParams.category2 || "",
      sort: queryParams.sort || "price_asc",
    },
    pagination: {
      page: parseInt(queryParams.current || "1", 10), // URL에서는 current 사용
      limit: parseInt(queryParams.limit || "20", 10),
    },
  };
};

/**
 * 현재 필터와 페이지네이션 상태를 URL에 반영
 * @param {Object} filters
 * @param {Object} pagination
 */
export const syncStateToURL = (filters, pagination) => {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.category1) params.set("category1", filters.category1);
  if (filters.category2) params.set("category2", filters.category2);
  if (filters.sort && filters.sort !== "price_asc") params.set("sort", filters.sort);

  if (pagination.page > 1) params.set("current", pagination.page);
  if (pagination.limit !== 20) params.set("limit", pagination.limit);

  const queryString = params.toString();
  const basePath = router.basePath === "/" ? "" : router.basePath;
  const currentPath = router.getPath();
  const newURL = basePath + currentPath + (queryString ? "?" + queryString : "");

  const currentURL = window.location.pathname + window.location.search;
  if (currentURL !== newURL) {
    window.history.replaceState(null, "", newURL);
  }
};

export const isStateEqual = (state1, state2) => {
  return (
    state1.filters.search === state2.filters.search &&
    state1.filters.category1 === state2.filters.category1 &&
    state1.filters.category2 === state2.filters.category2 &&
    state1.filters.sort === state2.filters.sort &&
    state1.pagination.page === state2.pagination.page &&
    state1.pagination.limit === state2.pagination.limit
  );
};
