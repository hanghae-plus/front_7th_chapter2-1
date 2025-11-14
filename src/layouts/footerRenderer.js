/**
 * 푸터를 렌더링합니다.
 */
export function renderFooter() {
  const footerContainer = document.getElementById("footer-container");
  if (!footerContainer) {
    console.error("Footer container not found.");
    return;
  }

  footerContainer.innerHTML = `
    <footer class="bg-white shadow-sm sticky top-0 z-40">
      <div class="max-w-md mx-auto py-8 text-center text-gray-500">
        <p>© 2025 항해플러스 프론트엔드 쇼핑몰</p>
      </div>
    </footer>
  `;
}
