import Component from '@/core/component';

export default class Breadcrumb extends Component {
  template() {
    const { category1, category2 } = this.props;

    return /* HTML */ `<!-- 브레드크럼 -->
      <nav class="mb-4">
        <div class="flex items-center space-x-2 text-sm text-gray-600">
          <a href="/" data-link="" class="hover:text-blue-600 transition-colors">홈</a>
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
          <button class="breadcrumb-link" data-category1="${category1}">${category1}</button>
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
          <button class="breadcrumb-link" data-category2="${category2}">${category2}</button>
        </div>
      </nav>`;
  }

  setEvent() {
    this.addEvent('click', '.breadcrumb-link', ({ target }) => {
      const { category1, category2 } = this.props;

      if (/** @type {HTMLElement} */ (target).dataset.category1) {
        router.navigate(`/?category1=${encodeURIComponent(category1)}`);
        return;
      }

      router.navigate(
        `/?category1=${encodeURIComponent(category1)}&category2=${encodeURIComponent(category2)}`
      );
    });
  }
}
