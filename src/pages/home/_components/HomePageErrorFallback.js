import { Component } from "../../../core/component/Component";

export class HomePageErrorFallback extends Component {
  setup() {
    this.addEventListener("click", '[data-action="retry"]', () => this.props.handleRetry());
  }

  template() {
    return html`
      <main class="max-w-md mx-auto px-4 py-4">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4 text-center">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">상품을 불러올 수 없습니다</h3>
          <p class="text-gray-600 mb-4">네트워크 연결을 확인하고 다시 시도해주세요.</p>
          <button
            data-action="retry"
            class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            다시 시도
          </button>
        </div>
      </main>
    `;
  }
}
