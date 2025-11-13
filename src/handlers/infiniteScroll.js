import { router } from "../App";

let infiniteScrollObserver = null;

export function setUpInfiniteScroll() {
  // 기존 Observer 제거
  if (infiniteScrollObserver) {
    infiniteScrollObserver.disconnect();
    infiniteScrollObserver = null;
  }

  const sentinel = document.querySelector("#infinite-scroll-sentinel");
  if (!sentinel) {
    return; // 마지막 페이지
  }

  infiniteScrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const searchParams = new URLSearchParams(window.location.search);
          const currentPage = parseInt(searchParams.get("current")) || 1;

          searchParams.set("current", String(currentPage + 1));

          // Observer 제거
          infiniteScrollObserver.disconnect();
          infiniteScrollObserver = null;

          // 무한 스크롤 옵션과 함께 navigateTo 호출
          router.navigateTo(`/?${searchParams.toString()}`, { isInfiniteScroll: true });
        }
      });
    },
    {
      rootMargin: "100px", // 40px sentinel이 화면에 보이기 전에 미리 로드
      threshold: 0.1,
    },
  );

  infiniteScrollObserver.observe(sentinel);
}
