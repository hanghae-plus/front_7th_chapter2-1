# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Developer Persona

Development follows `.claude/DEVELOPER.md` persona (Wang Hao):
- Full-Stack Developer specializing in modern Vanilla JavaScript
- Understand requirements before coding
- Plan atomic commits with clear git diff review
- Test continuously alongside implementation
- Refactor iteratively for code quality

Code reviews follow `.claude/REVIEWER.md` persona (Katarina Yu):
- Senior Code Review Specialist & Quality Assurance Lead
- Multi-layered review process (structure, logic, performance, security, maintainability)
- Reviews saved to `/code-reviews/{issue-number}/{commit-name}.md`

## Project Overview

This is a Vanilla JavaScript web application built with Vite. The project emphasizes AI-driven development with strict coding standards and structured workflows.

## Key Commands

### Development
```bash
npm run dev              # Start dev server (default port 5173)
npm run dev:hash        # Start dev server with hash routing
npm run build           # Build for production
npm run preview         # Preview production build
```

### Code Quality
```bash
npm run lint:fix        # Run ESLint with auto-fix
npm run prettier:write  # Format code with Prettier
```

### Testing
```bash
npm run test:e2e           # Run all E2E tests
npm run test:e2e:basic     # Run basic E2E tests
npm run test:e2e:advanced  # Run advanced E2E tests
npm run test:e2e:ui        # Open Playwright UI
npm run test:e2e:report    # View test report
npm run test:generate      # Generate tests with Playwright codegen
```

Note: Vitest unit tests are configured but E2E tests use Playwright.

## Architecture & Structure

### Testing Architecture
- **Unit Tests**: Vitest with jsdom environment, global test utilities
- **E2E Tests**: Playwright (excluded from Vitest config)
- **Mocking**: MSW (Mock Service Worker) for API mocking
- **Test Setup**: `src/setupTests.js` provides global test configuration

### API Layer
- API functions in `src/api/`
- MSW handlers in `src/mocks/` for development and testing
- Service worker configured in `public/` directory

### Build Configuration
- Uses `rolldown-vite` (Vite with Rolldown bundler)
- ES module format (`"type": "module"`)
- Vitest runs in single-thread mode for consistency

## Development Workflow

### Issue-Driven Development
1. **Create Issue**: Document in `ISSUES/` directory with format `{number}-{TYPE}-{description}.md`
2. **Branch Naming**: `{type}/{issue-number}/{description}` (e.g., `feat/003/add-calendar`)
3. **Commit Convention**: `Type(issue-number): Description` with 3-digit issue numbers
   ```
   Feat(003): Add calendar month view component

   캘린더 월 뷰 컴포넌트 추가

   - MonthView 컴포넌트 구현
   - 월별 이벤트 표시 기능 추가
   ```

### Pre-commit Automation
- **Husky**: Runs lint-staged on pre-commit
- **Lint-staged**: Auto-formats with Prettier, lints with ESLint
- **Import Order**: Enforced via `eslint-plugin-import`
  1. External libraries
  2. Internal components
  3. Utility functions
  4. Constants
  5. Styles

### Code Review Process
- Use templates from `markdowns/review-templates/`
- Follow multi-layered review methodology (see Developer Persona section)

## Coding Standards

**Primary Reference**: `markdowns/coding-standards/CODING_STANDARDS.md`

### Key Principles
- **File Length**: Target 80 lines maximum (document exceptions at file top)
- **Function Length**: 15-20 lines maximum
- **Naming**: camelCase (functions/variables), PascalCase (classes), UPPER_SNAKE_CASE (constants)
- **Exports**: Prefer named exports over default
- **Immutability**: Use spread operators, avoid mutations
- **JSDoc**: Document complex functions and objects
- **Private Fields**: Use `#` prefix for class private members

### Modern JavaScript
- ES6+ features required (arrow functions, destructuring, template literals, optional chaining)
- No `var` - use `const`/`let`
- Async/await preferred over Promise chains

### DOM Manipulation
- Use DocumentFragment for bulk DOM creation
- Implement event delegation for dynamic elements
- Class-based styling (avoid inline styles)

## Project-Specific Standards

### Bilingual Documentation
- File headers: English + Korean
- Commit messages: English title, Korean body
- Code comments: Prefer Korean

## Important Notes

- **Never add AI signatures** to commits (no "Generated with Claude Code")
- **Always run `git diff`** before committing to review changes
- **Korean language preferred** for detailed commit bodies and code comments
- **English required** for commit titles and file headers