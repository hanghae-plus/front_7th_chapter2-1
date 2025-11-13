import { Component } from "../../../core/component/Component";
import { useNavigate } from "../../../hooks/useNavigate";
import { html } from "../../../utils/html";

export class NavigateBreadcrumbButton extends Component {
  setEvents() {
    this.navigate = useNavigate();

    this.addEventListener("click", ".breadcrumb-link", (e) => {
      const { category1, category2 } = this.props;

      if (e.target.dataset.category2) {
        this.navigate.push(`/?category1=${category1}&category2=${category2}`);
      }

      if (e.target.dataset.category1) {
        this.navigate.push(`/?category1=${category1}`);
      }
    });
  }

  template() {
    const { category1, category2 } = this.props;

    return html`
      <nav class="mb-4">
        <div class="flex items-center space-x-2 text-sm text-gray-600">
          <a href="/" data-link="" class="hover:text-blue-600 transition-colors">홈</a>
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
          <button class="breadcrumb-link" data-category1="${category1}">${category1}</button>
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
          <button class="breadcrumb-link" data-category2="${category2}">${category2}</button>
        </div>
      </nav>
    `;
  }
}
