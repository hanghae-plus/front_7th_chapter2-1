/**
 * 상품 상세 페이지의 브레드크럼
 * @param {object} detail - 상품 상세 정보 객체
 * @returns {string} - 브레드크럼 HTML 문자열
 */
export default function DetailBreadcrumb(detail) {
  return `
    <nav class="mb-4">
      <div class="flex items-center space-x-2 text-sm text-gray-600">
        <a href="/" data-link class="hover:text-blue-600 transition-colors">홈</a>
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        <button class="breadcrumb-link" data-category1="${detail.category1}">${detail.category1}</button>
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        <button class="breadcrumb-link" data-category1="${detail.category1}" data-category2="${detail.category2}">${detail.category2}</button>
      </div>
    </nav>
  `;
}
