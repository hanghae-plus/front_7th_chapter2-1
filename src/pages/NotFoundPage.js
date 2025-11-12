import { Layout } from "../layout/Layout";

export const NotFoundPage = () => {
  return Layout({
    children: `
      <div class="flex flex-col items-center justify-center py-16 px-4">
        <div class="text-center">
          <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">페이지를 찾을 수 없습니다</h2>
          <p class="text-gray-600 mb-8">요청하신 페이지가 존재하지 않습니다.</p>
          <a href="/" data-link="" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
            홈으로 돌아가기
          </a>
        </div>
      </div>
    `,
  });
};
