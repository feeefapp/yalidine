# Contributing to Yalidine SDK

Thank you for your interest in contributing to the Feeef's Yalidine SDK! This document provides guidelines and information for contributors.

## 🎯 Project Overview

The Yalidine SDK is a type-safe JavaScript/TypeScript SDK for interacting with Yalidine and Guepex delivery APIs. It's designed to work seamlessly across different environments (browser, Node.js, Edge Runtime, React Native) and provides features like smart caching, rate limiting, and comprehensive error handling.

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** (v21 or later)
- **npm**, **yarn**, or **pnpm**
- **Git**
- Basic knowledge of TypeScript and API development

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/feeefapp/yalidine.git
   cd feeef.js/yalidine
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup (WIP)**
   
   Create a `.env` file for testing (optional):
   ```env
   YALIDINE_API_ID=your_test_api_id
   YALIDINE_API_TOKEN=your_test_api_token
   GOUPEX_API_ID=your_test_goupex_id
   GOUPEX_API_TOKEN=your_test_goupex_token
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

5. **Build the Project**
   ```bash
   npm run build
   ```

## 📋 Development Workflow

### Branch Strategy

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/**: New features (`feature/parcel-tracking`)
- **fix/**: Bug fixes (`fix/authentication-error`)
- **docs/**: Documentation updates (`docs/api-reference`)

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (formatting, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvements
- `test`: Adding or correcting tests
- `chore`: Changes to build process or auxiliary tools

**Examples:**
```bash
git commit -m "feat(parcels): add bulk create functionality"
git commit -m "fix(auth): handle expired tokens gracefully"
git commit -m "docs(readme): update installation instructions"
```

## 🛠️ Code Standards

### TypeScript Guidelines

1. **Type Safety**: Always prefer explicit types over `any`
   ```typescript
   // ✅ Good
   interface ParcelData {
     tracking: string
     status: DeliveryStatus
   }
   
   // ❌ Avoid
   const parcelData: any = { ... }
   ```

2. **Interface Design**: Use clear, descriptive interfaces
   ```typescript
   // ✅ Good
   interface CreateParcelRequest {
     order_id: string
     recipient: RecipientInfo
     address: AddressInfo
     product_list: string
     price: number
   }
   ```

3. **Error Handling**: Use custom error classes
   ```typescript
   // ✅ Good
   throw new YalidineAPIError('Invalid API response', 400, response.data)
   ```

4. **Documentation**: All public methods must have JSDoc
   ```typescript
   /**
    * Creates a new parcel for delivery
    *
    * @param data - Parcel creation data
    * @returns Promise resolving to created parcel
    * @throws YalidineAPIError when API request fails
    *
    * @example
    * ```typescript
    * const parcel = await yalidine.parcels.create({
    *   order_id: 'order-123',
    *   recipient: { ... }
    * });
    * ```
    */
   async create(data: CreateParcelRequest): Promise<Parcel> {
     // implementation
   }
   ```

### Code Quality

- **ESLint**: Follow the configured ESLint rules
- **Prettier**: Code will be auto-formatted on commit
- **Type Checking**: Ensure `npm run typecheck` passes
- **Test Coverage**: Maintain >90% test coverage

### Performance Guidelines

1. **Lazy Loading**: Load data on-demand when possible
2. **Caching**: Implement smart caching for static data
3. **Bundle Size**: Keep the bundle size minimal and tree-shakable
4. **Memory Management**: Clean up resources properly

## 🧪 Testing

### Test Structure

```
tests/
├── unit/              # Unit tests for individual functions/classes
├── integration/       # Integration tests with real APIs
└── types/            # Type definition tests
```

### Writing Tests

1. **Unit Tests**: Test individual functions in isolation
   ```typescript
   import { describe, it, expect } from 'vitest'
   import { CartService } from '../src/feeef/services/cart.js'
   
   describe('CartService', () => {
     it('should calculate total correctly', () => {
       const cart = new CartService()
       cart.addItem({ id: '1', price: 100, quantity: 2 })
       expect(cart.getTotal()).toBe(200)
     })
   })
   ```

2. **Integration Tests**: Test API interactions
   ```typescript
   import { describe, it, expect } from 'vitest'
   import { Yalidine, YalidineMemoryDatabase } from '../src/index.js'
   
   describe('Yalidine API Integration', () => {
     it('should authenticate successfully', async () => {
       const yalidine = new Yalidine(testConfig)
       const isConnected = await yalidine.testConnection()
       expect(isConnected).toBe(true)
     })
   })
   ```

3. **Type Tests**: Ensure type safety
   ```typescript
   import { expectType } from '@japa/expect-type'
   import { Parcel } from '../src/types.js'
   
   test('Parcel type should be correctly defined', () => {
     expectType<Parcel>({
       tracking: 'yal-123456',
       status: 'En cours',
       created_at: '2024-01-01T00:00:00Z'
     })
   })
   ```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/unit/cart_service.spec.ts

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📚 Documentation

### API Documentation

- All public APIs must be documented with JSDoc
- Include examples for complex functionality
- Document error cases and edge cases

### README Updates

When adding new features:
1. Update the feature list
2. Add usage examples
3. Update the API reference section

### Changelog

Follow [Keep a Changelog](https://keepachangelog.com/):
- Add entries to `CHANGELOG.md`
- Use appropriate versioning (semver)
- Include migration notes for breaking changes

## 🐛 Bug Reports

### Before Submitting

1. Search existing issues to avoid duplicates
2. Test with the latest version
3. Prepare a minimal reproduction case

### Bug Report Template

```markdown
**Bug Description**
A clear description of the bug.

**Steps to Reproduce**
1. Initialize SDK with config...
2. Call method...
3. Observe error...

**Expected Behavior**
What should happen.

**Actual Behavior**
What actually happens.

**Environment**
- SDK Version: 
- Node.js Version:
- Operating System:
- Agent (yalidine/goupex):

**Code Sample**
```typescript
// Minimal reproduction code
```

**Additional Context**
Any other relevant information.
```

## ✨ Feature Requests

### Before Submitting

1. Check if the feature aligns with project goals
2. Search existing feature requests
3. Consider if it can be implemented as a plugin

### Feature Request Template

```markdown
**Feature Description**
A clear description of the proposed feature.

**Use Case**
Why is this feature needed? What problem does it solve?

**Proposed Solution**
How you envision this feature working.

**Alternative Solutions**
Other approaches you've considered.

**Additional Context**
Any other relevant information, mockups, or examples.
```

## 🔄 Pull Request Process

### Before Submitting

1. **Discuss**: For major changes, open an issue first
2. **Branch**: Create a feature branch from `develop`
3. **Test**: Ensure all tests pass
4. **Lint**: Fix any linting issues
5. **Document**: Update documentation as needed

### PR Checklist

- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] Changelog entry added
- [ ] Breaking changes documented
- [ ] Type definitions updated
- [ ] Examples updated if needed

### PR Template

```markdown
## Summary
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Related Issues
Fixes #(issue_number)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
```

## 🏗️ Architecture Guidelines

### Project Structure

```
src/
├── api/              # API endpoint implementations
├── database/         # Database abstraction layer
├── http/            # HTTP client and interceptors
├── types.ts         # Type definitions
├── utils.ts         # Utility functions
└── yalidine.ts      # Main SDK class
```

### Design Principles

1. **Single Responsibility**: Each class/function has one clear purpose
2. **Dependency Injection**: Use interfaces for better testability
3. **Error Handling**: Consistent error handling across the SDK
4. **Type Safety**: Leverage TypeScript's type system fully
5. **Performance**: Optimize for common use cases

### Adding New Features

1. **API Endpoints**: Add to appropriate API class in `src/api/`
2. **Types**: Define in `src/types.ts` with proper documentation
3. **Tests**: Add comprehensive test coverage
4. **Examples**: Include usage examples in documentation

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## 💬 Community

- **Issues**: [GitHub Issues](https://github.com/feeefapp/yalidine/issues)
- **Discussions**: [GitHub Discussions](https://github.com/feeefapp/yalidine/discussions)

## 🙏 Acknowledgments شكرا

Thank you for contributing to the feeef opensource! Your contributions help make delivery integration easier for developers across the community.

---

For questions or clarification on any of these guidelines, please open an issue or start a discussion.


