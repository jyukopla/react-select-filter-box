# Makefile for react-select-filter-box
# Mirrors package.json scripts with node_modules dependency

.PHONY: all build build-lib check lint test test-watch test-all test-coverage test-storybook \
        format format-check typecheck docs-api storybook build-storybook chromatic clean help

# Default target
all: build

# Node modules - automatically installed when needed
node_modules: package.json package-lock.json
	npm install
	@touch node_modules

# Build targets
build: node_modules
	npm run build

build-lib: node_modules
	npm run build:lib

check: lint

# Linting and formatting
lint: node_modules
	npm run lint

format: node_modules
	npm run format

format-check: node_modules
	npm run format:check

# Type checking
typecheck: node_modules
	npm run typecheck

# Testing
test: node_modules
	npm run test

test-watch: node_modules
	npm run test:watch

test-all: node_modules
	npm run test:all

test-coverage: node_modules
	npm run test:coverage

test-storybook: node_modules
	npm run test:storybook

# Documentation
docs-api: node_modules
	npm run docs:api

# Storybook
storybook: node_modules
	npm run storybook

build-storybook: node_modules
	npm run build-storybook

chromatic: node_modules
	npm run chromatic

# Utilities
clean:
	rm -rf node_modules dist coverage storybook-static

# Help target
help:
	@echo "Available targets:"
	@echo "  all            - Default target, runs build"
	@echo "  build          - Build the project"
	@echo "  build-lib      - Build library for distribution"
	@echo "  lint           - Run ESLint"
	@echo "  format         - Format code with Prettier"
	@echo "  format-check   - Check code formatting"
	@echo "  typecheck      - Run TypeScript type checking"
	@echo "  test           - Run tests"
	@echo "  test-watch     - Run tests in watch mode"
	@echo "  test-all       - Run all tests"
	@echo "  test-coverage  - Run tests with coverage"
	@echo "  test-storybook - Run Storybook tests"
	@echo "  docs-api       - Generate API documentation"
	@echo "  storybook      - Start Storybook dev server"
	@echo "  build-storybook - Build Storybook static site"
	@echo "  chromatic      - Run Chromatic visual tests"
	@echo "  clean          - Remove node_modules, dist, coverage, storybook-static"
	@echo "  help           - Show this help message"
