const LoadingTemplate = /*html*/ `
  <div class="py-20 bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">상품 정보를 불러오는 중...</p>
    </div>
  </div>
`;

const ErrorTemplate = (message) => /*html*/ `
  <div class="bg-white rounded-lg shadow-sm border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">
    <p class="mb-4">${message}</p>
    <button data-navigate="home" class="inline-flex items-center gap-2 rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition">
      상품 목록으로 돌아가기
    </button>
  </div>
`;

const formatCurrency = (value) => {
  const number = Number(value);
  return Number.isNaN(number) ? value : `${number.toLocaleString()}원`;
};

const renderRating = (rating, reviewCount) => {
  if (typeof rating !== "number") {
    return "";
  }
  const stars = Math.round(rating);
  const filledStar = `
    <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
    </svg>
  `;
  const emptyStar = `
    <svg class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
    </svg>
  `;
  const starsTemplate = Array.from({ length: 5 }, (_, index) => (index < stars ? filledStar : emptyStar)).join("");
  const reviewText =
    typeof reviewCount === "number"
      ? `<span class="ml-2 text-sm text-gray-600">${rating.toFixed(1)} (${reviewCount}개 리뷰)</span>`
      : "";

  return `
    <div class="flex items-center mb-3">
      <div class="flex items-center">
        ${starsTemplate}
      </div>
      ${reviewText}
    </div>
  `;
};

const renderThumbnails = (images = []) => {
  const uniqueImages = Array.from(new Set(images.filter(Boolean)));
  if (uniqueImages.length <= 1) {
    return "";
  }

  return `
    <div class="grid grid-cols-3 gap-2 mt-2">
      ${uniqueImages
        .slice(0, 6)
        .map(
          (url) => `
        <div class="aspect-square bg-gray-100 rounded-md overflow-hidden">
          <img src="${url}" alt="상품 미리보기" class="w-full h-full object-cover">
        </div>
      `,
        )
        .join("")}
    </div>
  `;
};

const renderRelatedProducts = (related = []) => {
  if (!Array.isArray(related) || related.length === 0) {
    return `
      <p class="text-sm text-gray-500">관련 상품 정보를 준비 중입니다.</p>
    `;
  }

  return `
    <div class="grid grid-cols-2 gap-3 responsive-grid">
      ${related
        .slice(0, 4)
        .map(
          (item) => `
        <div class="bg-gray-50 rounded-lg p-3 related-product-card cursor-pointer" data-product-id="${item.productId}">
          <div class="aspect-square bg-white rounded-md overflow-hidden mb-2">
            <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover" loading="lazy">
          </div>
          <h3 class="text-sm font-medium text-gray-900 mb-1 line-clamp-2">${item.title}</h3>
          <p class="text-sm font-bold text-blue-600">${formatCurrency(item.lprice)}</p>
        </div>
      `,
        )
        .join("")}
    </div>
  `;
};

export const DetailContent = ({ product, loading = false, error = null } = {}) => {
  if (loading) {
    return LoadingTemplate;
  }

  if (error) {
    return ErrorTemplate(error);
  }

  if (!product) {
    return ErrorTemplate("상품 정보를 찾을 수 없습니다.");
  }

  const {
    title,
    description,
    image,
    images = [],
    lprice,
    mallName,
    stock,
    rating,
    reviewCount,
    brand,
    maker,
    relatedProducts = [],
  } = product;

  const price = formatCurrency(lprice);
  const thumbnails = renderThumbnails([image, ...images]);
  const ratingTemplate = renderRating(rating, reviewCount);
  const vendorInfo = [brand, maker, mallName].filter(Boolean).join(" • ");

  return /*html*/ `
    <article class="space-y-6">
      <section class="bg-white rounded-lg shadow-sm">
        <div class="p-4">
          <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img src="${image}" alt="${title}" class="w-full h-full object-cover">
          </div>
          ${thumbnails}
          <div class="mt-4 space-y-4">
            <header>
              <p class="text-sm text-gray-500 mb-1">${vendorInfo}</p>
              <h1 class="text-xl font-bold text-gray-900 mb-3">${title}</h1>
              ${ratingTemplate}
            </header>
            <div>
              <span class="text-2xl font-bold text-blue-600">${price}</span>
              ${typeof stock === "number" ? `<p class="text-sm text-gray-600 mt-1">재고 ${stock}개</p>` : ""}
            </div>
            <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              ${description ?? "상세 설명이 준비되어 있지 않습니다."}
            </p>
          </div>
        </div>
        <div class="border-t border-gray-100 p-4 space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-900">수량</span>
            <div class="flex items-center">
              <button
                type="button"
                data-quantity-decrease
                class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                </svg>
              </button>
              <input
                type="number"
                id="quantity-input"
                value="1"
                min="1"
                ${typeof stock === "number" ? `max="${stock}"` : ""}
                class="w-16 h-8 text-center text-sm border-t border-b border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                data-quantity-increase
                class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
              </button>
            </div>
          </div>
          <button
            data-product-id="${product.productId}"
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium add-to-cart"
          >
            장바구니 담기
          </button>
        </div>
      </section>

      <section class="bg-white rounded-lg shadow-sm">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-lg font-bold text-gray-900">관련 상품</h2>
          <p class="text-sm text-gray-600">같은 카테고리의 다른 상품들</p>
        </div>
        <div class="p-4">
          ${renderRelatedProducts(relatedProducts)}
        </div>
      </section>

      <div class="flex justify-center">
        <button
          data-navigate="home"
          class="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
        >
          상품 목록으로 돌아가기
        </button>
      </div>
    </article>
  `;
};
