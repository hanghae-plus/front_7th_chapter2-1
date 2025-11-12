import { ProductList, SearchForm } from "../components";
import { PageLayout } from "./PageLayout";

export const HomePage = ({ filters, pagination, products, loading }) => {
  console.log(products);
  return PageLayout({
    children: `
    ${SearchForm({ filters, pagination })}
    ${ProductList({ products, loading })}
    `,
    pageType: "home",
  });
};
