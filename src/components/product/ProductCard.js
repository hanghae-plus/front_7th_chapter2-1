// {
//     "title": "실리카겔 50g 습기제거제 제품 /산업 신발 의류 방습제",
//     "link": "https://smartstore.naver.com/main/products/4549948287",
//     "image": "https://shopping-phinf.pstatic.net/main_8209446/82094468339.4.jpg",
//     "lprice": "280",
//     "hprice": "",
//     "mallName": "제이제이상사",
//     "productId": "82094468339",
//     "productType": "2",
//     "brand": "",
//     "maker": "",
//     "category1": "생활/건강",
//     "category2": "생활용품",
//     "category3": "제습/방향/탈취",
//     "category4": "제습제"
// },
export default function ProductCard({ product }) {
  return /*html*/ `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden product-card cursor-pointer" data-product-id="${product.productId}">
      <!-- 상품 이미지 -->
      <div class="aspect-square bg-gray-100 overflow-hidden">
        <img
          src="${product.image}"
          alt="${product.title}"
          class="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
      </div>
      <!-- 상품 정보 -->
      <div class="p-3">
        <div class="product-info mb-3">
          <h3 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
            ${product.title}
          </h3>
          <p class="text-xs text-gray-500 mb-2">${product.brand || ""}</p>
          <p class="text-lg font-bold text-gray-900">${Number(product.lprice).toLocaleString()}원</p>
        </div>
        <!-- 장바구니 버튼 -->
        <button
          class="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-md hover:bg-blue-700 transition-colors add-to-cart-btn"
          data-product-id="${product.productId}"
        >
          장바구니 담기
        </button>
      </div>
    </div>
  `;
}
