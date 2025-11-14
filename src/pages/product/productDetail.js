import { getProduct as fetchProduct } from "../../api/productApi";
import { LoadingInDetail } from "../../components/Loading-in-detail";
import { Breadcrumb } from "./components/Breadcrumb";
import { Info } from "./components/Info";
import { GoToProductList } from "./components/GoToProductList";
import { RelativeProductList } from "./components/RelativeProductList";

let isLoading = true;
let productData = {};

// 초기 데이터 로드 및 리렌더링
async function loadInitialData(productId) {
  try {
    // 상품 데이터 로드
    const product = await fetchProduct(productId);

    console.log("product loaded:", product);

    // 상태 업데이트
    productData = product;
    isLoading = false;

    // 컨테이너를 찾아서 리렌더링
    const productDetailContainer = document.querySelector("#product-detail-container");
    if (productDetailContainer) {
      productDetailContainer.outerHTML = renderProductDetail();
    }
  } catch (error) {
    console.error("Failed to load data:", error);
    isLoading = false;

    // 에러 상태로 리렌더링
    const productDetailContainer = document.querySelector("#product-detail-container");
    if (productDetailContainer) {
      productDetailContainer.outerHTML = renderProductDetail();
    }
  }
}

// 렌더링 함수 분리
function renderProductDetail() {
  return `
        <main class="max-w-md mx-auto px-4 py-4" id="product-detail-container">
            ${
              isLoading
                ? LoadingInDetail()
                : Breadcrumb(productData) +
                  Info(productData) +
                  GoToProductList(productData) +
                  RelativeProductList(productData)
            }
        </main>
    `;
}

export const ProductDetail = (params = {}) => {
  const productId = params.id;
  console.log("productId:", productId);

  // 초기화
  isLoading = true;
  productData = {};

  setTimeout(() => {
    loadInitialData(productId);
  }, 0);

  return renderProductDetail();
};
