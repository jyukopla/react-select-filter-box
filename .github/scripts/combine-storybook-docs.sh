#!/bin/bash
# Combine Storybook and Docs for GitHub Pages deployment

# Create gh-pages directory structure
mkdir -p gh-pages/storybook
mkdir -p gh-pages/api
mkdir -p gh-pages/docs

# Copy Storybook build
cp -r storybook-static/* gh-pages/storybook/

# Copy API docs (now HTML files)
cp -r docs/api/* gh-pages/api/

# Add .nojekyll to disable Jekyll processing
touch gh-pages/.nojekyll

# HTML docs were already created in previous step
# No need to copy markdown files

# Create docs index page
cat > gh-pages/docs/index.html << 'DOCSEOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Documentation - React Select Filter Box</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: #f5f7fa;
      padding: 40px 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 40px;
    }
    h1 {
      color: #333;
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #666;
      font-size: 1.1em;
      margin-bottom: 40px;
    }
    .section {
      margin-bottom: 40px;
    }
    .section h2 {
      color: #667eea;
      font-size: 1.5em;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e0e0e0;
    }
    .doc-list {
      display: grid;
      gap: 12px;
    }
    .doc-link {
      display: block;
      padding: 16px 20px;
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      border-radius: 4px;
      text-decoration: none;
      color: #333;
      transition: all 0.2s;
    }
    .doc-link:hover {
      background: #e8eaf6;
      transform: translateX(4px);
    }
    .doc-link strong {
      color: #667eea;
      display: block;
      margin-bottom: 4px;
    }
    .doc-link small {
      color: #666;
    }
    .back-link {
      display: inline-block;
      margin-top: 30px;
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }
    .back-link:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📚 Documentation</h1>
    <p class="subtitle">Comprehensive guides and examples for React Select Filter Box</p>
    
    <div class="section">
      <h2>🚀 Getting Started</h2>
      <div class="doc-list">
        <a href="guides/schema-definition.html" class="doc-link">
          <strong>Schema Definition</strong>
          <small>Learn how to define field schemas for your filter box</small>
        </a>
        <a href="examples/basic-usage.html" class="doc-link">
          <strong>Basic Usage</strong>
          <small>Get started with simple examples</small>
        </a>
      </div>
    </div>

    <div class="section">
      <h2>🎨 Customization</h2>
      <div class="doc-list">
        <a href="guides/theming.html" class="doc-link">
          <strong>Theming Guide</strong>
          <small>Customize colors, typography, and styles</small>
        </a>
        <a href="guides/custom-autocompleters.html" class="doc-link">
          <strong>Custom Autocompleters</strong>
          <small>Create custom autocomplete providers</small>
        </a>
        <a href="examples/custom-widget.html" class="doc-link">
          <strong>Custom Widgets</strong>
          <small>Build custom input widgets for values</small>
        </a>
      </div>
    </div>

    <div class="section">
      <h2>💼 Advanced Examples</h2>
      <div class="doc-list">
        <a href="examples/process-engine-integration.html" class="doc-link">
          <strong>Process Engine Integration</strong>
          <small>Real-world integration example</small>
        </a>
        <a href="examples/server-side-validation.html" class="doc-link">
          <strong>Server-Side Validation</strong>
          <small>Validate expressions on your backend</small>
        </a>
      </div>
    </div>

    <div class="section">
      <h2>🧪 Testing & Architecture</h2>
      <div class="doc-list">
        <a href="guides/testing.html" class="doc-link">
          <strong>Testing Guide</strong>
          <small>How to test components using this library</small>
        </a>
        <a href="testing/screen-reader-testing.html" class="doc-link">
          <strong>Screen Reader Testing</strong>
          <small>Accessibility testing procedures</small>
        </a>
        <a href="architecture/data-flow.html" class="doc-link">
          <strong>Data Flow</strong>
          <small>Understand the internal data flow</small>
        </a>
        <a href="architecture/component-tree.html" class="doc-link">
          <strong>Component Tree</strong>
          <small>Component hierarchy and relationships</small>
        </a>
        <a href="architecture/state-shape.html" class="doc-link">
          <strong>State Shape</strong>
          <small>Internal state management structure</small>
        </a>
      </div>
    </div>

    <div class="section">
      <h2>⚡ Optimization</h2>
      <div class="doc-list">
        <a href="guides/bundle-optimization.html" class="doc-link">
          <strong>Bundle Optimization</strong>
          <small>Code splitting and tree shaking strategies</small>
        </a>
      </div>
    </div>

    <a href="../" class="back-link">← Back to main documentation</a>
  </div>
</body>
</html>
DOCSEOF

# Create main index page
cat > gh-pages/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React Select Filter Box - Documentation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      padding: 60px;
      max-width: 600px;
      width: 100%;
    }
    h1 {
      color: #333;
      font-size: 2.5em;
      margin-bottom: 16px;
    }
    .tagline {
      color: #666;
      font-size: 1.1em;
      margin-bottom: 40px;
      line-height: 1.6;
    }
    .nav-links {
      display: grid;
      gap: 16px;
    }
    .nav-link {
      display: flex;
      align-items: center;
      padding: 20px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1.1em;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .nav-link:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }
    .icon {
      font-size: 1.5em;
      margin-right: 12px;
    }
    .github-link {
      margin-top: 30px;
      text-align: center;
    }
    .github-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }
    .github-link a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>React Select Filter Box</h1>
    <p class="tagline">
      A Sequential Filter Box component for React that provides a Select2-like 
      single-line filter expression builder with keyboard navigation and accessibility support.
    </p>
    <div class="nav-links">
      <a href="./storybook/index.html" class="nav-link">
        <span class="icon">📚</span>
        <span>Interactive Storybook</span>
      </a>
      <a href="./api/" class="nav-link">
        <span class="icon">📖</span>
        <span>API Documentation</span>
      </a>
      <a href="./docs/" class="nav-link">
        <span class="icon">📝</span>
        <span>Guides & Examples</span>
      </a>
    </div>
    <div class="github-link">
      <a href="https://github.com/jyukopla/react-select-filter-box" target="_blank">
        View on GitHub →
      </a>
    </div>
  </div>
</body>
</html>
EOF
