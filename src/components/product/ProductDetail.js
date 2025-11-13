import {
  DetailLoadingSpinner,
  ProductDetailItem,
  Breadcrumb,
  RelatedProductList,
} from '@/components';

export const ProductDetail = ({ loading, product }) => {
  return /* HTML */ `
    ${loading
      ? /* HTML */ `${DetailLoadingSpinner()}`
      : `
          ${Breadcrumb({ category1: product.category1, category2: product.category2 })}
          ${ProductDetailItem(product)}
          ${RelatedProductList({ products: product.relatedProducts })}
      `}
  `;
};
