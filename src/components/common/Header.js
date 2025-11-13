import { CartButton } from "../cart/CartDialog.js";

export const Header = ({ showBackButton, isTitleLink, title, link = "" }) => {
  return /*html*/ `
    <header class="bg-white shadow-sm sticky top-0 z-40">
        <div class="max-w-md mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
                <!-- 헤더 왼쪽 -->
                <div class="flex items-center space-x-3">
                    ${
                      showBackButton
                        ? `
                        <button onclick="window.history.back()" class="p-2 text-gray-700 hover:text-gray-900 transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                        </button>
                    `
                        : ""
                    }
                    <h1 class="text-xl font-bold text-gray-900">
                        ${
                          isTitleLink
                            ? `
                                <a href=${link} data-link="">${title}</a>
                        `
                            : `<span>${title}</span>`
                        }
                    </h1>
                </div>

                <!-- 헤더 오른쪽 -->
                <div class="flex items-center space-x-2">
                    ${CartButton()}
                </div>
            </div>
        </div>
    </header>
  `;
};
