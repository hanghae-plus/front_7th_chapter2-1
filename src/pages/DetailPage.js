import { Footer } from "../components";
import { BackButton } from "../components/products/productDetail/BackButton";
import { Breadcrumb } from "../components/products/productDetail/Breadcrumb";
import { DetailHeader } from "../components/products/productDetail/DetailHeader";
import { DetailInfo } from "../components/products/productDetail/DetailInfo";
import { RelatedItems } from "../components/products/productDetail/RelatedItems";
import { loadDetailPageData } from "../utils/dataLoaders.js";
import { createComponent } from "../core/component.js";
import { setupDetailPageDelegation } from "../handlers/detailPageHandlers.js";
import { setupCommonDelegation } from "../handlers/commonHandlers.js";

// loading prop에 따라 UI 분기
const template = ({ loading = true, product = null }) => {
  return /*HTML*/ `
    <div class="min-h-screen bg-gray-50">
      ${DetailHeader()}
      <main class="max-w-md mx-auto px-4 py-4">
      ${
        loading
          ? `
        <div class="py-20 bg-gray-50 flex items-center justify-center">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p class="text-gray-600">상품 정보를 불러오는 중...</p>
          </div>
        </div>
      `
          : `
        ${Breadcrumb({ category1: product.category1, category2: product.category2 })}
        ${DetailInfo({ product })}
        ${BackButton()}
        ${RelatedItems()}
      `
      }
      </main>
      ${Footer()}
    </div>
`;
};

/**
 * DetailPage 데이터 로드
 * @param {Object} props - 컴포넌트 props (params 포함)
 * @returns {Promise<Object>} 페이지 데이터
 */
const loadData = async (props) => {
  return await loadDetailPageData(props.params || props);
};

/**
 * DetailPage 컴포넌트 생성
 * @returns {Object} 컴포넌트 인스턴스
 */
export const DetailPage = () => {
  return createComponent({
    template,
    setup: loadData,
    mounted: () => {
      setupDetailPageDelegation();
      setupCommonDelegation();
    },
  });
};
