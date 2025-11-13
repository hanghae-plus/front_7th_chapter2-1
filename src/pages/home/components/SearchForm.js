import { getCategories } from '@/api/productApi';
import Component from '@/core/component';

const DEFAULT_LIMIT = 20;
const LIMIT_OPTIONS = [
  { value: 10, label: '10개' },
  { value: 20, label: '20개' },
  { value: 50, label: '50개' },
  { value: 100, label: '100개' },
];
const DEFAULT_SORT = 'price_asc';
const SORT_OPTIONS = [
  { value: 'price_asc', label: '가격 낮은순' },
  { value: 'price_desc', label: '가격 높은순' },
  { value: 'name_asc', label: '이름순' },
  { value: 'name_desc', label: '이름 역순' },
];

export default class SearchForm extends Component {
  setup() {
    const params = new URLSearchParams(location.search);

    this.state = {
      categories: null,
      search: params.get('search') || '',
      category1: params.get('category1'),
      category2: params.get('category2'),
      limit: params.get('limit') ? Number(params.get('limit')) : DEFAULT_LIMIT,
      sort: params.get('sort') || DEFAULT_SORT,
      loading: true,
      error: null,
    };
    this.fetchCategories();
  }

  async fetchCategories() {
    try {
      this.setState({ loading: true, error: null });
      const data = await getCategories();
      const categories = Object.entries(data || {}).map(([name, children]) => ({
        name,
        sub: Object.keys(children || {}),
      }));

      this.setState({ categories, loading: false, error: null });
    } catch (error) {
      this.setState({
        loading: false,
        error: error?.message || 'Failed to fetch',
      });
    }
  }

  template() {
    const { categories, search, category1, category2, limit, sort, loading, error } = this.state;

    return /* HTML */ `
      <!-- 검색 및 필터 -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <!-- 검색창 -->
        <div class="mb-4">
          <div class="relative">
            <input
              type="text"
              id="search-input"
              placeholder="상품명을 검색해보세요..."
              value="${search}"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                class="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
          </div>
        </div>
        <!-- 필터 옵션 -->
        <div class="space-y-3">
          <!-- 카테고리 필터 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">카테고리:</label>
              <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">
                전체
              </button>
              ${category1
                ? /* HTML */ `
                    <span class="text-xs text-gray-500">&gt;</span>
                    <button
                      data-breadcrumb="category1"
                      data-category1="${category1}"
                      class="text-xs hover:text-blue-800 hover:underline"
                    >
                      ${category1}
                    </button>
                  `
                : ''}
              ${category2
                ? /* HTML */ `
                    <span class="text-xs text-gray-500">&gt;</span>
                    <span class="text-xs text-gray-600 cursor-default">${category2}</span>
                  `
                : ''}
            </div>
            <!-- 1depth 카테고리 -->
            ${loading
              ? /* HTML */ `<div class="flex flex-wrap gap-2">
                  <div class="text-sm text-gray-500 italic flex items-center gap-2">
                    <svg
                      class="animate-spin h-4 w-4 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    카테고리 로딩 중...
                  </div>
                </div>`
              : error
                ? /* HTML */ `<div class="flex flex-wrap gap-2">
                    <div class="text-sm text-red-600 flex items-center gap-2">
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      ${error}
                    </div>
                  </div>`
                : categories
                  ? !category1
                    ? /* HTML */ `<div class="flex flex-wrap gap-2">
                        ${categories
                          .map(
                            ({ name }) => /* HTML */ `
                              <button
                                data-category1="${name}"
                                class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                              >
                                ${name}
                              </button>
                            `
                          )
                          .join('')}
                      </div>`
                    : /* HTML */ `
                        <!-- 2depth 카테고리 -->
                        <div class="space-y-2">
                          <div class="flex flex-wrap gap-2">
                            ${categories
                              .find(({ name }) => name === category1)
                              .sub.map(
                                (subName) => /* HTML */ `
                                  <button
                                    data-category1="${category1}"
                                    data-category2="${subName}"
                                    class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors ${category2 ===
                                    subName
                                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}"
                                  >
                                    ${subName}
                                  </button>
                                `
                              )
                              .join('')}
                          </div>
                        </div>
                      `
                  : ''}
          </div>
          <!-- 기존 필터들 -->
          <div class="flex gap-2 items-center justify-between">
            <!-- 페이지당 상품 수 -->
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">개수:</label>
              <select
                id="limit-select"
                class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                ${LIMIT_OPTIONS.map(
                  ({ value, label }) => /* HTML */ `
                    <option value="${value}" ${value === limit ? 'selected' : ''}>${label}</option>
                  `
                ).join('')}
              </select>
            </div>
            <!-- 정렬 -->
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">정렬:</label>
              <select
                id="sort-select"
                class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                ${SORT_OPTIONS.map(
                  ({ value, label }) =>
                    /* HTML */ `<option value="${value}" ${value === sort ? 'selected' : ''}>
                      ${label}
                    </option>`
                ).join('')}
              </select>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setEvent() {
    const { onSearchParamsChange } = this.props;
    this.addEvent('keydown', '#search-input', (e) => {
      if (/** @type {KeyboardEvent} */ (e).key !== 'Enter') return;
      const url = new URL(location.href);
      const search = /** @type {HTMLInputElement} */ (e.target).value;

      if (search) {
        url.searchParams.set('search', search);
      } else {
        url.searchParams.delete('search');
      }
      history.replaceState({}, '', url.toString());
      this.setState({ search });
      onSearchParamsChange();
    });
    this.addEvent('click', '[data-breadcrumb="reset"]', () => {
      const url = new URL(location.href);

      if (!url.searchParams.has('category1')) return;

      url.searchParams.delete('category1');
      url.searchParams.delete('category2');
      history.replaceState({}, '', url.toString());
      this.setState({ category1: null, category2: null });
      onSearchParamsChange();
    });
    this.addEvent('click', '[data-breadcrumb="category1"]', () => {
      const url = new URL(location.href);

      if (!url.searchParams.has('category2')) return;

      url.searchParams.delete('category2');
      history.replaceState({}, '', url.toString());
      this.setState({ category2: null });
      onSearchParamsChange();
    });
    this.addEvent('click', '.category1-filter-btn', ({ target }) => {
      const url = new URL(location.href);
      const { category1 } = /** @type {HTMLElement} */ (target).dataset;

      url.searchParams.set('category1', category1);
      url.searchParams.delete('category2');
      history.replaceState({}, '', url.toString());
      this.setState({ category1, category2: null });
      onSearchParamsChange();
    });
    this.addEvent('click', '.category2-filter-btn', ({ target }) => {
      const url = new URL(location.href);
      const { category2 } = /** @type {HTMLElement} */ (target).dataset;

      url.searchParams.set('category2', category2);
      history.replaceState({}, '', url.toString());
      this.setState({ category2 });
      onSearchParamsChange();
    });
    this.addEvent('change', '#limit-select', ({ target }) => {
      const url = new URL(location.href);
      const limit = Number(/** @type {HTMLSelectElement} */ (target).value);

      url.searchParams.set('limit', limit.toString());
      history.replaceState({}, '', url.toString());
      this.setState({ limit });
      onSearchParamsChange();
    });
    this.addEvent('change', '#sort-select', ({ target }) => {
      const url = new URL(location.href);
      const sort = /** @type {HTMLSelectElement} */ (target).value;

      url.searchParams.set('sort', sort);
      history.replaceState({}, '', url.toString());
      this.setState({ sort });
      onSearchParamsChange();
    });
  }
}
