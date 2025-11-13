import { Component } from "@/core/Component";
import { Router } from "@/core/Router";

const Breadcrumb = Component({
  template: ({ props }) => {
    const { category1, category2 } = props;

    if (!category1) {
      return /* HTML */ `
        <nav class="mb-4">
          <div class="flex items-center space-x-2 text-sm text-gray-600">
            <span class="hover:text-blue-600 transition-colors cursor-pointer" id="breadcrumb-home">홈</span>
          </div>
        </nav>
      `;
    }

    return /* HTML */ `
      <nav class="mb-4">
        <div class="flex items-center space-x-2 text-sm text-gray-600">
          <span class="hover:text-blue-600 transition-colors cursor-pointer" id="breadcrumb-home">홈</span>
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
          <span
            class="hover:text-blue-600 transition-colors cursor-pointer breadcrumb-category1"
            data-category1="${category1}"
          >
            ${category1}
          </span>
          ${category2
            ? /* HTML */ `
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
                <span
                  class="hover:text-blue-600 transition-colors cursor-pointer breadcrumb-category2"
                  data-category1="${category1}"
                  data-category2="${category2}"
                >
                  ${category2}
                </span>
              `
            : ""}
        </div>
      </nav>
    `;
  },

  setEvent: ({ addEvent }) => {
    const router = Router();

    // 홈 클릭
    addEvent("#breadcrumb-home", "click", () => {
      router.push("/");
    });

    // 카테고리1 클릭
    addEvent(".breadcrumb-category1", "click", (e) => {
      const category1 = e.target.dataset.category1;
      router.push(`/?category1=${encodeURIComponent(category1)}`);
    });

    // 카테고리2 클릭
    addEvent(".breadcrumb-category2", "click", (e) => {
      const category1 = e.target.dataset.category1;
      const category2 = e.target.dataset.category2;
      router.push(`/?category1=${encodeURIComponent(category1)}&category2=${encodeURIComponent(category2)}`);
    });
  },
});

export default Breadcrumb;
