import { Header, Footer } from '@/components';

export const Layout = ({ children, pageType = 'home' }) => {
  return /* HTML */ `
    <div class="min-h-screen bg-gray-50">
      ${Header({ pageType })}
      <main class="max-w-md mx-auto px-4 py-4">${children}</main>
      ${Footer()}
    </div>
  `;
};
