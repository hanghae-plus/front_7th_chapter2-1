import { ProductList, SearchForm } from "../components/index.js";
import { PageLayout } from "./PageLayout.js";

export const HomePage = ({ categories, filters, pagenation, products, loading }) => {
  return PageLayout({
    children: `
    ${SearchForm({ categories, filters, pagenation })}
    ${ProductList({ loading, products })}
    `,
  });
};
