import { useEffect } from "@core/state/useEffect";
import { useState } from "@core/state/useState";
import { CategoriesResponse, SortType } from "../../../../types";
import { getCategories } from "../../../../api/productApi";
import { useMemo } from "@core/state/useMemo";
import { isNil, isNotNil } from "es-toolkit";
import { useRouter } from "../../../../pages/routes";

const limitOptions = [10, 20, 50, 100];

const sortOptions: Array<{ label: string; value: SortType }> = [
  { label: "가격 낮은순", value: "price_asc" },
  { label: "가격 높은순", value: "price_desc" },
  { label: "이름순", value: "name_asc" },
  { label: "이름 역순", value: "name_desc" },
];

type ProductFilterProps = {
  onSearch: (search: string) => void;
  onChangeCategories: (categories: string[]) => void;
  onSort: (sort: SortType) => void;
  onLimit: (limit: number) => void;
};

export function ProductFilter({
  onSearch,
  onChangeCategories,
  onSort,
  onLimit,
}: ProductFilterProps) {
  const router = useRouter();
  const { search, category1, category2 } = router.queryParams;
  const sort = (router.queryParams.sort as SortType) ?? "price_asc";
  const limit = Number(router.queryParams.limit ?? 20) as number;
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<CategoriesResponse | null>(null);

  console.log(category1, category2);

  const step = useMemo(() => (isNil(category1) ? 0 : 1), [category1]);

  const currentDisplayingCategories = useMemo(() => {
    if (isNil(categories)) return [];

    if (isNil(category1)) return Object.keys(categories);

    return Object.keys(categories[category1]);
  }, [category1, categories]);

  const fetchCategories = async () => {
    setIsLoading(true);
    const response = await getCategories();

    setCategories(response);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      {/* 검색창 */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            id="search-input"
            placeholder="상품명을 검색해보세요..."
            value={search ?? ""}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearch(e.currentTarget?.value);
              }
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>
      </div>
      {/* 필터 옵션 */}
      <div className="space-y-3">
        {/* 카테고리 필터 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">카테고리: </label>
            <button
              data-breadcrumb="reset"
              className="text-xs hover:text-blue-800 hover:underline"
              onClick={() => {
                onChangeCategories([]);
              }}
            >
              전체
            </button>
            {isNotNil(category1) && (
              <>
                <span className="text-xs text-gray-500">&gt;</span>
                <button
                  data-breadcrumb="category1"
                  data-category1={category1}
                  className="text-xs hover:text-blue-800 hover:underline"
                  onClick={() => {
                    onChangeCategories([category1]);
                  }}
                >
                  {category1}
                </button>
              </>
            )}
            {isNotNil(category2) && (
              <>
                <span className="text-xs text-gray-500">&gt;</span>
                <button
                  data-breadcrumb="category2"
                  data-category2={category2}
                  className="text-xs hover:text-blue-800 hover:underline"
                  onClick={() => {
                    onChangeCategories([category1, category2]);
                  }}
                >
                  {category2}
                </button>
              </>
            )}
          </div>
          {/* 1depth 카테고리 */}
          {(() => {
            if (isLoading) {
              return (
                <div className="flex flex-wrap gap-2">
                  <div className="text-sm text-gray-500 italic">
                    카테고리 로딩 중...
                  </div>
                </div>
              );
            }

            return (
              <div className="flex flex-wrap gap-2">
                {currentDisplayingCategories.map((category) => (
                  <button
                    data-category1={category}
                    className={`category${step}-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
                  ${category2 === category ? "bg-blue-100 border-blue-300 text-blue-800" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                    onClick={() => {
                      const nextCategories = [category1, category2].filter(
                        isNotNil,
                      );
                      nextCategories[step] = category;
                      onChangeCategories(nextCategories);
                    }}
                  >
                    {" "}
                    {category}
                  </button>
                ))}
              </div>
            );
          })()}
          {/* 2depth 카테고리 */}
        </div>
        {/* 기존 필터들 */}
        <div className="flex gap-2 items-center justify-between">
          {/* 페이지당 상품 수 */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">개수:</label>
            <select
              id="limit-select"
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => {
                const value = Number(e.currentTarget?.value);
                onLimit(value);
              }}
            >
              {limitOptions.map((option) => (
                <option key={option} value={option} selected={option === limit}>
                  {option}개
                </option>
              ))}
            </select>
          </div>
          {/* 정렬 */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">정렬:</label>
            <select
              id="sort-select"
              className="text-sm border border-gray-300 rounded px-2 py-1
                         focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => {
                const value = e.currentTarget?.value as SortType;
                onSort(value);
              }}
            >
              {sortOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  selected={option.value === sort}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

const _상품목록_레이아웃_카테고리_1Depth = `
    <main className="max-w-md mx-auto px-4 py-4">
      <!-- 검색 및 필터 -->
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <!-- 검색창 -->
        <div className="mb-4">
          <div className="relative">
            <input type="text" id="search-input" placeholder="상품명을 검색해보세요..." value="" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <!-- 필터 옵션 -->
        <div className="space-y-3">

          <!-- 카테고리 필터 -->
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">카테고리:</label>
              <button data-breadcrumb="reset" className="text-xs hover:text-blue-800 hover:underline">전체</button><span className="text-xs text-gray-500">&gt;</span><button data-breadcrumb="category1" data-category1="생활/건강" className="text-xs hover:text-blue-800 hover:underline">생활/건강</button>
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <button data-category1="생활/건강" data-category2="생활용품" className="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                  생활용품
                </button>
                <button data-category1="생활/건강" data-category2="주방용품" className="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                  주방용품
                </button>
                <button data-category1="생활/건강" data-category2="문구/사무용품" className="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                  문구/사무용품
                </button>
              </div>
            </div>
          </div>
          
          <!-- 기존 필터들 -->
          <div className="flex gap-2 items-center justify-between">
            <!-- 페이지당 상품 수 -->
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">개수:</label>
              <select id="limit-select"
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option value="10">
                  10개
                </option>
                <option value="20" selected="">
                  20개
                </option>
                <option value="50">
                  50개
                </option>
                <option value="100">
                  100개
                </option>
              </select>
            </div>
            <!-- 정렬 -->
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">정렬:</label>
              <select id="sort-select" className="text-sm border border-gray-300 rounded px-2 py-1
                           focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option value="price_asc" selected="">가격 낮은순</option>
                <option value="price_desc">가격 높은순</option>
                <option value="name_asc">이름순</option>
                <option value="name_desc">이름 역순</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </main>
  `;

const _상품목록_레이아웃_카테고리_2Depth = `
    <main className="max-w-md mx-auto px-4 py-4">
      <!-- 검색 및 필터 -->
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <!-- 검색창 -->
        <div className="mb-4">
          <div className="relative">
            <input type="text" id="search-input" placeholder="상품명을 검색해보세요..." value="" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <!-- 필터 옵션 -->
        <div className="space-y-3">

          <!-- 카테고리 필터 -->
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">카테고리:</label>
              <button data-breadcrumb="reset" className="text-xs hover:text-blue-800 hover:underline">전체</button><span className="text-xs text-gray-500">&gt;</span><button data-breadcrumb="category1" data-category1="생활/건강" className="text-xs hover:text-blue-800 hover:underline">생활/건강</button><span className="text-xs text-gray-500">&gt;</span><span className="text-xs text-gray-600 cursor-default">주방용품</span>
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <button data-category1="생활/건강" data-category2="생활용품" className="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                  생활용품
                </button>
                <button data-category1="생활/건강" data-category2="주방용품" className="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-blue-100 border-blue-300 text-blue-800">
                  주방용품
                </button>
                <button data-category1="생활/건강" data-category2="문구/사무용품" className="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                  문구/사무용품
                </button>
              </div>
            </div>
          </div>
          
          <!-- 기존 필터들 -->
          <div className="flex gap-2 items-center justify-between">
            <!-- 페이지당 상품 수 -->
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">개수:</label>
              <select id="limit-select"
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option value="10">
                  10개
                </option>
                <option value="20" selected="">
                  20개
                </option>
                <option value="50">
                  50개
                </option>
                <option value="100">
                  100개
                </option>
              </select>
            </div>
            <!-- 정렬 -->
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">정렬:</label>
              <select id="sort-select" className="text-sm border border-gray-300 rounded px-2 py-1
                           focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option value="price_asc" selected="">가격 낮은순</option>
                <option value="price_desc">가격 높은순</option>
                <option value="name_asc">이름순</option>
                <option value="name_desc">이름 역순</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </main>
  `;
