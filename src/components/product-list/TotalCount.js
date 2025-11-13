import { store } from "@/store/store.js";

export const TotalCount = () => {
  const {
    pagination: { total },
  } = store.state;

  return html`
    <div class="mb-4 text-sm text-gray-600">
      총 <span class="font-medium text-gray-900">${total.toLocaleString()}개</span>의 상품
    </div>
  `;
};
