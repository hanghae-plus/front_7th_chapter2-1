import { ProductList, SearchForm } from "../components/index.js";
import { PageLayout } from "./PageLayout.js";

export const HomePage = ({ filters, pagenation, products, loading }) => {
  return PageLayout({
    children: `
    ${SearchForm({ filters, pagenation })}
    ${ProductList({ loading, products })}
    `,
  });
};
