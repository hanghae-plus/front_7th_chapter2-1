import State from "../store/stateStore";
import { getProduct, getProducts } from "../api/productApi";
import Product from "../component/Product";
import RelatedList from "../component/RelatedList";
import BreadCrumb from "../component/BreadCrumb";
import { addToCart } from "../module/cartModule";

const Loading = /*HTML*/ `
<div class="py-20 bg-gray-50 flex items-center justify-center">
  <div class="text-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
    <p class="text-gray-600">상품 정보를 불러오는 중...</p>
  </div>
</div>
`;

const ProductPage = async (render, { showToast }) => {
  const productId = new State("");

  const isLoading = new State(true);
  const product = new State({});
  const relatedProducts = new State({ products: [] });
  const quantity = new State(1);
  let isInitialized = false; // 초기화 여부 체크

  async function pageRender() {
    // 첫 렌더링 시에만 데이터 로드
    if (!isInitialized) {
      isInitialized = true;
      const id = window.location.pathname.split("/").pop();
      if (id && id !== "") {
        productId.set(id);
        await Promise.all([getProductData(), getRelatedProducts()]);
      }
      return;
    }
    isLoading.get()
      ? render(Loading)
      : render(/*html*/ `
    ${BreadCrumb({ category1: product.get().category1, category2: product.get().category2 })}
    <!-- 상품 상세 정보 -->
    ${Product({ product: product.get(), quantity: quantity.get() })}  
    <!-- 상품 목록으로 이동 -->
    <div class="mb-6">
      <button class="block w-full text-center bg-gray-100 text-gray-700 py-3 px-4 rounded-md
        hover:bg-gray-200 transition-colors go-to-product-list">
        상품 목록으로 돌아가기
      </button>
    </div>
    ${RelatedList({ relatedProducts: relatedProducts.get().products })}
`);
  }

  window.addEventListener("popstate", () => {
    const id = window.location.pathname.includes("/product") ? window.location.pathname.split("/").pop() : "";
    if (id) {
      productId.set(id);
      getProductData();
      getRelatedProducts();
    }
  });

  addEventListener("click", (e) => {
    // 장바구니 담기
    if (e.target.closest("#add-to-cart-btn")) {
      addToCart(product.get(), quantity.get());
      pageRender();
      showToast({ message: "장바구니에 추가되었습니다", type: "success" });
    }

    //수량 증가/감소
    if (e.target.closest("#quantity-decrease")) {
      quantity.get() > 1 && quantity.set(quantity.get() - 1, pageRender);
    }
    if (e.target.closest("#quantity-increase")) {
      quantity.set(quantity.get() + 1, pageRender);
    }

    if (e.target.closest(".related-product-card")) {
      const productId = e.target.closest(".related-product-card").dataset.productId;
      const newUrl = `${import.meta.env.BASE_URL}product/${productId}`;
      history.pushState(null, "", newUrl);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }

    // 브레드크럼 카테고리 클릭
    if (e.target.dataset.category1 && !e.target.dataset.category2) {
      const category1 = e.target.dataset.category1;
      const newUrl = `${import.meta.env.BASE_URL}?category1=${encodeURIComponent(category1)}`;
      history.pushState(null, "", newUrl);
    }

    if (e.target.dataset.category2 && window.location.pathname.includes("/product")) {
      const category1 = product.get().category1;
      const category2 = e.target.dataset.category2;
      const newUrl = `${import.meta.env.BASE_URL}?category1=${encodeURIComponent(category1)}&category2=${encodeURIComponent(category2)}`;
      history.pushState(null, "", newUrl);
    }
  });

  addEventListener("change", (e) => {
    if (e.target.closest("#quantity-input")) {
      quantity.set(Number(e.target.value), pageRender);
    }
  });

  const getProductData = async () => {
    isLoading.set(true);
    const productData = await getProduct(productId.get());
    product.set(productData);
    isLoading.set(false);
    pageRender();
  };

  const getRelatedProducts = async () => {
    const relatedProductsData = await getProducts({
      category1: product.get().category1,
      category2: product.get().category2,
    });
    const filteredRelatedProductsData = {
      ...relatedProductsData,
      products: relatedProductsData.products.filter((product) => product.productId !== productId.get()),
    };
    relatedProducts.set(filteredRelatedProductsData);
    pageRender();
  };

  return { pageRender };
};

export default ProductPage;
