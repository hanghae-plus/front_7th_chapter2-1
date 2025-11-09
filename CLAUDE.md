# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Korean e-commerce shopping mall SPA (Single Page Application) built with vanilla JavaScript. The project uses static HTML templates with MSW (Mock Service Worker) for API mocking and implements features like product browsing, cart management, infinite scroll, and detailed product views.

## Commands

### Development
- `pnpm run dev` - Start Vite development server at http://localhost:5173
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build

### Testing
- `pnpm run test:e2e` - Run all Playwright E2E tests
- `pnpm run test:e2e:basic` - Run basic E2E tests only
- `pnpm run test:e2e:advanced` - Run advanced E2E tests only
- `pnpm run test:e2e:ui` - Run Playwright tests with UI mode
- `pnpm run test:e2e:report` - Show Playwright test report
- `pnpm run test:generate` - Generate Playwright tests using codegen

### Code Quality
- `pnpm run lint:fix` - Run ESLint with auto-fix
- `pnpm run prettier:write` - Format code with Prettier

## Architecture

### Static Template Approach

The application uses a unique architecture with **static HTML templates** defined as JavaScript template literals in `/src/main.js`. The entire application is rendered by setting `document.body.innerHTML` to combinations of these templates:

- `상품목록_레이아웃_로딩` - Product list loading state
- `상품목록_레이아웃_로딩완료` - Product list loaded state
- `상품목록_레이아웃_카테고리_1Depth` - Category 1st level view
- `상품목록_레이아웃_카테고리_2Depth` - Category 2nd level view
- `토스트` - Toast notification examples (success, info, error)
- `장바구니_비어있음` - Empty cart modal
- `장바구니_선택없음` - Cart with items but none selected
- `장바구니_선택있음` - Cart with selected items
- `상세페이지_로딩` - Product detail loading state
- `상세페이지_로딩완료` - Product detail loaded state
- `_404_` - 404 error page

**Important**: When implementing features, you need to dynamically generate HTML instead of using these static templates. The current implementation is just starter/example code.

### API Layer

API functions are in `/src/api/productApi.js`:
- `getProducts(params)` - Fetch product list with filtering/sorting/pagination
  - Supports: `limit`, `search`, `category1`, `category2`, `sort`, `page`
- `getProduct(productId)` - Fetch single product details
- `getCategories()` - Fetch category hierarchy

### Mock Service Worker

MSW is configured in `/src/mocks/`:
- `/src/mocks/browser.js` - Browser worker setup
- `/src/mocks/handlers.js` - API endpoint handlers
  - `GET /api/products` - Product list with filtering/sorting/pagination
  - `GET /api/products/:id` - Product detail
  - `GET /api/categories` - Category tree
- `/src/mocks/items.json` - Product data (340 items)

The MSW worker is initialized before the main app in production mode but bypassed in test mode.

### SPA Requirements

This must be a true SPA with:
- **No page reloads** - All navigation (including back/forward) must use client-side routing
- **URL state management** - Search, filters, sort, categories stored in URL query params
- **State persistence** - Cart persists in localStorage, URL state restored on refresh
- **Dynamic routing** - Product detail pages use `/product/{productId}` pattern
- **404 handling** - Unknown routes show 404 page

### Key Features

1. **Product List** (Home Page)
   - Infinite scroll pagination
   - Search by product name
   - 2-level category filtering with breadcrumbs
   - Sorting (price/name, asc/desc)
   - Items per page selection (10/20/50/100, default 20)
   - Loading states with skeleton UI

2. **Shopping Cart** (Modal)
   - Opens via cart icon in header
   - Quantity adjustment per item
   - Individual item removal
   - Bulk selection and deletion
   - Select all/deselect all
   - Clear entire cart
   - Cart state persists in localStorage
   - Closes via X button, background click, or ESC key

3. **Product Detail Page**
   - Shows at `/product/{productId}`
   - Breadcrumb navigation with category hierarchy
   - Quantity selector
   - Related products (same category2, excluding current)
   - Add to cart functionality

4. **User Feedback**
   - Toast notifications (success/info/error)
   - Auto-dismiss after 3 seconds
   - Manual close button
   - Different colors per type

5. **URL Management**
   - All filters/search/sort reflected in URL query params
   - State restored from URL on page refresh
   - Product ID in URL path for detail pages

### Styling

- Uses Tailwind CSS via CDN (`https://cdn.tailwindcss.com`)
- Tailwind config in `index.html` defines custom colors (primary: #3b82f6, secondary: #6b7280)
- Additional styles in `/src/styles.css`
- Mobile-first responsive design (max-width: md for main content)

## Testing Strategy

The project uses Playwright for E2E testing with tests in `/e2e/`:
- Tests run against dev server at http://localhost:5173
- Helper functions in `/e2e/E2EHelpers.js`
- Tests are split into basic and advanced suites

## Important Implementation Notes

1. **Dynamic Rendering Required**: The static templates in `main.js` are examples. Real implementation needs to:
   - Dynamically generate product cards from API data
   - Update cart count badge
   - Render category buttons from API categories
   - Handle loading/error states properly

2. **Event Delegation**: Use event delegation for dynamically generated content like product cards and cart items.

3. **State Management**: Consider implementing a simple state manager for:
   - Current filters/search/sort
   - Cart items (sync with localStorage)
   - Current page/route

4. **Router Implementation**: Need to implement:
   - URL parsing and route matching
   - History API integration (pushState/popState)
   - Link interception for SPA navigation
   - Query parameter management

5. **Korean Language**: All UI text and requirements are in Korean. Maintain Korean text in user-facing elements.

## File Structure Pattern

When adding new functionality:
- Keep utility functions separate if they grow large
- Consider creating a `/src/utils/` directory for helpers
- Create `/src/components/` for reusable component generators
- Add `/src/router/` for routing logic
- Use `/src/store/` for state management

## Development Workflow

1. Start MSW and dev server: `pnpm run dev`
2. Make changes and test in browser
3. Run E2E tests to verify: `pnpm run test:e2e:basic`
4. Format code: `pnpm run prettier:write && pnpm run lint:fix`
5. Run full test suite before committing: `pnpm run test:e2e`
