const renderSkeletonCard = () => `
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
    <div class="aspect-square bg-gray-200"></div>
    <div class="p-3 space-y-2">
      <div class="h-4 bg-gray-200 rounded"></div>
      <div class="h-3 bg-gray-200 rounded w-2/3"></div>
      <div class="h-5 bg-gray-200 rounded w-1/2"></div>
      <div class="h-8 bg-gray-200 rounded"></div>
    </div>
  </div>
`;

export const renderSkeletonCards = (count = 4) =>
  Array.from({ length: count })
    .map(() => renderSkeletonCard())
    .join("");
