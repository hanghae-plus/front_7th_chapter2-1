const CategoryItem = ({ category, type, isSelect }) => {
  return /*HTML*/ `
  <button data-category${type}=${category} class="category${type}-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
       ${isSelect ? "bg-blue-100 border-blue-300 text-blue-800" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"} ">
      ${category}
    </button>
  `;
};

const Category = ({ isLoading, categories, category1, category2 }) => {
  const category1List = Object.keys(categories);
  const category2List = category1 ? Object.keys(categories[category1] || {}) : [];

  return /*HTML*/ `
  <div class="space-y-2">
  <div class="flex items-center gap-2">
    <label class="text-sm text-gray-600">카테고리:</label>
    <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
    ${
      category1
        ? /*HTML*/ `<span class=" text-xs text-gray-500">&gt;</span><button data-breadcrumb=${category1} class="breadcrumb-btn1 text-xs hover:text-blue-800 hover:underline">${category1}</button>
    `
        : ""
    }
    ${category2 ? /*HTML*/ `<span class=" text-xs text-gray-500">&gt;</span><button data-breadcrumb=${category2} class="breadcrumb-btn2 text-xs hover:text-blue-800 hover:underline">${category2}</button>` : ""}
  </div>

  ${
    isLoading
      ? /*HTML*/ `<div class="flex flex-wrap gap-2">
            <div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>
        </div>`
      : /*HTML*/ `<div class="flex flex-wrap gap-2">
      ${!category2List.length ? category1List.map((category) => CategoryItem({ category, type: 1 })).join("") : ""}   
      ${category1 ? category2List.map((category) => CategoryItem({ category, type: 2, isSelect: category === category2 })).join("") : ""}    
 
  </div>`
  }
</div>
  `;
};

export default Category;
