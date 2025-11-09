import Header from "../component/header";
import Footer from "../component/footer";

const layout = ({ children }) => /*html*/ `
    <div class="min-h-screen bg-gray-50">
      ${Header()}
      <main class="max-w-md mx-auto px-4 py-4">
        ${children()}
      </main>
      ${Footer()}
    </div>
  `;

export default layout;
