// SearchBar component for common UI layout
// 공통 검색창 컴포넌트

export class SearchBar {
  constructor(placeholder = '상품명을 검색해보세요...') {
    this.placeholder = placeholder;
    this.searchElement = null;
  }

  render() {
    this.searchElement = document.createElement('div');
    this.searchElement.className = 'mb-4';
    this.searchElement.innerHTML = `
      <div class="relative">
        <input type="text" id="search-input" placeholder="${this.placeholder}" value=""
               class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>
    `;

    this.bindEvents();
    return this.searchElement;
  }

  bindEvents() {
    const input = this.searchElement.querySelector('#search-input');
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.onSearch(input.value);
      }
    });
  }

  onSearch(query) {
    // 검색 이벤트 발생 - 상위에서 처리하도록 이벤트 emit
    const event = new CustomEvent('search', {
      detail: { query },
    });
    this.searchElement.dispatchEvent(event);
  }

  mount(container = document.body) {
    container.appendChild(this.render());
  }

  unmount() {
    if (this.searchElement) {
      this.searchElement.remove();
    }
  }

  getValue() {
    const input = this.searchElement?.querySelector('#search-input');
    return input ? input.value : '';
  }

  setValue(value) {
    const input = this.searchElement?.querySelector('#search-input');
    if (input) {
      input.value = value;
    }
  }
}
