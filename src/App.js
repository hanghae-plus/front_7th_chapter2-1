import mainLayout from "./layouts/mainLayout.js";
import { ProductListPage } from "./pages/ProductListPage.js";
import { ProductDetailPage } from "./pages/ProductDetailPage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";
import { addRoute, setNotFound, startRouter } from "./router.js";

export default function App() {
  /**
   * 라우터 - 루트 정의
   * "/product/:id" 같은 다이나믹 라우팅
   * TODO : baseUrl 적용 (배포 시 url환경 맞추기)
   * */
  // The router needs to support dynamic paths like
  addRoute(/^\/$/, () => mainLayout(ProductListPage));
  addRoute(/^\/product\/(?<id>\w+)$/, (params) => mainLayout(() => ProductDetailPage(params)));

  // 404 페이지 등록
  setNotFound(() => mainLayout(NotFoundPage));

  // 라우터
  startRouter();
}
