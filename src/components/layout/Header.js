import CartButton from '@/components/layout/CartButton';
import PageTitle from '@/components/layout/PageTitle';
import Component from '@/core/component';

export default class Header extends Component {
  template() {
    return /* HTML */ `
      <header class="bg-white shadow-sm sticky top-0 z-40">
        <div class="max-w-md mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div data-slot="page-title"></div>
            <div class="flex items-center space-x-2">
              <div data-slot="cart-button"></div>
            </div>
          </div>
        </div>
      </header>
    `;
  }

  mounted() {
    const { isDetailPage } = this.props;

    const $pageTitle = this.$target.querySelector('[data-slot="page-title"]');
    const $cartButton = this.$target.querySelector('[data-slot="cart-button"]');

    new PageTitle($pageTitle, { isDetailPage });
    new CartButton($cartButton);
  }
}
