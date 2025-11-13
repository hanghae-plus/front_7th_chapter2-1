import Footer from "../components/Footer";
import Header from "../components/Header";

const layout = ({ children }) => `
    <div class="min-h-screen bg-gray-50">
      ${Header()}
      <main class="max-w-md mx-auto px-4 py-4">
        ${children()}
      </main>
      ${Footer()}
    </div>
  `;

export default layout;
