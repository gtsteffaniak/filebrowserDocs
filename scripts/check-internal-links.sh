#!/bin/bash
# Check internal documentation links for issues
# - Links missing language prefix (/docs/ instead of /en/docs/)
# - HTML links that should use doclink shortcodes
# - Hardcoded /docs/ links that should use doclink shortcodes

set -e

contentDir="content"
error_count=0
warning_count=0

echo "Checking internal documentation links..."
echo ""

# Function to strip code blocks (same as check-external-links.sh)
strip_code_blocks() {
    awk '
    /^```/ || /^~~~/ {
        in_fence = !in_fence
        next
    }
    /<pre>/ || /<code>/ {
        in_html = 1
        next
    }
    /<\/pre>/ || /<\/code>/ {
        in_html = 0
        next
    }
    /^    / {
        next
    }
    !in_fence && !in_html {
        # Remove inline code
        gsub(/`[^`]*`/, "")
        print
    }
    ' "$1"
}

# Process each markdown file
for file in $(find "$contentDir" -name "*.md" -type f); do
    # Strip code blocks
    CLEANED=$(mktemp 2>/dev/null || echo "/tmp/check-internal-$$-$(basename "$file")")
    strip_code_blocks "$file" > "$CLEANED"
    
    # Check for HTML links with /docs/ (missing language prefix or should use doclink)
    if grep -q 'href=["'\'']/docs/' "$CLEANED" 2>/dev/null; then
        grep -n 'href=["'\'']/docs/' "$CLEANED" 2>/dev/null | while IFS=: read -r lineno line; do
            # Extract the href value
            href=$(echo "$line" | sed -E 's/.*href=["'\'']([^"'\'']+)["'\''].*/\1/')
            echo "❌ $file:$lineno"
            echo "   Bad HTML link (missing language prefix or should use doclink):"
            echo "   href=\"$href\""
            echo ""
        done
        error_count=$((error_count + 1))
    fi
    
    # Check for markdown links with /docs/ (missing language prefix)
    if grep -q '\]\(/docs/' "$CLEANED" 2>/dev/null; then
        grep -n '\]\(/docs/' "$CLEANED" 2>/dev/null | while IFS=: read -r lineno line; do
            # Extract the link
            link=$(echo "$line" | sed -E 's/.*\]\(([^)]+)\).*/\1/')
            echo "❌ $file:$lineno"
            echo "   Bad markdown link (missing language prefix or should use doclink):"
            echo "   $link"
            echo ""
        done
        error_count=$((error_count + 1))
    fi
    
    # Check for absolute links with language prefix (e.g. /en/docs/ or /es/docs/)
    if grep -qE '(href=["'\'']/[a-z-]+/docs/|]\(/[a-z-]+/docs/)' "$CLEANED" 2>/dev/null; then
        while IFS=: read -r lineno line; do
            [ -z "$lineno" ] && continue
            if echo "$line" | grep -q 'href='; then
                link=$(echo "$line" | sed -E 's/.*href=["'\'']([^"'\'']+)["'\''].*/\1/')
            else
                link=$(echo "$line" | sed -E 's/.*\]\(([^)]+)\).*/\1/')
            fi
            link_clean=$(echo "$link" | sed -E 's/#.*//')
            target_rel=$(echo "$link_clean" | sed -E 's|^/||')
            target_path="$contentDir/$target_rel"
            target_path="${target_path%/}"

            if [ ! -f "$target_path" ] && [ ! -f "${target_path}.md" ] && [ ! -f "${target_path}/_index.md" ] && [ ! -f "${target_path}/index.md" ]; then
                echo "❌ $file:$lineno"
                echo "   Broken internal link destination (target not found: $target_path):"
                echo "   $link"
                echo ""
                error_count=$((error_count + 1))
            else
                echo "⚠️  $file:$lineno"
                echo "   Link with language prefix (consider using doclink shortcode):"
                echo "   $link"
                echo ""
                warning_count=$((warning_count + 1))
            fi
        done < <(grep -n -E '(href=["'\'']/[a-z-]+/docs/|]\(/[a-z-]+/docs/)' "$CLEANED" 2>/dev/null || true)
    fi

    # Check for relative markdown links and verify target existence
    if grep -qE '\]\([^)]+\)' "$CLEANED" 2>/dev/null; then
        while IFS=: read -r lineno line; do
            [ -z "$lineno" ] && continue
            link=$(echo "$line" | sed -E 's/.*\]\(([^)]+)\).*/\1/')
            case "$link" in
                http://*|https://*|mailto:*|"#"*|tel:*|/*)
                    ;;
                *)
                    link_clean=$(echo "$link" | sed -E 's/#.*//')
                    if [ -n "$link_clean" ]; then
                        file_dir=$(dirname "$file")
                        target="$file_dir/$link_clean"
                        target="${target%/}"
                        if [ ! -f "$target" ] && [ ! -f "${target}.md" ] && [ ! -f "${target}/_index.md" ] && [ ! -f "${target}/index.md" ]; then
                            echo "❌ $file:$lineno"
                            echo "   Broken relative link destination (target not found: $target):"
                            echo "   $link"
                            echo ""
                            error_count=$((error_count + 1))
                        fi
                    fi
                    ;;
            esac
        done < <(grep -n -E '\]\([^)]+\)' "$CLEANED" 2>/dev/null || true)
    fi
    
    rm -f "$CLEANED"
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $error_count -gt 0 ]; then
    echo "❌ Found issues in $error_count file(s) - links missing language prefix or should use doclink shortcodes"
    echo ""
    echo "To fix these issues, run:"
    echo "  node scripts/doclinks.js --mode=doclink"
    echo ""
    exit 1
elif [ $warning_count -gt 0 ]; then
    echo "⚠️  Found warnings in $warning_count file(s) - links with language prefix (consider using doclink shortcodes)"
    echo ""
    echo "To convert these to doclink shortcodes, run:"
    echo "  node scripts/doclinks.js --mode=doclink"
    echo ""
    exit 0
else
    echo "✅ All internal links are properly formatted"
    exit 0
fi
