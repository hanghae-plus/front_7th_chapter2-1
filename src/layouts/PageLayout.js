import Header from "../components/Header";
import Footer from "../components/Footer";

export default function PageLayout({ children, isDetailPage = false, cart = [] }) {
  return /* html */ `
    <div class="min-h-screen bg-gray-50">
      ${Header({ isDetailPage, cart })}
      ${children}
      ${Footer()}
    </div>
  `;
}
