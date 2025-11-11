export class CategoryDTO {
  /**
   * @param {string} categoryId
   * @param {CategoryDTO[]} children
   * */
  constructor(categoryId, children = []) {
    this.categoryId = categoryId;
    this.children = children;
    Object.freeze(this);
  }

  static #buildTree(rootCategoryId, rawChildrenObject) {
    const children = Object.entries(rawChildrenObject ?? {}).map(([childCategoryId, childObject]) => {
      return CategoryDTO.#buildTree(childCategoryId, childObject);
    });
    return new CategoryDTO(rootCategoryId, children);
  }

  static fromApi(data) {
    return Object.entries(data ?? {}).map(([rootCategoryId, rootObject]) =>
      CategoryDTO.#buildTree(rootCategoryId, rootObject),
    );
  }
}
