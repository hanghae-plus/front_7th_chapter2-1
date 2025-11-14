export const Category = ({ categories = {}, selectedCat1 = null, selectedCat2 = null }) => {
  const category1List = Object.keys(categories);

  const cat1ContainerClasses = ["flex", "flex-wrap", "gap-2"];
  if (selectedCat1 || selectedCat2) cat1ContainerClasses.push("hidden");

  const selectedCategory2Class =
    "category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-blue-100 border-blue-300 text-blue-800";
  const defaultCategory2Class =
    "category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50";

  const renderBreadcrumb = () => /*html*/ `
  <label class="text-sm text-gray-600">카테고리:</label>
  <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
  ${
    selectedCat1
      ? `
  <span class="text-xs text-gray-500">&gt;</span>
  <button data-breadcrumb="category1" data-category1="${selectedCat1}" class="text-xs hover:text-blue-800 hover:underline">
    ${selectedCat1}
  </button>`
      : ""
  }
  ${
    selectedCat2
      ? `
  <span class="text-xs text-gray-500">&gt;</span>
  <span class="text-xs text-gray-600 cursor-default">${selectedCat2}</span>`
      : ""
  }
  `;

  const renderCategory2Group = (cat1Name) => {
    const category2List = Object.keys(categories[cat1Name]);
    const isVisible = selectedCat1 === cat1Name;
    const groupClasses = ["category2-group", "flex", "flex-wrap", "gap-2", isVisible ? "" : "hidden"]
      .filter(Boolean)
      .join(" ");

    return /*html*/ `
    <div id="category2-${cat1Name}" data-category1="${cat1Name}" class="${groupClasses}">
      ${category2List
        .map((cat2Name) => {
          const isSelected = selectedCat1 === cat1Name && selectedCat2 === cat2Name;
          const buttonClass = isSelected ? selectedCategory2Class : defaultCategory2Class;
          return `
      <button data-category1="${cat1Name}" data-category2="${cat2Name}" class="${buttonClass}">
        ${cat2Name}
      </button>`;
        })
        .join("")}
    </div>`;
  };

  return /*html*/ `
<!-- 필터 옵션 -->
<div class="space-y-3">
  <!-- 카테고리 필터 -->
  <div class="space-y-2">
    <div id="breadcrumb-container" class="flex items-center gap-2">
      ${renderBreadcrumb()}
    </div>

    <!-- 1depth 카테고리 -->
    <div id="category1-container" class="${cat1ContainerClasses.join(" ")}">
      ${category1List
        .map(
          (cat1Name) => `
      <button data-category1="${cat1Name}" class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
                   bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
        ${cat1Name}
      </button>`,
        )
        .join("")}
    </div>

    <!-- 2depth 카테고리 -->
    ${category1List.map((cat1Name) => renderCategory2Group(cat1Name)).join("")}
  </div>
</div>`;
};
