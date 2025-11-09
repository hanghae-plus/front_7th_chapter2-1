import { ProductList } from "../components/ProductList";
import { SearchForm } from "../components/SearchForm";
import { PageLayout } from "./PageLayout";

export const HomePage = () => {
  return PageLayout({
    children: `
    ${SearchForm()}
    ${ProductList({ loading: false })}
    `,
  });
};
