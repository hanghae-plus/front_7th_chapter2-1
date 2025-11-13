// @ts-check
import createComponent from "../core/component/create-component";
import { CategoryViewModel } from "../view-models/CategoryViewModel";

// /**
//  * @typedef {import('../view-models/CategoryViewModel.js').CategoryViewModel} CategoryViewModel
//  */

const CategoryFilter = createComponent({
  id: "category-filter",
  props: {
    categories: [],
    selectedCategory1: "",
    selectedCategory2: "",
    handleSetSelectedCategory1: () => {},
    handleSetSelectedCategory2: () => {},
  },
  eventHandlers: {
    "category1-filter": (props, getter, setter, event) => {
      if (!event.target) return;
      const value = event.target.dataset.category1;
      props.handleSetSelectedCategory1(value);
      if (props.selectedCategory2) {
        props.handleSetSelectedCategory2("");
      }
    },
    "category2-filter": (props, getter, setter, event) => {
      if (!event.target) return;
      const value = event.target.dataset.category2;
      props.handleSetSelectedCategory2(value);
    },
    "category-reset": (props, getter, setter, event) => {
      if (!event.target) return;
      props.handleSetSelectedCategory1("");
      props.handleSetSelectedCategory2("");
    },
  },
  templateFn: (props) => {
    const viewModel = new CategoryViewModel(props.categories, props.selectedCategory1, props.selectedCategory2);
    const firstDepthOptions = viewModel.getFirstDepthOptions();
    const secondDepthOptions = viewModel.getSecondDepthOptions();

    return /* HTML */ `
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600">카테고리:</label>
          <button
            data-breadcrumb="reset"
            data-event="category-reset"
            data-event-type="click"
            class="text-xs hover:text-blue-800 hover:underline"
          >
            전체
          </button>
          ${props.selectedCategory1 &&
          /* HTML */ `
            <span class="text-xs text-gray-500">&gt;</span>
            <button
              data-breadcrumb="category1"
              data-category1="${props.selectedCategory1}"
              data-event="category1-filter"
              data-event-type="click"
              class="text-xs hover:text-blue-800 hover:underline"
            >
              ${props.selectedCategory1}
            </button>
          `}
          ${props.selectedCategory2 &&
          /* HTML */ `
            <span class="text-xs text-gray-500">&gt;</span>
            <span class="text-xs text-gray-600 cursor-default">${props.selectedCategory2}</span>
          `}
        </div>
        <!-- 1depth 카테고리 -->
        <div class="flex flex-wrap gap-2">
          ${(!props.selectedCategory2 && !props.selectedCategory1
            ? firstDepthOptions.map(
                (option) => /* HTML */ `
                  <button
                    id="category-filter-btn"
                    data-category1="${option.value}"
                    data-event="category1-filter"
                    data-event-type="click"
                    class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
                ${option.selected
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}"
                  >
                    ${option.label}
                  </button>
                `,
              )
            : secondDepthOptions.map(
                (option) => /* HTML */ `
                  <button
                    id="category-filter-btn"
                    data-category1="${props.selectedCategory1}"
                    data-category2="${option.value}"
                    data-event="category2-filter"
                    data-event-type="click"
                    class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
                    ${option.selected
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}"
                  >
                    ${option.label}
                  </button>
                `,
              )
          ).join("\n")}
        </div>
      </div>
    `;
  },
});

export default CategoryFilter;
