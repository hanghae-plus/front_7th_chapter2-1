/**
 * @typedef {import('../types.js').Product} Product
 */

export class ProductDTO {
  /**
   * @param {Product} data
   */
  constructor(data) {
    this.brand = data.brand;
    this.category1 = data.category1;
    this.category2 = data.category2;
    this.category3 = data.category3;
    this.category4 = data.category4;
    this.description = data.description;
    this.hprice = data.hprice;
    this.image = data.image;
    this.images = data.images;
    this.link = data.link;
    this.lprice = data.lprice;
    this.maker = data.maker;
    this.mallName = data.mallName;
    this.productId = data.productId;
    this.productType = data.productType;
    this.rating = data.rating;
    this.reviewCount = data.reviewCount;
    this.stock = data.stock;
    this.title = data.title;
  }

  get categoryPath() {
    return [this.category1, this.category2, this.category3, this.category4].filter(Boolean);
  }

  /**
   * @param {Product} data
   */
  static fromApi(data) {
    return new ProductDTO(data);
  }
}
