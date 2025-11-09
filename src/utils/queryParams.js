export function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    limit: Number(params.get("limit")) || 20,
    sort: params.get("sort") || "price_asc",
    search: params.get("search") || "",
    category1: params.get("category1") || "",
    category2: params.get("category2") || "",
    page: Number(params.get("page")) || 1,
  };
}

export function updateQueryParams(newParams) {
  const params = new URLSearchParams(window.location.search);
  Object.entries(newParams).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  });
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({}, "", newUrl);
}
