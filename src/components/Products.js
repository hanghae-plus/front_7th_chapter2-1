import { getProducts } from "../api/productApi";
import router from "../Router.js";
import { store } from "../store/Store.js";

const Products = (targetNode) => {
  const render = () => {
    const isLoading = store.getState("isLoading");
    const data = store.getState("productsData");

    const ProductCard = (product) => {
      const { brand, image, lprice, productId, title } = product;
      return /* HTML */ `
        <div
          class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden product-card"
          data-product-id="${productId}"
        >
          <!-- 상품 이미지 -->
          <div class="aspect-square bg-gray-100 overflow-hidden cursor-pointer product-image">
            <img
              src="${image}"
              alt="${title}"
              class="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          </div>
          <!-- 상품 정보 -->
          <div class="p-3">
            <div class="cursor-pointer product-info mb-3">
              <h3 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">${title}</h3>
              <p class="text-xs text-gray-500 mb-2">${brand ?? ""}</p>
              <p class="text-lg font-bold text-gray-900">${Number(lprice).toLocaleString()}원</p>
            </div>
            <!-- 장바구니 버튼 -->
            <button
              class="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-md hover:bg-blue-700 transition-colors add-to-cart-btn"
              data-product-id="${productId}"
            >
              장바구니 담기
            </button>
          </div>
        </div>
      `;
    };

    targetNode.insertAdjacentHTML(
      "beforeend",
      /* HTML */ `<div class="mb-6">
        ${isLoading
          ? Skeleton()
          : /* HTML */ ` <div>
              <!-- 상품 개수 정보 -->
              <div class="mb-4 text-sm text-gray-600">
                총 <span class="font-medium text-gray-900">${data?.pagination?.total ?? 0}개</span>의 상품
              </div>
              <!-- 상품 그리드 -->
              <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
                ${data?.products?.map((product) => ProductCard(product)).join("") ?? ""}
              </div>
              <div class="text-center py-4 text-sm text-gray-500">모든 상품을 확인했습니다</div>
            </div>`}
      </div>`,
    );
  };

  const addEventListeners = () => {
    const $productsGrid = document.getElementById("products-grid");
    $productsGrid.addEventListener("click", (ev) => {
      const productCard = ev.target.closest(".product-card");

      if (productCard) {
        const productId = productCard.dataset.productId;
        router.push(`/product/${productId}`);
      } else {
        console.error("Product card not found.");
      }
    });
  };

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      store.setState("productsData", data);
    } catch (error) {
      console.error(error);
    } finally {
      store.setState("isLoading", false);
    }
  };

  const didMount = () => {
    addEventListeners();
    fetchProducts();
  };

  const onMount = () => {
    render();
    didMount();
  };

  onMount(targetNode);
};

export default Products;

const Skeleton = () => {
  return (
    /* HTML */
    `
      <div>
        <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
          ${Array.from({ length: 6 })
            .map(() => {
              return (
                /* HTML */
                `
                  <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                    <div class="aspect-square bg-gray-200"></div>
                    <div class="p-3">
                      <div class="h-4 bg-gray-200 rounded mb-2"></div>
                      <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div class="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
                      <div class="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                `
              );
            })
            .join("")}
        </div>
      </div>
    `
  );
};
