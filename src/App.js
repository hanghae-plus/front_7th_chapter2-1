import { ProductListPage } from "./pages/ProductListPage.js";
import { ProductDetailPage } from "./pages/ProductDetailPage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";
import { renderHeader } from "./layouts/headerRenderer.js";
import { renderFooter } from "./layouts/footerRenderer.js";
import { renderCartModal } from "./layouts/cartModalRenderer.js";
import { renderToast } from "./layouts/toastRenderer.js"; // 토스트 렌더러 임포트
import { router } from "./Router/router.js";

/**
 * 초기 레이아웃 구조 (수정안)
 * --> 헤더, 메인 콘텐츠, 푸터, 모달을 위한 컨테이너 생성
 * --> 이 구조는 애플리케이션 라이프싸이클 동안 유지됨
 */
function renderInitialLayout() {
  const root = document.getElementById("root");
  if (!root) {
    console.error("Root element #root not found.");
    return;
  }

  // 기본 레이아웃 컨테이너 설정
  root.innerHTML = `
    <div class="bg-gray-50 min-h-screen flex flex-col">
      <header id="header-container"></header>
      <main id="main-content-container" class="flex-1"></main>
      <footer id="footer-container"></footer>
      <div id="modal-container"></div> <!-- 카트 모달이 렌더링될 위치 -->
    </div>
  `;

  // 각 섹션별 초기 렌더링
  renderHeader();
  renderFooter();
  renderCartModal();
  renderToast(); // 토스트 렌더러 호출
}

export default function App() {
  // 애플리케이션 시작 시 초기 레이아웃을 한 번만 렌더링
  renderInitialLayout();

  // 라우터 - 루트 정의
  // 이제 페이지 컴포넌트가 직접 { html, onMount }를 반환
  router.addRoute(/^\/$/, ProductListPage);
  router.addRoute(/^\/product\/(?<id>\w+)$/, ProductDetailPage);

  // 404 페이지
  router.setNotFound(NotFoundPage);

  // 라우터 시작
  router.start();
}
