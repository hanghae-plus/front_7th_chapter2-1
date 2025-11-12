import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import CartModal from '@/components/modal/CartModal';
import Component from '@/core/component';

export default class Layout extends Component {
  template() {
    return /* HTML */ `
      <div class="min-h-screen bg-gray-50">
        <div data-slot="header"></div>
        <div data-slot="main"></div>
        <div data-container="cart-modal"></div>
        <div data-slot="footer"></div>
      </div>
    `;
  }

  mounted() {
    const { children: Children, props } = this.props;

    const $header = this.$target.querySelector('[data-slot="header"]');
    const $footer = this.$target.querySelector('[data-slot="footer"]');
    const $cartModal = this.$target.querySelector('[data-container="cart-modal"]');
    const $main = this.$target.querySelector('[data-slot="main"]');

    new Header($header, { isDetailPage: Boolean(props?.params.id) });
    new Footer($footer);
    new CartModal($cartModal);

    if (Children) new Children($main, props);
  }
}
