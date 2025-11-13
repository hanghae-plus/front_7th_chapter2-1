import { Component } from "../../core/component/Component";
import { useNavigate } from "../../hooks/useNavigate";
import { useParams } from "../../hooks/useParams";
import { cartStore } from "../../stores/cart-store";
import { html } from "../../utils/html";
import { ProductDetailPageSkeleton } from "./ProductDetailPageSkeleton";
import { ProductDetailViewModel } from "./ProductDetailViewModel";
import { NavigateBreadcrumbButton } from "./_components/NavigateBreadcrumbButton";
import { ProductDetailCard } from "./_components/ProductDetailCard";
import { ProductQuantitySelect } from "./_components/ProductQuantitySelect";
import { AddCartButton } from "./_components/AddCartButton";
import { NavigateHomeButton } from "./_components/NavigateHomeButton";
import { RelatedProductCardList } from "./_components/RelatedProductCardList";

export class ProductDetailPage extends Component {
  setup() {
    const { productId } = useParams();

    this.vm = new ProductDetailViewModel(productId);
    this.state = this.vm.state;
    this.navigate = useNavigate();

    this.vm.subscribe((newState) => {
      this.state = newState;
      this.render();
    });

    this.useEffect(() => {
      this.vm.init();
      const handleRender = () => this.render();

      cartStore.subscribe(handleRender);

      return () => {
        cartStore.unsubscribe(handleRender);
      };
    }, []);
  }

  render() {
    super.render();
    this.renderComponents();
  }

  renderComponents() {
    if (this.state.isLoading) return;

    const { product, quantity, relatedProducts } = this.state;
    const { productId } = product;

    const breadcrumbNav = this.$target.querySelector('[data-component="product-detail-breadcrumb"]');
    const productDetailCard = this.$target.querySelector('[data-component="product-detail-card"]');
    const quantitySelect = this.$target.querySelector('[data-component="product-quantity-select"]');
    const addCartButton = this.$target.querySelector('[data-component="add-cart-button"]');
    const navigateHomeButton = this.$target.querySelector('[data-component="navigate-home-button"]');
    const relatedProductList = this.$target.querySelector('[data-component="related-product-list"]');

    new NavigateBreadcrumbButton(breadcrumbNav, {
      category1: product.category1,
      category2: product.category2,
    });

    new ProductDetailCard(productDetailCard, {
      product,
    });

    new ProductQuantitySelect(quantitySelect, {
      quantity,
      onQuantityDecrease: this.vm.handleQuantityDecrease.bind(this),
      onQuantityIncrease: this.vm.handleQuantityIncrease.bind(this),
    });

    new AddCartButton(addCartButton, { productId, onAddToCart: this.vm.handleAddToCart.bind(this) });

    new NavigateHomeButton(navigateHomeButton);

    new RelatedProductCardList(relatedProductList, { relatedProducts });
  }

  template() {
    const { isLoading } = this.state;

    if (isLoading) {
      return ProductDetailPageSkeleton();
    }

    return html`
      <main class="max-w-md mx-auto px-4 py-4">
        <!-- 브레드크럼 -->
        <div data-component="product-detail-breadcrumb"></div>

        <!-- 상품 상세 정보 -->
        <div data-component="product-detail-card"></div>

        <!-- 수량 선택 및 액션 -->
        <div class="border-t border-gray-200 p-4 bg-white rounded-lg shadow-sm mb-6">
          <div data-component="product-quantity-select"></div>
          <!-- 액션 버튼 -->
          <div data-component="add-cart-button"></div>
        </div>

        <!-- 상품 목록으로 이동 -->
        <div class="mb-6">
          <div data-component="navigate-home-button"></div>
        </div>

        <!-- 관련 상품 -->
        <div data-component="related-product-list"></div>
      </main>
    `;
  }
}
