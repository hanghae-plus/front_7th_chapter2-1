import { PageLayout } from "./PageLayout";
import { Breadcrumb } from "../components/detail/Breadcrumb.js";
import { ProductDetailInfo } from "../components/detail/ProductDetailInfo.js";
import { RelatedProducts } from "../components/detail/RelatedProducts.js";
import { getProduct, getProducts } from "../api/productApi.js";

/**
 * DetailPage - 순수 렌더링 함수
 * @param {Object} props
 * @param {Object} props.params - URL 파라미터 (예: { id: "123" })
 * @param {Object} props.data - mount에서 가져온 데이터
 * @returns {string} 상품 상세 페이지 HTML
 */
export const DetailPage = ({ data = {} }) => {
  const { product, relatedProducts = [] } = data;

  return PageLayout({
    headerType: "detail",
    headerTitle: "상품 상세",
    children: `
      ${Breadcrumb({ category1: product.category1, category2: product.category2 })}
      ${ProductDetailInfo(product)}
      <div class="mb-6">
        <a
          href="/"
          data-link
          class="block w-full text-center bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 transition-colors"
        >
          상품 목록으로 돌아가기
        </a>
      </div>
      ${RelatedProducts({ products: relatedProducts })}
    `,
  });
};

/**
 * DetailPage mount - API 호출 로직
 */
DetailPage.mount = async ({ params = {} }) => {
  // 1. URL에서 상품 ID 가져오기
  const productId = params.id;

  // 2. API 호출해서 상품 상세 정보 가져오기
  const product = await getProduct(productId);

  // 3. 관련 상품 가져오기 (같은 category2의 다른 상품들)
  let relatedProducts = [];
  if (product.category2) {
    const data = await getProducts({
      category1: product.category1,
      category2: product.category2,
      limit: 20,
    });
    // 현재 상품을 제외
    relatedProducts = data.products.filter((p) => p.productId !== productId);
  }

  // 4. 데이터 반환
  return {
    product,
    relatedProducts,
  };
};
