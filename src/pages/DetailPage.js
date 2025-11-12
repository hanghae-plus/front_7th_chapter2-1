import { ProductDetail } from "../components";
import { PageLayout } from "./PageLayout";

export const DetailPage = ({ product, loading }) => {
  console.log(product);
  return PageLayout({
    children: `
      ${ProductDetail({ product, loading })}
    `,
    pageType: "detail",
  });
};
