// 카테고리 UI 업데이트 함수들
export const updateCategoryUI = (selectedCat1, selectedCat2) => {
  updateCategory1Visibility(selectedCat1, selectedCat2);
  updateCategory2Visibility(selectedCat1);
  updateCategory2ButtonStyles(selectedCat1, selectedCat2);
  updateBreadcrumb(selectedCat1, selectedCat2);
};

// 1depth 컨테이너 표시/숨김 (cat1이나 cat2가 선택되면 숨김)
const updateCategory1Visibility = (selectedCat1, selectedCat2) => {
  const cat1Container = document.getElementById("category1-container");
  if (cat1Container) {
    cat1Container.classList.toggle("hidden", !!(selectedCat1 || selectedCat2));
  }
};

// 2depth 컨테이너들 표시/숨김 (cat1이 선택되지 않으면 모두 숨김)
const updateCategory2Visibility = (selectedCat1) => {
  document.querySelectorAll(".category2-group").forEach((el) => {
    if (selectedCat1 && selectedCat1 === el.dataset.category1) {
      el.classList.remove("hidden");
    } else {
      el.classList.add("hidden");
    }
  });
};

// 2depth 버튼 스타일 업데이트
const updateCategory2ButtonStyles = (selectedCat1, selectedCat2) => {
  const selectedClass =
    "category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-blue-100 border-blue-300 text-blue-800";
  const defaultClass =
    "category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50";

  document.querySelectorAll(".category2-filter-btn").forEach((btn) => {
    const isSelected = btn.dataset.category1 === selectedCat1 && btn.dataset.category2 === selectedCat2;
    btn.className = isSelected ? selectedClass : defaultClass;
  });
};

// 브레드크럼 업데이트
const updateBreadcrumb = (selectedCat1, selectedCat2) => {
  const breadcrumb = document.getElementById("breadcrumb-container");
  if (!breadcrumb) return;

  breadcrumb.innerHTML = /*html*/ `
<label class="text-sm text-gray-600">카테고리:</label>
<button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
${
  selectedCat1
    ? `
<span class="text-xs text-gray-500">&gt;</span>
<button data-breadcrumb="category1" data-category1="${selectedCat1}" class="text-xs hover:text-blue-800 hover:underline">${selectedCat1}</button>
`
    : ""
}
${
  selectedCat2
    ? `
<span class="text-xs text-gray-500">&gt;</span>
<span class="text-xs text-gray-600 cursor-default">${selectedCat2}</span>
`
    : ""
}
`;
};
