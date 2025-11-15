// @ts-check

/**
 * @typedef {import('../types.js').CategoryTreeNode} CategoryTreeNode
 */

/**
 * @typedef {Object} CategoryOption
 * @property {string} value
 * @property {string} label
 * @property {boolean} selected
 */

export class CategoryViewModel {
  /**
   * @param {CategoryTreeNode[]} categories
   * @param {string} [selectedCategory1='']
   * @param {string} [selectedCategory2='']
   */
  constructor(categories, selectedCategory1 = "", selectedCategory2 = "") {
    this.categories = categories;
    this.selectedCategory1 = selectedCategory1;
    this.selectedCategory2 = selectedCategory2;
  }

  /**
   * @returns {CategoryOption[]}
   */
  getFirstDepthOptions() {
    return this.categories.map((cat) => ({
      value: cat.categoryId,
      label: cat.categoryId,
      selected: cat.categoryId === this.selectedCategory1,
    }));
  }

  /**
   * @returns {CategoryOption[]}
   */
  getSecondDepthOptions() {
    if (!this.selectedCategory1) return [];

    const selectedCat1 = this.categories.find((cat) => cat.categoryId === this.selectedCategory1);

    if (!selectedCat1 || !selectedCat1.children.length) return [];

    return selectedCat1.children.map((cat) => ({
      value: cat.categoryId,
      label: cat.categoryId,
      selected: cat.categoryId === this.selectedCategory2,
    }));
  }

  // /**
  //  * @returns {string[]}
  //  */
  // getBreadcrumb() {
  //   const breadcrumb = [];
  //   if (this.selectedCategory1) breadcrumb.push(this.selectedCategory1);
  //   if (this.selectedCategory2) breadcrumb.push(this.selectedCategory2);
  //   return breadcrumb;
  // }

  // /**
  //  * @returns {{category1: string, category2: string}}
  //  */
  // getFilters() {
  //   return {
  //     category1: this.selectedCategory1,
  //     category2: this.selectedCategory2,
  //   };
  // }

  // /**
  //  * @param {string} category1
  //  * @returns {CategoryViewModel}
  //  */
  // selectCategory1(category1) {
  //   console.log("selectCategory1", category1);
  //   return new CategoryViewModel(this.categories, category1, "");
  // }

  // /**
  //  * @param {string} category2
  //  * @returns {CategoryViewModel}
  //  */
  // selectCategory2(category2) {
  //   return new CategoryViewModel(this.categories, this.selectedCategory1, category2);
  // }

  // /**
  //  * @returns {CategoryViewModel}
  //  */
  // reset() {
  //   return new CategoryViewModel(this.categories, "", "");
  // }

  // /**
  //  * @returns {boolean}
  //  */
  // hasSecondDepth() {
  //   return this.getSecondDepthOptions().length > 0;
  // }

  // /**
  //  * @returns {string}
  //  */
  // getDisplayText() {
  //   const breadcrumb = this.getBreadcrumb();
  //   return breadcrumb.length > 0 ? breadcrumb.join(" > ") : "전체";
  // }
}
