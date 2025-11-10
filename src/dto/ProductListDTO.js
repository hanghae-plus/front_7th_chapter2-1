/**
 * @param {Object} ProductListResponseDTO
 * @param {ProductDTO[]} data.products
 * @param {PaginationDTO} data.pagination
 * @param {FiltersDTO} data.filters
 */

/**
 * @param {Object} ProductDTO
 * @param {string} product.brand
 * @param {string} product.category1
 * @param {string} product.category2
 * @param {string} product.category3
 * @param {string} product.category4
 * @param {string} product.hprice
 * @param {string} product.image
 * @param {string} product.link
 * @param {string} product.lprice
 * @param {string} product.maker
 * @param {string} product.mallName
 * @param {string} product.productId
 * @param {string} product.productType
 * @param {string} product.title
 */

/**
 * @param {Object} FiltersDTO
 * @param {string} filters.search
 * @param {string} filters.category1
 * @param {string} filters.category2
 * @param {string} filters.sort
 */

/**
 * @param {Object} PaginationDTO
 * @param {number} pagination.page
 * @param {number} pagination.limit
 * @param {number} pagination.total
 * @param {number} pagination.totalPages
 * @param {boolean} pagination.hasNext
 * @param {boolean} pagination.hasPrev
 */

export class ProductListResponseDTO {
  /**
   * @param {ProductListResponseDTO} data
   */
  constructor(data) {
    this.products = data.products.map(ProductDTO.fromApi);
    this.filters = FiltersDTO.fromApi(data.filters);
    this.pagination = PaginationDTO.fromApi(data.pagination);
  }

  static fromApi(data) {
    return new ProductListResponseDTO(data);
  }

  get limitOptions() {
    return [10, 20, 50, 100];
  }

  get sortOptions() {
    return [
      { value: "price_asc", label: "가격 낮은순" },
      { value: "price_desc", label: "가격 높은순" },
      { value: "name_asc", label: "이름순" },
      { value: "name_desc", label: "이름 역순" },
    ];
  }
}

class ProductDTO {
  /**
   * @param {ProductDTO} data
   */
  constructor(data) {
    this.productId = data.productId;
    this.image = data.image;
    this.title = data.title;
    this.brand = data.brand;
    this.lprice = data.lprice;
    this.category1 = data.category1;
    this.category2 = data.category2;
    this.category3 = data.category3;
    this.category4 = data.category4;
    this.hprice = data.hprice;
    this.maker = data.maker;
    this.mallName = data.mallName;
    this.productType = data.productType;
  }

  static fromApi(data) {
    return new ProductDTO(data);
  }
}

class FiltersDTO {
  /**
   * @param {FiltersDTO} data
   */
  constructor(data) {
    this.search = data.search;
    this.category1 = data.category1;
    this.category2 = data.category2;
    this.sort = data.sort;
  }

  static fromApi(data) {
    return new FiltersDTO(data);
  }
}

class PaginationDTO {
  /**
   * @param {PaginationDTO} data
   */
  constructor(data) {
    this.page = data.page;
    this.limit = data.limit;
    this.total = data.total;
    this.totalPages = data.totalPages;
    this.hasNext = data.hasNext;
    this.hasPrev = data.hasPrev;
  }

  static fromApi(data) {
    return new PaginationDTO(data);
  }
}
