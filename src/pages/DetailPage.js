import { StarRating } from "../components/StarRating";
import { PageLayout } from "./PageLayout";

export const DetailPage = ({ loading, product, relatedProducts }) => {
  return PageLayout({
    children: loading ? LoadingIndicator : LoadedDetailPage({ product, relatedProducts }),
  });
};

const LoadingIndicator = `
<div class="py-20 bg-gray-50 flex items-center justify-center">
  <div class="text-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
    <p class="text-gray-600">상품 정보를 불러오는 중...</p>
  </div>
</div>`;

const BreadCrumbNavigation = ({ category1, category2 }) => {
  return `
  <nav class="mb-4">
          <div class="flex items-center space-x-2 text-sm text-gray-600">
            <a href="/" data-link="" class="hover:text-blue-600 transition-colors">홈</a>
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
            <button class="breadcrumb-link" data-category1="${category1}">
              ${category1}
            </button>
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
            <button class="breadcrumb-link" data-category2="${category2}">
              ${category2}
            </button>
          </div>
  </nav>`;
};

const RelatedProductCard = (product) => {
  return `
<div class="bg-gray-50 rounded-lg p-3 related-product-card cursor-pointer" data-product-id="${product.productId}">
  <div class="aspect-square bg-white rounded-md overflow-hidden mb-2">
    <img src="${product.image}" alt="${product.title}" class="w-full h-full object-cover" loading="lazy">
  </div>
  <h3 class="text-sm font-medium text-gray-900 mb-1 line-clamp-2">${product.title}</h3>
  <p class="text-sm font-bold text-blue-600">${Number(product.lprice).toLocaleString()}원</p>
</div>
  `;
};

// {
//     "title": "샷시 풍지판 창문 바람막이 베란다 문 틈막이 창틀 벌레 차단 샤시 방충망 틈새막이",
//     "link": "https://smartstore.naver.com/main/products/9396357056",
//     "image": "https://shopping-phinf.pstatic.net/main_8694085/86940857379.1.jpg",
//     "lprice": "230",
//     "hprice": "",
//     "mallName": "EASYWAY",
//     "productId": "86940857379",
//     "productType": "2",
//     "brand": "이지웨이건축자재",
//     "maker": "",
//     "category1": "생활/건강",
//     "category2": "생활용품",
//     "category3": "생활잡화",
//     "category4": "문풍지",
//     "description": "샷시 풍지판 창문 바람막이 베란다 문 틈막이 창틀 벌레 차단 샤시 방충망 틈새막이에 대한 상세 설명입니다. 이지웨이건축자재 브랜드의 우수한 품질을 자랑하는 상품으로, 고객 만족도가 높은 제품입니다.",
//     "rating": 4,
//     "reviewCount": 457,
//     "stock": 41,
//     "images": [
//         "https://shopping-phinf.pstatic.net/main_8694085/86940857379.1.jpg",
//         "https://shopping-phinf.pstatic.net/main_8694085/86940857379.1_2.jpg",
//         "https://shopping-phinf.pstatic.net/main_8694085/86940857379.1_3.jpg"
//     ]
// }
export const LoadedDetailPage = ({ product, relatedProducts }) => `
        <!-- 브레드크럼 -->
        ${BreadCrumbNavigation(product)}
        <!-- 상품 상세 정보 -->
        <div class="bg-white rounded-lg shadow-sm mb-6">
          <!-- 상품 이미지 -->
          <div class="p-4">
            <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img src="${product.image}" alt="${product.title}" class="w-full h-full object-cover product-detail-image">
            </div>
            <!-- 상품 정보 -->
            <div>
              <p class="text-sm text-gray-600 mb-1">${product.brand}</p>
              <h1 class="text-xl font-bold text-gray-900 mb-3">${product.title}</h1>
              <!-- 평점 및 리뷰 -->
              <div class="flex items-center mb-3">
                <div class="flex items-center">
                  ${StarRating(product.rating)}
                </div>
                <span class="ml-2 text-sm text-gray-600">${product.rating}.0 (${product.reviewCount}개 리뷰)</span>
              </div>
              <!-- 가격 -->
              <div class="mb-4">
                <span class="text-2xl font-bold text-blue-600">${Number(product.lprice).toLocaleString()}원</span>
              </div>
              <!-- 재고 -->
              <div class="text-sm text-gray-600 mb-4">
                재고 ${product.stock}개
              </div>
              <!-- 설명 -->
              <div class="text-sm text-gray-700 leading-relaxed mb-6">
                ${product.description}
              </div>
            </div>
          </div>
          <!-- 수량 선택 및 액션 -->
          <div class="border-t border-gray-200 p-4">
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm font-medium text-gray-900">수량</span>
              <div class="flex items-center">
                <button id="quantity-decrease" class="w-8 h-8 flex items-center justify-center border border-gray-300
                   rounded-l-md bg-gray-50 hover:bg-gray-100">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                  </svg>
                </button>
                <input type="number" id="quantity-input" value="1" min="1" max="${product.stock}" class="w-16 h-8 text-center text-sm border-t border-b border-gray-300
                  focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <button id="quantity-increase" class="w-8 h-8 flex items-center justify-center border border-gray-300
                   rounded-r-md bg-gray-50 hover:bg-gray-100">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                </button>
              </div>
            </div>
            <!-- 액션 버튼 -->
            <button id="add-to-cart-btn" data-product-id="${product.productId}" class="w-full bg-blue-600 text-white py-3 px-4 rounded-md
                 hover:bg-blue-700 transition-colors font-medium">
              장바구니 담기
            </button>
          </div>
        </div>
        <!-- 상품 목록으로 이동 -->
        <div class="mb-6">
          <button class="block w-full text-center bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 transition-colors go-to-product-list">
            상품 목록으로 돌아가기
          </button>
        </div>
        <!-- 관련 상품 -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="p-4 border-b border-gray-200">
            <h2 class="text-lg font-bold text-gray-900">관련 상품</h2>
            <p class="text-sm text-gray-600">같은 카테고리의 다른 상품들</p>
          </div>
          <div class="p-4">
            <div class="grid grid-cols-2 gap-3 responsive-grid">
              ${relatedProducts.map((rProduct) => RelatedProductCard(rProduct)).join("")}
            </div>
          </div>
        </div>
  `;
