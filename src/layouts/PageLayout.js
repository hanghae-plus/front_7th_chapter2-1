import Header from "../components/Header";
import Footer from "../components/Footer";
import createComponent from "../core/component/create-component";

/**
 * @typedef {import('../types.js').PageLayoutProps} PageLayoutProps
 */

/**
 * @param {PageLayoutProps} props
 */
// export default function PageLayout({ children, isDetailPage = false, cart = [] }) {
//   return /* HTML */ `
//     <div class="min-h-screen bg-gray-50">${Header({ isDetailPage, cart })} ${children} ${Footer()}</div>
//   `;
// }
const PageLayout = createComponent({
  id: "page-layout",
  props: {
    children: "",
    isDetailPage: false,
    cart: [],
  },
  templateFn: ({ children, isDetailPage, cart }) => {
    const header = Header.mount({ isDetailPage, cart });
    const footer = Footer.mount({});

    return /* HTML */ `
      <div class="min-h-screen bg-gray-50">${header.outerHTML} ${children} ${footer.outerHTML}</div>
    `;
  },
  children: [Header.mount({ isDetailPage: false, cart: [] }), Footer.mount({})],
});

export default PageLayout;
