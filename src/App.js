import mainLayout from "./layouts/mainLayout.js";
import { ProductListPage } from "./pages/ProductListPage.js";
import { ProductDetailPage } from "./pages/ProductDetailPage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";
import { router } from "./Router/router.js";

export default function App() {
  const renderPage = (Page, params) => {
    const page = Page(params); // 페이지는 { html, onMount }를 반환
    return {
      html: mainLayout(() => page.html), // mainLayout은 페이지의 html만 감쌈
      onMount: page.onMount, // 페이지의 onMount 로직은 그대로 전달
    };
  };

  /**
   * 라우터 - 루트 정의
   * "/product/:id" 같은 다이나믹 라우팅
   * TODO : baseUrl 적용 (배포 시 url환경 맞추기)
   * */
  router.addRoute(/^\/$/, (params) => renderPage(ProductListPage, params));
  router.addRoute(/^\/product\/(?<id>\w+)$/, (params) => renderPage(ProductDetailPage, params));

  // 404 페이지
  router.setNotFound(() => renderPage(NotFoundPage));

  router.start();
}
