// render 함수
// 라이프 사이클 포함
import { router } from "./router.js";

const $root = document.querySelector("#root");

// 렌더 함수들
export const render = () => {
  // 현재 페이지의 render 메서드 호출
  const currentPage = router.getCurrentPage();

  if (currentPage && currentPage.render) {
    $root.innerHTML = currentPage.render();
  }

  // 페이지의 mounted 호출 (이벤트 리스너 등록)
  if (currentPage && currentPage.mounted) {
    currentPage.mounted();
  }
};
