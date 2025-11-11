export const MainContainer = ({ children }) => {
  return /*html*/ `
  <main class="max-w-md mx-auto px-4 py-4">
    ${children}
  </main>
  `;
};
