import PageLayout from "../layouts/PageLayout";
import ProductList from "../components/ProductList";
import createComponent from "../core/component/create-component";
import { HOME_PAGE_LOADING } from "../constants/component-constant";
import Router from "../core/router";
import { getProducts, getCategories } from "../api/productApi";

const HomePage = createComponent({
  id: "home-page",
  props: {
    categories: [],
    cart: [],
  },
  initialState: () => {
    const queryParams = Router.getQueryParamsObject();
    const defaultFilters = {
      search: queryParams?.search || "",
      category1: queryParams?.category1 || "",
      category2: queryParams?.category2 || "",
      sort: queryParams?.sort || "price_asc",
    };
    const defaultPagination = {
      limit: queryParams?.limit || 20,
      total: 0,
      totalPages: 0,
      hasNext: true,
      hasPrev: false,
      page: 1,
    };
    const defaultListResponse = {
      products: [],
      pagination: defaultPagination,
      filters: defaultFilters,
    };

    return {
      listResponse: defaultListResponse,
      categories: [],
      isLoading: false,
    };
  },
  effects: {
    fetchProducts: {
      dependencies: [
        "listResponse.filters.sort",
        "listResponse.filters.search",
        "listResponse.filters.category1",
        "listResponse.filters.category2",
        "listResponse.pagination.limit",
      ],
      effect: async ({ getState, setState }) => {
        const listResponse = getState("listResponse");
        const filters = listResponse?.filters || {};
        const pagination = listResponse?.pagination || {};

        try {
          setState("isLoading", true);

          const response = await getProducts({
            limit: pagination.limit || 20,
            search: filters.search || "",
            category1: filters.category1 || "",
            category2: filters.category2 || "",
            sort: filters.sort || "price_asc",
          });

          setState("listResponse", {
            ...response,
            pagination: { ...response.pagination, page: 1 },
          });
        } catch (error) {
          console.error("[HomePage] fetchProducts error", error);
        } finally {
          setState("isLoading", false);
        }
      },
    },
    onMount: async ({ getState, setState }) => {
      const listResponse = getState("listResponse");
      const filters = listResponse?.filters || {};
      const pagination = listResponse?.pagination || {};

      try {
        setState("isLoading", true);
        const categoryResponse = await getCategories();
        const productListResponse = await getProducts({
          limit: pagination.limit || 20,
          search: filters.search || "",
          category1: filters.category1 || "",
          category2: filters.category2 || "",
          sort: filters.sort || "price_asc",
        });
        setState("listResponse", productListResponse);
        setState("categories", categoryResponse);
      } catch (error) {
        console.error("[HomePage] onMount error", error);
      } finally {
        setState("isLoading", false);
      }

      setTimeout(() => {
        const sentinel = document.querySelector("#sentinel");
        if (!sentinel) return;

        let isLoadingMore = false;

        const io = new IntersectionObserver(
          async ([entry]) => {
            if (!entry.isIntersecting) return;

            const currentListResponse = getState("listResponse");

            if (!currentListResponse.pagination.hasNext || isLoadingMore) return;

            isLoadingMore = true;
            setState("isLoading", true);

            try {
              const response = await getProducts({
                limit: currentListResponse.pagination.limit || 20,
                search: currentListResponse.filters.search || "",
                category1: currentListResponse.filters.category1 || "",
                category2: currentListResponse.filters.category2 || "",
                sort: currentListResponse.filters.sort || "price_asc",
                page: currentListResponse.pagination.page + 1,
              });

              setState("listResponse", (current) => ({
                ...response,
                products: [...current.products, ...response.products],
              }));
            } catch (error) {
              console.error("[HomePage] Infinite scroll error", error);
            } finally {
              isLoadingMore = false;
              setState("isLoading", false);
            }
          },
          {
            root: null,
            rootMargin: "200px",
            threshold: 0,
          },
        );

        io.observe(sentinel);

        return () => {
          io.disconnect();
        };
      }, 100);
    },
  },
  templateFn: ({ cart = [] }, { listResponse, categories, isLoading }, setState) => {
    const syncToUrl = (updates) => {
      Router.updateQueryParams(updates);
    };

    return PageLayout.mount({
      children: isLoading
        ? HOME_PAGE_LOADING
        : ProductList.mount({
            products: listResponse?.products || [],
            pagination: listResponse?.pagination || {},
            filters: listResponse?.filters || {},
            categories,
            handleSetSort: (value) => {
              // setState("filters", (currentFilters) => ({ ...currentFilters, sort: value }));
              setState("listResponse", (currentListResponse) => ({
                ...currentListResponse,
                filters: { ...currentListResponse.filters, sort: value },
              }));
              syncToUrl({ sort: value });
            },
            handleSetLimit: (value) => {
              setState("listResponse", (currentListResponse) => ({
                ...currentListResponse,
                pagination: { ...currentListResponse.pagination, limit: value },
              }));
              syncToUrl({ limit: value });
            },
            handleSetSearch: (value) => {
              setState("listResponse", (currentListResponse) => ({
                ...currentListResponse,
                filters: { ...currentListResponse.filters, search: value },
              }));
              syncToUrl({ search: value });
            },
            handleSetSelectedCategory1: (value) => {
              setState("listResponse", (currentListResponse) => ({
                ...currentListResponse,
                filters: { ...currentListResponse.filters, category1: value, category2: "" },
              }));
              syncToUrl({ category1: value, category2: "" });
            },
            handleSetSelectedCategory2: (value) => {
              setState("listResponse", (currentListResponse) => ({
                ...currentListResponse,
                filters: { ...currentListResponse.filters, category2: value },
              }));
              syncToUrl({ category2: value });
            },
          }).outerHTML,
      cart,
    }).outerHTML;
  },
});

export default HomePage;
