export const defaultProductState = {
  products: [],
  categories: {},
  isLoading: true,
  isLoadingMore: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
};
