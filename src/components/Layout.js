import Component from "@/core/Component";
import Header from "./Header";
import Footer from "./Footer";

class Layout extends Component {
  template() {
    const { children } = this.$props || {};
    const body = typeof children === "function" ? children() : children;
    const bodyHtml = body instanceof Node ? body.outerHTML : (body ?? "");

    const tempDiv = document.createElement("div");
    const headerInstance = new Header(tempDiv);
    const headerHtml = headerInstance.template();

    return `
    <div class="bg-gray-50">
      ${headerHtml}
      ${bodyHtml}
      ${Footer()}
    </div>
    `;
  }

  mount() {
    const $header = this.$target.querySelector("header");
    if ($header) new Header($header);
  }
}

export default Layout;
