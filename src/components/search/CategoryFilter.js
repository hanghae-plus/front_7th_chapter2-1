import { store } from "../../store/store";

export const CategoryFilter = () => {
  const $el = document.createElement("div");
  $el.className = "space-y-2";

  const render = () => {
    const { loading, categories, selectedMain, selectedSub } = store.state;
    console.log(categories, selectedMain, selectedSub);
    $el.innerHTML = /* HTML */ `
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600">카테고리:</label>
          <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button
          ><span class="text-xs text-gray-500">&gt;</span
          ><button
            data-breadcrumb="category1"
            data-category1="생활/건강"
            class="text-xs hover:text-blue-800 hover:underline"
          >
            생활/건강</button
          ><span class="text-xs text-gray-500">&gt;</span
          ><span class="text-xs text-gray-600 cursor-default">주방용품</span>
        </div>
        <div class="space-y-2">
          ${loading
            ? /* HTML */ `<div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>`
            : /* HTML */ ` <button
                  data-category1="생활/건강"
                  data-category2="생활용품"
                  class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  생활용품
                </button>
                <button
                  data-category1="생활/건강"
                  data-category2="주방용품"
                  class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-blue-100 border-blue-300 text-blue-800"
                >
                  주방용품
                </button>
                <button
                  data-category1="생활/건강"
                  data-category2="문구/사무용품"
                  class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  문구/사무용품
                </button>`}
        </div>
      </div>
    `;
  };

  store.subscribe(render);
  return $el;
};
