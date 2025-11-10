/**
 * @param {Object} ProductDTO
 * @param {string} data.brand
 * @param {string} data.category1
 * @param {string} data.category2
 * @param {string} data.category3
 * @param {string} data.category4
 * @param {string} data.description
 * @param {string} data.hprice
 * @param {string} data.image
 * @param {string} data.images
 * @param {string} data.link
 * @param {string} data.lprice
 * @param {string} data.maker
 * @param {string} data.mallName
 * @param {string} data.productId
 * @param {string} data.productType
 * @param {number} data.rating
 * @param {number} data.reviewCount
 * @param {number} data.stock
 * @param {string} data.title
 */

export class ProductDTO {
  /**
   * @param {ProductDTO} data
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
    return [this.category1, this.category2, this.category3, this.category4].filter(Boolean).join(" > ");
  }

  static fromApi(data) {
    return new ProductDTO(data);
  }
}
