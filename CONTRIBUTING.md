# Contributing to NuCalc Pro

Thank you for your interest in contributing to NuCalc Pro! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/NuCalc-Calculator-App.git
   cd NuCalc-Calculator-App
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:4260`

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Code Quality Checks

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix

# Check code formatting
npm run format:check

# Format code
npm run format

# Run all quality checks
npm run validate
```

## Coding Standards

### TypeScript Guidelines

- Use strict TypeScript mode
- Avoid `any` types when possible
- Document public methods with JSDoc comments
- Use meaningful variable and function names
- Keep functions small and focused

### Code Style

- We use Prettier for code formatting
- We use ESLint for code quality
- Follow conventional commits format (see below)
- Maximum line length: 100 characters (handled by Prettier)

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes

**Examples:**
```
feat: add calculation history feature
fix(calculator): resolve division by zero error
docs: update README with PWA installation instructions
test: add unit tests for utils module
```

### File Structure

```
src/
├── calculator.ts      # Core calculator logic
├── operation.ts       # Operation types and enums
├── utils.ts          # Utility functions
├── main.ts           # Application entry point
├── pwaHandler.ts     # PWA functionality
├── *.test.ts         # Unit tests
```

## Testing

### Writing Unit Tests

- Place test files next to the source files with `.test.ts` extension
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Aim for >80% code coverage
- Test edge cases and error conditions

Example:
```typescript
describe("Calculator", () => {
  let calculator: Calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  it("should add two numbers correctly", () => {
    calculator.addDigit("5");
    calculator.selectOperation(SupportedOperation.Add);
    calculator.addDigit("3");
    calculator.calculate();
    expect(calculator.display).toBe("8");
  });
});
```

### Writing E2E Tests

- Place E2E tests in the `e2e/` directory
- Test user workflows, not implementation details
- Use meaningful selectors (prefer `data-testid`)
- Test across different browsers

## Submitting Changes

### Pull Request Process

1. Ensure all tests pass:
   ```bash
   npm run validate
   ```

2. Update documentation if needed

3. Commit your changes with conventional commit messages

4. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

5. Create a Pull Request on GitHub

6. Fill out the PR template with:
   - Description of changes
   - Related issues
   - Testing performed
   - Screenshots (if applicable)

### PR Review Process

- All PRs require at least one approval
- CI/CD must pass
- Code coverage must not decrease
- No merge conflicts

## Reporting Bugs

### Before Submitting a Bug Report

1. Check if the bug has already been reported
2. Ensure you're using the latest version
3. Try to reproduce the issue

### Submitting a Bug Report

Create an issue with:

- **Title**: Clear, descriptive title
- **Description**: Detailed description of the bug
- **Steps to Reproduce**: Step-by-step instructions
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: Browser, OS, version
- **Screenshots**: If applicable

## Feature Requests

We welcome feature requests! Please create an issue with:

- **Title**: Clear feature description
- **Use Case**: Why is this feature needed?
- **Proposed Solution**: How should it work?
- **Alternatives**: Other solutions you've considered
- **Additional Context**: Any other information

## Development Tips

### Debugging

- Use browser DevTools for frontend debugging
- Check console for errors and warnings
- Use `console.log` sparingly (remove before committing)

### Performance

- Keep bundle size small
- Avoid unnecessary re-renders
- Use code splitting when appropriate
- Monitor Lighthouse scores

### Accessibility

- Use semantic HTML
- Add ARIA labels where needed
- Test with screen readers
- Ensure keyboard navigation works
- Maintain color contrast ratios

## Questions?

If you have questions, feel free to:

- Open an issue with the `question` label
- Check existing documentation
- Review closed issues and PRs

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to NuCalc Pro! 🎉
