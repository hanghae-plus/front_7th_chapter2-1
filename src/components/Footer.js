import { useEffect } from "../hooks/useEffect.js";
import { store } from "../store/store.js";
import { getProducts } from "../api/productApi.js";
import { router } from "../router/Router.js";

const fetchNextPage = async () => {
  const { products, pagination } = store.getState();

  const { products: newProducts, pagination: newPagination } = await getProducts({
    page: pagination.page + 1,
    limit: pagination.limit,
  });

  store.setState({
    products: [...products, ...newProducts],
    pagination: {
      ...pagination,
      ...newPagination,
    },
  });
};

export const Footer = () => {
  useEffect(() => {
    const targetElement = document.querySelector("footer");

    if (!targetElement) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const { path } = router.getCurrentRoute();
            if (path !== "/") return;

            const { isLoading, pagination } = store.getState();

            if (isLoading || !pagination.hasNext) {
              return;
            }

            store.setState({ isLoading: true });
            fetchNextPage().then(() => {
              store.setState({ isLoading: false });
            });
          }
        });
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0.1,
      },
    );

    observer.observe(targetElement);

    // cleanup 함수 반환
    return () => {
      observer.disconnect();
    };
  }, []);

  return /*html*/ `
    <footer class="bg-white shadow-sm sticky top-0 z-40">
      <div class="max-w-md mx-auto py-8 text-center text-gray-500">
        <p>© 2025 항해플러스 프론트엔드 쇼핑몰</p>
      </div>
    </footer>
  `;
};
