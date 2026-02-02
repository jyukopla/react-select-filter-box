#!/bin/bash
# Convert markdown documentation to HTML files for GitHub Pages

# Install marked-cli for markdown conversion
npm install -g marked

# Function to convert markdown to HTML with styling
convert_md_to_html() {
  input_file="$1"
  output_file="$2"
  title=$(basename "$input_file" .md | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2));}1')
  
  cat > "$output_file" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TITLE_PLACEHOLDER - React Select Filter Box</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css">
  <style>
    body { 
      margin: 0; 
      padding: 20px; 
      background: #f6f8fa;
      font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
    }
    .container {
      max-width: 980px;
      margin: 0 auto;
      background: white;
      padding: 45px;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e1e4e8;
    }
    .back-link {
      color: #0366d6;
      text-decoration: none;
      font-weight: 500;
    }
    .back-link:hover { text-decoration: underline; }
    .markdown-body { font-size: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>TITLE_PLACEHOLDER</h1>
      <a href="../index.html" class="back-link">← Back to Docs</a>
    </div>
    <div class="markdown-body">
EOF
  sed "s/TITLE_PLACEHOLDER/$title/g" "$output_file" > "$output_file.tmp" && mv "$output_file.tmp" "$output_file"
  marked "$input_file" >> "$output_file"
  cat >> "$output_file" << 'EOF'
    </div>
  </div>
</body>
</html>
EOF
}

# Create output directories
mkdir -p gh-pages/docs/guides
mkdir -p gh-pages/docs/examples
mkdir -p gh-pages/docs/architecture
mkdir -p gh-pages/docs/testing

# Convert all markdown files
for mdfile in docs/guides/*.md; do
  [ -f "$mdfile" ] && convert_md_to_html "$mdfile" "gh-pages/docs/guides/$(basename "$mdfile" .md).html"
done
for mdfile in docs/examples/*.md; do
  [ -f "$mdfile" ] && convert_md_to_html "$mdfile" "gh-pages/docs/examples/$(basename "$mdfile" .md).html"
done
for mdfile in docs/architecture/*.md; do
  [ -f "$mdfile" ] && convert_md_to_html "$mdfile" "gh-pages/docs/architecture/$(basename "$mdfile" .md).html"
done
for mdfile in docs/testing/*.md; do
  [ -f "$mdfile" ] && convert_md_to_html "$mdfile" "gh-pages/docs/testing/$(basename "$mdfile" .md).html"
done
