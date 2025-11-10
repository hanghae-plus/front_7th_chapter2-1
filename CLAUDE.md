# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a front-end e-commerce shopping mall project ("항해플러스 프론트엔드 쇼핑몰") built with vanilla JavaScript as a Single Page Application (SPA). The project implements a product listing page with filtering, searching, sorting, shopping cart functionality, and product detail pages - all without using frameworks like React, Vue, or Angular.

## Development Commands

### Development Server
```bash
pnpm run dev              # Start development server on port 5173
pnpm run dev:hash        # Start dev server with hash router (./index.hash.html)
```

### Build & Preview
```bash
pnpm run build           # Build for production
pnpm run preview         # Preview production build locally
```

### Testing
```bash
# E2E Tests (Playwright)
pnpm run test:e2e              # Run all e2e tests
pnpm run test:e2e:basic        # Run basic tests only
pnpm run test:e2e:advanced     # Run advanced tests only
pnpm run test:e2e:ui           # Run tests with Playwright UI
pnpm run test:e2e:report       # Show test report
pnpm run test:generate         # Generate test code (codegen on localhost:5173)
```

Note: Vitest is configured but unit tests are not currently used (only e2e tests).

### Code Quality
```bash
pnpm run lint:fix          # Fix ESLint errors
pnpm run prettier:write    # Format code with Prettier
```

Note: Husky and lint-staged are configured to run these checks pre-commit.

### Deployment
```bash
pnpm run deploy           # Deploy to GitHub Pages (gh-pages -d dist)
```

## Architecture & Code Structure

### SPA Implementation
This project is built as a vanilla JavaScript SPA. The main entry point is `src/main.js`, which contains embedded HTML template strings for different UI states. The templates are rendered by setting `document.body.innerHTML`.

**Key Template States (in main.js):**
- `상품목록_레이아웃_로딩` - Product list loading state
- `상품목록_레이아웃_로딩완료` - Product list loaded state
- `상품목록_레이아웃_카테고리_1Depth` - Category 1st depth selected
- `상품목록_레이아웃_카테고리_2Depth` - Category 2nd depth selected
- `장바구니_비어있음` - Empty cart modal
- `장바구니_선택없음` - Cart with no items selected
- `장바구니_선택있음` - Cart with items selected
- `상세페이지_로딩` - Product detail loading state
- `상세페이지_로딩완료` - Product detail loaded state
- `토스트` - Toast notifications
- `_404_` - 404 error page

### API Layer
- **`src/api/productApi.js`** - Contains API calls for fetching product data
- All API requests go through `/api/products` endpoints

### Mock Service Worker (MSW)
The project uses MSW for API mocking during development:
- **`src/mocks/browser.js`** - Browser worker setup
- **`src/mocks/handlers.js`** - API endpoint handlers with 200ms delay
- **`src/mocks/items.json`** - Mock product data

**API Endpoints (mocked):**
- `GET /api/products` - List products with filtering, sorting, pagination
- `GET /api/products/:id` - Get product detail by ID
- `GET /api/categories` - Get category hierarchy (1depth & 2depth)

**Query Parameters:**
- `page` or `current` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search term
- `category1` - 1st level category filter
- `category2` - 2nd level category filter
- `sort` - Sorting: `price_asc`, `price_desc`, `name_asc`, `name_desc`

### E2E Test Structure
Tests are located in `e2e/` directory:
- **`e2e/e2e.basic.spec.js`** - Basic functionality tests (상품목록, 장바구니, 상품 상세, 사용자 피드백)
- **`e2e/e2e.advanced.spec.js`** - Advanced tests (SPA navigation, URL management, state persistence)
- **`e2e/E2EHelpers.js`** - Test helper functions

The Playwright config (`playwright.config.js`) automatically starts the dev server on port 5173 before running tests.

## Important Project Requirements

### Assignment Checklist
The project is evaluated against a comprehensive checklist in `.github/pull_request_template.md` covering:

**Basic Requirements (기본과제):**
1. Product list with loading states, error handling, infinite scroll
2. Shopping cart modal with full CRUD operations, selection, quantity adjustment
3. Product detail page with related products
4. Search and filtering (2-depth category hierarchy)
5. Sorting and pagination
6. Toast notifications

**Advanced Requirements (심화과제):**
1. Full SPA navigation without page refresh (including back/forward)
2. URL state management (all filters, search, sort in query params)
3. State persistence on refresh (cart in localStorage, URL params restored)
4. 404 page handling
5. AI-assisted reimplementation challenge

### Technology Stack
- **Build Tool:** Vite (using `rolldown-vite` variant)
- **Styling:** TailwindCSS (loaded via CDN in index.html)
- **Testing:** Playwright for E2E
- **Mocking:** MSW (Mock Service Worker)
- **Language:** Pure JavaScript (no TypeScript, no frameworks)
- **Code Quality:** ESLint + Prettier with Husky pre-commit hooks

### Key Architectural Patterns
1. **Template-based rendering** - UI states are defined as template literal strings in main.js
2. **Event delegation** - Event handlers should be attached to handle dynamically rendered elements
3. **Manual routing** - SPA routing needs to be implemented without a router library
4. **LocalStorage integration** - Cart state must persist across page refreshes
5. **URL as state** - Search/filter/sort state syncs with URL query parameters

## Development Tips

### When Working with Templates
The current architecture uses large template strings in `main.js`. When modifying UI:
1. Locate the appropriate template constant (e.g., `상품목록_레이아웃_로딩완료`)
2. Modify the HTML within that template string
3. Ensure data attributes (like `data-product-id`) are maintained for event handling

### When Adding New Features
1. Consider which template states need updates
2. Add necessary API mocking in `src/mocks/handlers.js` if new endpoints needed
3. Update E2E tests to cover new functionality
4. Update the PR template checklist if adding new requirements

### Common Patterns to Follow
- Use `data-*` attributes for element identification in event handlers
- Implement debouncing for search inputs
- Show loading skeletons during data fetches
- Display toast notifications for user actions
- Handle error states gracefully with retry options

## GitHub Actions
- **`.github/workflows/gh-pages.yml`** - Deploys to GitHub Pages on push
- Uses `peaceiris/actions-gh-pages@v3` to publish the `dist/` directory
