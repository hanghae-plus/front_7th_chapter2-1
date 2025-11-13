import { Component } from "../../../core/component/Component";
import { useNavigate } from "../../../hooks/useNavigate";
import { html } from "../../../utils/html";

export class NavigateHomeButton extends Component {
  setup() {
    this.navigate = useNavigate();

    this.addEventListener("click", ".go-to-product-list", () => {
      this.navigate.push("/");
    });
  }

  template() {
    return html`
      <button
        class="block w-full text-center bg-gray-100 text-gray-700 py-3 px-4 rounded-md
            hover:bg-gray-200 transition-colors go-to-product-list"
      >
        상품 목록으로 돌아가기
      </button>
    `;
  }
}
