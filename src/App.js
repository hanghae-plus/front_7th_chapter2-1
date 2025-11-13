import { router } from "./router/Router.js";

import { Header } from "./components/Header.js";
import { Footer } from "./components/Footer.js";

export default function App() {
  // 비동기 데이터 처리

  // 현재 라우트
  const { path, render } = router.getCurrentRoute();
  // const params = router.getParams();
  // const content = route ? route.render(params) : "";
  return /*html*/ `
    <div class="min-h-screen bg-gray-50"> 
      ${Header({ path })}
      <main class="max-w-md mx-auto px-4 py-4">
        ${render()}
      </main>
      ${Footer()}
    </div>
  `;
}
