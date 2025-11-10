import { Header, Footer } from "../components/common/index.js";

/**
 * 페이지 레이아웃
 * @param {Object} props
 * @param {string} props.children - 페이지 컨텐츠
 * @param {string} props.headerType - 헤더 타입 ("default" | "detail")
 * @param {string} props.headerTitle - 헤더 타이틀
 */
export const PageLayout = ({ children, headerType = "default", headerTitle = "쇼핑몰" }) => {
  return `
    <div class="min-h-screen bg-gray-50">
      ${Header({ type: headerType, title: headerTitle })}
      <main class="max-w-md mx-auto px-4 py-4">${children}</main>
      ${Footer()}
    </div>
  `;
};
