import Component from '@/core/component';
import ProductItem from '@/pages/home/components/ProductItem';
import ProductItemSkeleton from '@/pages/home/components/ProductItem.skeleton';
import ProductListLoading from '@/pages/home/components/ProductList.loading';

// TODO: 컴포넌트 정리!!
export default class ProductList extends Component {
  template() {
    const { products, loading } = this.props;

    return /* HTML */ `
      <div class="mb-6">
        ${(() => {
          if (loading) {
            return /* HTML */ `
              <div>
                <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
                  ${ProductItemSkeleton.repeat(4)}
                </div>
                ${ProductListLoading}
              </div>
            `;
          }

          if (!products || products.length === 0) {
            return /* HTML */ `<div><div class="text-center py-10">상품이 없습니다.</div></div>`;
          }

          return /* HTML */ `
            <div>
              <div class="mb-4 text-sm text-gray-600">
                총 <span class="font-medium text-gray-900">${products.length}개</span>의 상품
              </div>
              <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
                ${products.map(ProductItem).join('')}
              </div>
            </div>
          `;
        })()}
      </div>
    `;
  }
}
