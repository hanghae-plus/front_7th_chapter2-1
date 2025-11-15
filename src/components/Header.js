import { CartIcon } from "./cart/CartIcon";

export const Header = () => {
  return `  <header class="bg-white shadow-sm sticky top-0 z-40">
    <div class="max-w-md mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-900">
          <a href="#" data-action="navigate-home" class="cursor-pointer">쇼핑몰</a>
        </h1>
        <div class="flex items-center space-x-2" data-cart-icon>
          ${CartIcon()}
        </div>
      </div>
    </div>
  </header>`;
};
