// Footer component for common UI layout
// 공통 레이아웃용 Footer 컴포넌트

/**
 * Footer HTML 템플릿 반환
 * @returns {string} Footer HTML 문자열
 */
export function CommonFooter() {
  const year = new Date().getFullYear();
  return `
    <footer class="bg-white shadow-sm border-t py-6 sticky bottom-0 z-20">
      <div class="max-w-md mx-auto text-center text-gray-500 text-sm">
        © ${year} 항해플러스 프론트엔드 쇼핑몰
      </div>
    </footer>
  `;
}
