/**
 * 카테고리 필터 컴포넌트
 * @param {Object} props
 * @param {string} props.category1 - 선택된 1depth 카테고리
 * @param {string} props.category2 - 선택된 2depth 카테고리
 * @param {Object} props.categories - 카테고리 데이터 객체
 */
export const CategoryFilter = ({ category1 = "", category2 = "", categories = {} } = {}) => {
  // 카테고리 1depth 목록
  const category1List = Object.keys(categories);

  // 선택된 category1의 2depth 목록
  const category2List = category1 && categories[category1] ? Object.keys(categories[category1]) : [];

  // 브레드크럼 생성
  const breadcrumb = [];
  if (category1) {
    breadcrumb.push(category1);
    if (category2) {
      breadcrumb.push(category2);
    }
  }

  return `
    <div class="space-y-2">
      <!-- 브레드크럼 -->
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">카테고리:</label>
        <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>${
          breadcrumb.length > 0
            ? `<span class="text-xs text-gray-500">&gt;</span><button data-breadcrumb="category1" data-category1="${category1}" class="text-xs hover:text-blue-800 hover:underline">${category1}</button>`
            : ""
        }${
          category2
            ? `<span class="text-xs text-gray-500">&gt;</span><span class="text-xs text-gray-600 cursor-default">${category2}</span>`
            : ""
        }
      </div>

      <!-- 카테고리 1depth 버튼들 -->
      ${
        !category1
          ? category1List.length > 0
            ? `
        <div class="flex flex-wrap gap-2">
          ${category1List
            .map(
              (cat1) => `
            <button
              data-category1="${cat1}"
              class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              ${cat1}
            </button>
          `,
            )
            .join("")}
        </div>
      `
            : `
        <div class="flex flex-wrap gap-2">
          <div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>
        </div>
      `
          : ""
      }

      <!-- 카테고리 2depth 버튼들 -->
      ${
        category1 && category2List.length > 0
          ? `
        <div class="flex flex-wrap gap-2">
          ${category2List
            .map(
              (cat2) => `
            <button
              data-category1="${category1}"
              data-category2="${cat2}"
              class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors ${
                category2 === cat2
                  ? "bg-blue-100 border-blue-300 text-blue-800"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }"
            >
              ${cat2}
            </button>
          `,
            )
            .join("")}
        </div>
      `
          : ""
      }
    </div>
  `;
};
