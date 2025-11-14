import { getProduct, getProducts } from "../api/productApi";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { store } from "../store/Store";
import router from "../Router.js";

const ProductDetail = (targetNode) => {
  const productId = window.location.pathname.split("/").at(-1);

  const registerStore = () => {
    store.subscribe("isProductDetailLoading", onUpdate);
    store.setState("isProductDetailLoading", true);
    store.subscribe("productData", onUpdate);
    store.setState("productData", null);
    store.subscribe("relatedProducts", onUpdate);
    store.setState("relatedProducts", []);
  };

  const render = () => {
    const isProductDetailLoading = store.getState("isProductDetailLoading");
    const data = store.getState("productData");
    const relatedProducts = store.getState("relatedProducts");

    targetNode.innerHTML = /* HTML */ `
      <div class="min-h-screen bg-gray-50">
        ${Header({ title: "상품 상세" })}
        <main class="max-w-md mx-auto px-4 py-4">
          ${isProductDetailLoading
            ? Loading()
            : /* HTML */ `
                <!-- 브레드크럼 -->
                <nav class="mb-4">
                  <div class="flex items-center space-x-2 text-sm text-gray-600">
                    <a href="/" data-link="" class="hover:text-blue-600 transition-colors">홈</a>
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                    <button
                      class="breadcrumb-link hover:text-blue-600 transition-colors"
                      data-category1="${data?.category1}"
                    >
                      ${data?.category1}
                    </button>
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                    <button
                      class="breadcrumb-link hover:text-blue-600 transition-colors"
                      data-category1="${data?.category1}"
                      data-category2="${data?.category2}"
                    >
                      ${data?.category2}
                    </button>
                  </div>
                </nav>
                <!-- 상품 상세 정보 -->
                <div class="bg-white rounded-lg shadow-sm mb-6">
                  <!-- 상품 이미지 -->
                  <div class="p-4">
                    <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                      <img
                        src=${data?.image}
                        alt=${data?.title}
                        class="w-full h-full object-cover product-detail-image"
                      />
                    </div>
                    <!-- 상품 정보 -->
                    <div>
                      <p class="text-sm text-gray-600 mb-1">${data?.brand}</p>
                      <h1 class="text-xl font-bold text-gray-900 mb-3">${data?.title}</h1>
                      <!-- 평점 및 리뷰 -->
                      <div class="flex items-center mb-3">
                        <div class="flex items-center">
                          ${Array.from({ length: data?.rating || 5 })
                            .map(() => {
                              return /* HTML */ `
                                <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                  ></path>
                                </svg>
                              `;
                            })
                            .join("")}
                          ${Array.from({ length: 5 - (data?.rating || 0) })
                            .map(() => {
                              return /* HTML */ `
                                <svg class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                  ></path>
                                </svg>
                              `;
                            })
                            .join("")}
                        </div>
                        <span class="ml-2 text-sm text-gray-600"
                          >${Number(data?.rating || 5).toFixed(1)} (${data?.reviewCount}개 리뷰)</span
                        >
                      </div>
                      <!-- 가격 -->
                      <div class="mb-4">
                        <span class="text-2xl font-bold text-blue-600">${Number(data?.lprice).toLocaleString()}원</span>
                      </div>
                      <!-- 재고 -->
                      <div class="text-sm text-gray-600 mb-4">재고 ${Number(data?.stock).toLocaleString()}개</div>
                      <!-- 설명 -->
                      <div class="text-sm text-gray-700 leading-relaxed mb-6">${data?.description}</div>
                    </div>
                  </div>
                  <!-- 수량 선택 및 액션 -->
                  <div class="border-t border-gray-200 p-4">
                    <div class="flex items-center justify-between mb-4">
                      <span class="text-sm font-medium text-gray-900">수량</span>
                      <div class="flex items-center">
                        <button
                          id="quantity-decrease"
                          class="w-8 h-8 flex items-center justify-center border border-gray-300 
           rounded-l-md bg-gray-50 hover:bg-gray-100"
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
                          max="107"
                          class="w-16 h-8 text-center text-sm border-t border-b border-gray-300 
          focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          id="quantity-increase"
                          class="w-8 h-8 flex items-center justify-center border border-gray-300 
           rounded-r-md bg-gray-50 hover:bg-gray-100"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M12 4v16m8-8H4"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <!-- 액션 버튼 -->
                    <button
                      id="add-to-cart-btn"
                      data-product-id="85067212996"
                      class="w-full bg-blue-600 text-white py-3 px-4 rounded-md 
         hover:bg-blue-700 transition-colors font-medium"
                    >
                      장바구니 담기
                    </button>
                  </div>
                </div>
                <!-- 상품 목록으로 이동 -->
                <div class="mb-6">
                  <button
                    class="block w-full text-center bg-gray-100 text-gray-700 py-3 px-4 rounded-md 
    hover:bg-gray-200 transition-colors go-to-product-list"
                  >
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
                      ${relatedProducts
                        ?.map(
                          (product) => /* HTML */ `
                            <div
                              class="bg-gray-50 rounded-lg p-3 related-product-card cursor-pointer"
                              data-product-id="${product.productId}"
                            >
                              <div class="aspect-square bg-white rounded-md overflow-hidden mb-2">
                                <img
                                  src="${product.image}"
                                  alt="${product.title}"
                                  class="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <h3 class="text-sm font-medium text-gray-900 mb-1 line-clamp-2">${product.title}</h3>
                              <p class="text-sm font-bold text-blue-600">
                                ${Number(product.lprice).toLocaleString()}원
                              </p>
                            </div>
                          `,
                        )
                        .join("")}
                    </div>
                  </div>
                </div>
              `}
        </main>
        ${Footer()}
      </div>
    `;
  };

  const onUpdate = () => {
    render();
    addEventListeners();
  };

  const fetchProduct = async () => {
    try {
      const data = await getProduct(productId);
      store.setState("productData", data);

      if (data?.category2) {
        fetchRelatedProducts(data.category2);
      }
    } catch (error) {
      console.error(error);
    } finally {
      store.setState("isProductDetailLoading", false);
    }
  };

  const fetchRelatedProducts = async (category2) => {
    try {
      const data = await getProducts({ category2, limit: 20 });

      const filtered = data.products.filter((product) => product.productId !== productId);
      store.setState("relatedProducts", filtered);
    } catch (error) {
      console.error(error);
    }
  };

  const addEventListeners = () => {
    // 홈 링크 클릭
    const homeLink = targetNode.querySelector('a[data-link=""]');
    if (homeLink) {
      homeLink.addEventListener("click", (e) => {
        e.preventDefault();
        router.push(`${import.meta.env.BASE_URL}`);
      });
    }

    // 카테고리1 breadcrumb 클릭
    const category1Buttons = targetNode.querySelectorAll(".breadcrumb-link[data-category1]");
    category1Buttons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const category1 = button.dataset.category1;
        router.push(`${import.meta.env.BASE_URL}?category1=${encodeURIComponent(category1)}`);
      });
    });

    // 카테고리2 breadcrumb 클릭
    const category2Buttons = targetNode.querySelectorAll(".breadcrumb-link[data-category2]");
    category2Buttons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const category1 = button.dataset.category1;
        const category2 = button.dataset.category2;
        router.push(
          `${import.meta.env.BASE_URL}?category1=${encodeURIComponent(category1)}&category2=${encodeURIComponent(category2)}`,
        );
      });
    });

    // 상품 목록으로 돌아가기 버튼
    const goToListButton = targetNode.querySelector(".go-to-product-list");
    if (goToListButton) {
      goToListButton.addEventListener("click", () => {
        const category1 = store.getState("selectedCategory1");
        const category2 = store.getState("selectedCategory2");
        // const limit = store.getState("selectedLimit");
        // const sort = store.getState("selectedSort");
        // const search = store.getState("searchKeyword");

        // 현재 필터 상태를 쿼리 스트링으로 유지
        const params = new URLSearchParams();
        if (category1) params.set("category1", category1);
        if (category2) params.set("category2", category2);
        // if (limit) params.set("limit", limit);
        // if (sort) params.set("sort", sort);
        // if (search) params.set("search", search);

        const queryString = params.toString();
        router.push(`${import.meta.env.BASE_URL}${queryString ? `?${queryString}` : ""}`);
      });
    }

    // 관련 상품 클릭
    const relatedProductCards = targetNode.querySelectorAll(".related-product-card");
    relatedProductCards.forEach((card) => {
      card.addEventListener("click", () => {
        const productId = card.dataset.productId;
        router.push(`${import.meta.env.BASE_URL}product/${productId}`);
      });
    });

    // 수량 증가/감소 버튼
    const quantityInput = targetNode.querySelector("#quantity-input");
    const decreaseBtn = targetNode.querySelector("#quantity-decrease");
    const increaseBtn = targetNode.querySelector("#quantity-increase");

    if (quantityInput && decreaseBtn && increaseBtn) {
      const productData = store.getState("productData");
      const maxStock = productData?.stock || 100;

      // 수량 감소 버튼
      decreaseBtn.addEventListener("click", () => {
        const currentValue = parseInt(quantityInput.value) || 1;
        if (currentValue > 1) {
          quantityInput.value = currentValue - 1;
        }
      });

      // 수량 증가 버튼
      increaseBtn.addEventListener("click", () => {
        const currentValue = parseInt(quantityInput.value) || 1;
        if (currentValue < maxStock) {
          quantityInput.value = currentValue + 1;
        }
      });

      // 수량 직접 입력 시 유효성 검사
      quantityInput.addEventListener("input", (e) => {
        let value = parseInt(e.target.value);
        if (isNaN(value) || value < 1) {
          e.target.value = 1;
        } else if (value > maxStock) {
          e.target.value = maxStock;
        }
      });

      // 포커스 아웃 시 빈 값 방지
      quantityInput.addEventListener("blur", (e) => {
        if (e.target.value === "" || isNaN(parseInt(e.target.value))) {
          e.target.value = 1;
        }
      });
    }
  };

  const didMount = () => {
    addEventListeners();
    fetchProduct();
  };

  const onMount = () => {
    registerStore();
    render();
    didMount();
  };

  onMount();
};

export default ProductDetail;

const Loading = () => {
  return /* HTML */ `
    <div class="py-20 bg-gray-50 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">상품 정보를 불러오는 중...</p>
      </div>
    </div>
  `;
};
