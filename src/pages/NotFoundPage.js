export function NotFoundPage() {
  return {
    html: `
      <main class="max-w-md mx-auto px-4 py-4">
          <div class="text-center my-4 py-20 shadow-md p-6 bg-white rounded-lg">
              <h1 class="text-4xl font-bold text-blue-600 mb-4">404</h1>
              <p class="text-lg text-gray-600 mb-8">404 페이지를 찾을 수 없습니다</p>
              <a href="/" data-link class="inline-block px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                  홈으로
              </a>
          </div>
      </main>
    `,
    onMount: null,
  };
}
