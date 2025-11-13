# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a vanilla JavaScript e-commerce SPA (Single Page Application) project for "항해플러스 프론트엔드" bootcamp. The application is a shopping mall with product listing, search, filtering, cart management, and product detail pages.

## Tech Stack

- **Build Tool**: Vite (using rolldown-vite)
- **Styling**: Tailwind CSS (via CDN)
- **Testing**: Playwright (E2E), Vitest (unit tests with jsdom)
- **API Mocking**: MSW (Mock Service Worker)
- **Code Quality**: ESLint, Prettier, Husky, lint-staged

## Development Commands

```bash
# Development server
pnpm dev                    # Start dev server (default)

# Testing
pnpm test:e2e              # Run all E2E tests
pnpm test:e2e:basic        # Run basic E2E tests
pnpm test:e2e:advanced     # Run advanced E2E tests
pnpm test:e2e:ui           # Run E2E tests with Playwright UI
pnpm test:e2e:report       # Show Playwright test report

# Code Quality
pnpm lint:fix              # Fix ESLint issues
pnpm prettier:write        # Format code with Prettier

# Build
pnpm build                 # Build for production
pnpm preview               # Preview production build
```

## Architecture

### SPA Routing Pattern
This is a vanilla JS SPA without a routing library. Navigation is handled through:
- URL hash-based routing or History API
- `data-link` attributes on navigation elements
- Manual state management via URL query parameters
- All page transitions must avoid full page reloads

### Page Structure
- **HomePage** (`src/pages/HomePage.js`): Product listing with search, filters, sorting, category navigation, and infinite scroll
- **ProductDetailPage** (`src/pages/ProductDetailPage.ts`): Individual product details with related products
- 404 page for unknown routes

### State Management
- **Cart**: Persisted in localStorage (survives page refresh)
- **Filters/Search**: Stored in URL query parameters (search, category1, category2, limit, sort)
- **Selected cart items**: Also persisted in localStorage

### API Layer
Located in `src/api/productApi.js`:
- `getProducts(params)`: Fetch paginated products with filters
  - Parameters: `{ page, limit, search, category1, category2, sort }`
  - Returns: `{ products, pagination, filters }`
- `getProduct(productId)`: Fetch single product details
- `getCategories()`: Fetch 2-level category structure

### Mock Data
- MSW handlers in `src/mocks/handlers.js` mock all API endpoints
- Product data in `src/mocks/items.json`
- Mock service worker initialized in `src/main.js` via `enableMocking()`
- Worker files in `public/mockServiceWorker.js`

### Key Features Implementation Notes

**Pagination**:
- Infinite scroll on home page only
- Load more products as user scrolls near bottom
- Show loading skeleton while fetching

**Category System**:
- 2-level hierarchy (category1 and category2)
- Breadcrumb navigation showing: 전체 > category1 > category2
- Each breadcrumb segment is clickable to navigate up

**Cart Modal**:
- Opens via cart icon button (`#cart-icon-btn`)
- Closes via X button, background click, or ESC key
- Supports quantity adjustment, individual/bulk delete, select all

**Toast Notifications**:
- Success/info/error types with different styling
- Auto-dismiss after 3 seconds
- Manual close button available
- Used for cart operations feedback

**URL State Synchronization**:
- All filter changes update URL query params immediately
- Page refresh restores state from URL
- Product detail pages use `/product/{productId}` path format

## File Organization

```
src/
├── api/              # API client functions
├── pages/            # Page components (HomePage, ProductDetailPage)
├── components/       # Reusable UI components
├── mocks/            # MSW handlers and mock data
├── template.js       # HTML template helpers
└── main.js           # App entry point
```

## Testing Strategy

- **E2E Tests** (Playwright): Located in `e2e/` directory
  - Basic tests: Core functionality
  - Advanced tests: Complex user flows
  - Base URL: `http://localhost:5173`
  - Test helpers in `e2e/E2EHelpers.js`

- **Unit Tests** (Vitest): Would use jsdom environment
  - Setup file: `src/setupTests.js`
  - Excludes e2e tests from unit test runs

## Important Constraints

- Pure vanilla JavaScript (no frameworks)
- SPA behavior required - no page reloads on navigation
- Must handle browser back/forward buttons correctly
- URL must reflect current app state (shareable links)
- Cart and selections must persist across page refreshes
- MSW must be enabled for all API calls to work
