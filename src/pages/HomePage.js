import { ProductFilter } from "../components/filter/ProductFilter";
import { GlobalLayout } from "../components/layout/GlobalLayout";
import { ProductList } from "../components/product/ProductList";
import { enableInfiniteScroll, disableInfiniteScroll } from "../utils/infiniteScrollState.js";
import { cleanupInfiniteScrollObserver } from "../utils/infiniteScrollObserver.js";

export const HomePage = () => {
  // 무한 스크롤 활성화
  setTimeout(() => {
    enableInfiniteScroll();
  }, 0);

  // 페이지 전환 시 cleanup을 위한 이벤트 리스너 등록
  setTimeout(() => {
    const cleanup = () => {
      disableInfiniteScroll();
      cleanupInfiniteScrollObserver();
    };

    // popstate 이벤트 (뒤로가기/앞으로가기)
    window.addEventListener("popstate", cleanup, { once: true });

    // 링크 클릭으로 페이지 이동 시
    document.querySelectorAll("a[data-link]").forEach((link) => {
      link.addEventListener("click", cleanup, { once: true });
    });
  }, 0);

  return `
    ${GlobalLayout({
      children: `
        ${ProductFilter()}
        ${ProductList()}
      `,
    })}
  `;
};
