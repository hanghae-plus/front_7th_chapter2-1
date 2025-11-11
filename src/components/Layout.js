import Header from "./Header";
import Footer from "./Footer";

const Layout = (children) => {
  const body = typeof children === "function" ? children() : children;
  const bodyHtml = body instanceof Node ? body.outerHTML : (body ?? "");

  return `
  <div class="bg-gray-50">
    ${Header()}
    ${bodyHtml}
    ${Footer()}
  </div>
  `;
};

export default Layout;
