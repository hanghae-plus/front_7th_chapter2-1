import Component from '@/core/component';
import { navigate } from '@/core/router';

export default class PageTitle extends Component {
  template() {
    const { isDetailPage } = this.props;

    if (isDetailPage) {
      return /* HTML */ `
        <div class="flex items-center space-x-3">
          <button id="back-btn" class="p-2 text-gray-700 hover:text-gray-900 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
          </button>
          <h1 class="text-lg font-bold text-gray-900">상품 상세</h1>
        </div>
      `;
    }

    return /* HTML */ `
      <h1 class="text-xl font-bold text-gray-900">
        <a id="home-link"" href="/" data-link="">쇼핑몰</a>
      </h1>
    `;
  }

  setEvent() {
    this.addEvent('click', '#back-btn', () => {
      history.back();
    });
    this.addEvent('click', '#home-link', (e) => {
      e.preventDefault();
      navigate('/');
    });
  }
}
