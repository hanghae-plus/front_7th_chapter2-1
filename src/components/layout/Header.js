import CartButton from '@/components/layout/CartButton';
import PageTitle from '@/components/layout/PageTitle';

const Header = () => {
  return /* HTML */ `
    <header class="bg-white shadow-sm sticky top-0 z-40">
      <div class="max-w-md mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          ${PageTitle()}
          <div class="flex items-center space-x-2">${CartButton()}</div>
        </div>
      </div>
    </header>
  `;
};

export default Header;
