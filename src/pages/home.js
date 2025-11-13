import { Layout } from "../components/index.js";

export const Home = () => {
  return `
    ${Layout({
      headerProps: { showBack: false },
      top: '<section id="search-section"></section>',
      main: '<section id="product-section"></section>',
    })}
  `;
};
