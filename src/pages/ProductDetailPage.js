export function ProductDetailPage(params) {
  const productId = params.id; // URL에서 productId 추출
  return {
    html: `
        <main class="max-w-md mx-auto px-4 py-4">
            <h1>Product Detail Page</h1>
            <p>Product ID: ${productId}</p>
            <a href="/" data-link>Go back to list</a>
        </main>
    `,
    onMount: null,
  };
}
