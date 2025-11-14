export const getQueryParams = () => {
  const searchParams = new URLSearchParams(location.search);
  const category1 = searchParams.get("category1");
  const category2 = searchParams.get("category2");
  const search = searchParams.get("search");
  const limit = +searchParams.get("limit");
  const sort = searchParams.get("sort");

  return {
    category1,
    category2,
    search,
    limit,
    sort,
    searchParams,
  };
};
