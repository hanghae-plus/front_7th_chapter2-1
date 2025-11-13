import { useEffect } from "../hooks/useEffect.js";
import { store } from "../store/store.js";
import { router } from "../router/Router.js";

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

            // 로딩 중이거나 다음 페이지가 없으면 스킵
            if (isLoading || !pagination.hasNext) {
              return;
            }

            // 페이지만 증가시키면 Home.js의 useEffect가 자동으로 데이터를 fetch함
            store.setState({
              pagination: {
                ...pagination,
                page: pagination.page + 1,
              },
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
