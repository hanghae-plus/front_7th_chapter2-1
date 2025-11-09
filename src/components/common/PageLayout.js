import { Footer } from "./Footer";
import { Header } from "./Header";

export const PageLayout = ({ children }) => {
  return /*html*/ `
    <div class="min-h-screen bg-gray-50">
      ${Header()}
       <main class="max-w-md mx-auto px-4 py-4">
        // TODO(이진): 필터 컴포넌트 추가해야 함
        ${children}
      </main>
      ${Footer()}
    </div>
  `;
};
