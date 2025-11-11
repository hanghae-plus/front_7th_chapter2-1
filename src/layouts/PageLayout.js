import Header from "../components/Header";
import Footer from "../components/Footer";

/**
 * @typedef {import('../types.js').PageLayoutProps} PageLayoutProps
 */

/**
 * @param {PageLayoutProps} props
 */
export default function PageLayout({ children, isDetailPage = false, cart = [] }) {
  return /* HTML */ `
    <div class="min-h-screen bg-gray-50">${Header({ isDetailPage, cart })} ${children} ${Footer()}</div>
  `;
}
