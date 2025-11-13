import { Component } from "../../../core/component/Component";

const depth1Style =
  "category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50";

const depth2Style =
  "category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50";

const selectedStyle =
  "category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-blue-100 border-blue-300 text-blue-800";

export class CategoryFilter extends Component {
  setEvents() {
    const { onCategory1Filter, onCategory2Filter, onResetFilter, onCategory1Click } = this.props;
    // 카테고리1 필터 버튼 클릭 이벤트
    this.addEventListener("click", ".category1-filter-btn", (e) => onCategory1Filter(e.target.dataset.category1));

    // 카테고리2 필터 버튼 클릭 이벤트
    this.addEventListener("click", ".category2-filter-btn", (e) => onCategory2Filter(e.target.dataset.category2));

    // 브래드크럼 전체 버튼 클릭 이벤트
    this.addEventListener("click", '[data-breadcrumb="reset"]', () => onResetFilter());

    // 브래드크럼 1depth 카테고리 버튼 클릭 이벤트
    this.addEventListener("click", '[data-breadcrumb="category1"]', () => onCategory1Click());
  }

  template() {
    const { category1, category2 } = this.props;

    const breadcrumb = category1
      ? html` <span class="text-xs text-gray-500">&gt;</span>
          <button
            data-breadcrumb="category1"
            data-category1="${category1}"
            class="text-xs hover:text-blue-800 hover:underline"
          >
            ${category1}
          </button>`
      : "";

    const breadcrumb2 = category2
      ? html`<span class="text-xs text-gray-500">&gt;</span>
          <span class="text-xs text-gray-600 cursor-default">${category2}</span>`
      : "";

    return html`
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600">카테고리:</label>
          <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
          ${breadcrumb} ${breadcrumb2}
        </div>
        <div class="space-y-2">${category1 ? Category2Buttons({ category1, category2 }) : Category1Buttons()}</div>
      </div>
    `;
  }
}

const Category1Buttons = () => {
  return html`
    <div class="flex flex-wrap gap-2">
      <button data-category1="생활/건강" class="${depth1Style}">생활/건강</button>
      <button data-category1="디지털/가전" class="${depth1Style}">디지털/가전</button>
    </div>
  `;
};

const Category2Buttons = ({ category1, category2 }) => {
  const style = (category) => (category === category2 ? selectedStyle : depth2Style);

  if (category1 === "생활/건강") {
    return html`
      <div class="flex flex-wrap gap-2">
        ${[
          "생활용품",
          "주방용품",
          "문구/사무용품",
          "자동차용품",
          "구강위생용품",
          "수납/정리용품",
          "욕실용품",
          "세탁용품",
          "공구",
          "청소용품",
          "정원/원예용품",
          "수집품",
          "관상어용품",
          "반려동물",
        ]
          .map(
            (category) => html`
              <button data-category1="생활/건강" data-category2="${category}" class="${style(category)}">
                ${category}
              </button>
            `,
          )
          .join("")}
      </div>
    `;
  }
  if (category1 === "디지털/가전") {
    return html`
      <div class="flex flex-wrap gap-2">
        <button data-category1="디지털/가전" data-category2="노트북" class="${style("노트북")}">노트북</button>
        <button data-category1="디지털/가전" data-category2="태블릿PC" class="${style("태블릿PC")}">태블릿PC</button>
      </div>
    `;
  }

  return null;
};
