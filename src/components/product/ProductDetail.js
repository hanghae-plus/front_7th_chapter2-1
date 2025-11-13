import {
  DetailLoadingSpinner,
  ProductDetailItem,
  Breadcrumb,
  RelatedProductList,
  ProductError,
} from '@/components';

export const ProductDetail = ({ loading, product, error }) => {
  return /* HTML */ `
    ${error
      ? ProductError(error)
      : loading
        ? /* HTML */ `${DetailLoadingSpinner()}`
        : `
          ${Breadcrumb({ category1: product.category1, category2: product.category2 })}
          ${ProductDetailItem(product)}

          <!-- 상품 목록으로 이동 -->
          <div class="mb-6">
            <button
              class="block w-full text-center bg-gray-100 text-gray-700 py-3 px-4 rounded-md
                hover:bg-gray-200 transition-colors go-to-product-list"
              data-category1="${product.category1 || ''}"
              data-category2="${product.category2 || ''}"
            >
              상품 목록으로 돌아가기
            </button>
          </div>

          ${RelatedProductList({ products: product.relatedProducts })}
      `}
  `;
};
