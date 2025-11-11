/**
 * @typedef {import('../types.js').ProductListResponse} ProductListResponse
 * @typedef {import('../types.js').ProductForList} ProductForList
 * @typedef {import('../types.js').Pagination} Pagination
 * @typedef {import('../types.js').Filters} Filters
 */

export class ProductListResponseDTO {
  /**
   * @param {ProductListResponse} data
   */
  constructor(data) {
    this.products = (data.products || []).map(ProductForListDTO.fromApi);
    this.filters = FiltersDTO.fromApi(data.filters || {});
    this.pagination = PaginationDTO.fromApi(data.pagination || {});
  }

  /**
   * @param {ProductListResponse} data
   */
  static fromApi(data) {
    return new ProductListResponseDTO(data);
  }
}

class ProductForListDTO {
  /**
   * @param {ProductForList} data
   */
  constructor(data) {
    this.productId = data.productId;
    this.image = data.image;
    this.title = data.title;
    this.brand = data.brand;
    this.lprice = parseInt(data.lprice.toString()) || 0;
    this.category1 = data.category1 || "";
    this.category2 = data.category2 || "";
    this.category3 = data.category3 || "";
    this.category4 = data.category4 || "";
    this.hprice = parseInt(data.hprice?.toString() || "0");
    this.maker = data.maker || "";
    this.mallName = data.mallName || "";
    this.productType = data.productType || "";
  }

  /**
   * @param {ProductForList} data
   */
  static fromApi(data) {
    return new ProductForListDTO(data);
  }
}

class FiltersDTO {
  /**
   * @param {Filters} data
   */
  constructor(data) {
    this.search = data.search || "";
    this.category1 = data.category1 || "";
    this.category2 = data.category2 || "";
    this.sort = data.sort || "price_asc";
  }

  /**
   * @param {Filters} data
   */
  static fromApi(data) {
    return new FiltersDTO(data);
  }
}

class PaginationDTO {
  /**
   * @param {Pagination} data
   */
  constructor(data) {
    this.page = parseInt(data.page.toString()) || 1;
    this.limit = parseInt(data.limit.toString()) || 20;
    this.total = parseInt(data.total.toString()) || 0;
    this.totalPages = parseInt(data.totalPages.toString()) || 0;
    this.hasNext = data.hasNext || true;
    this.hasPrev = data.hasPrev || false;
  }

  /**
   * @param {Pagination} data
   */
  static fromApi(data) {
    return new PaginationDTO(data);
  }
}
