import Footer from "@common/Footer";
import Header from "@common/Header";

const HomeLayout = ({ children }) => {
  return `
    <div class="min-h-screen bg-gray-50">
      ${Header()}
      <main class="max-w-md mx-auto px-4 py-4">
        ${children()}
      </main>
      ${Footer()}
    </div>
  `;
};

export default HomeLayout;
