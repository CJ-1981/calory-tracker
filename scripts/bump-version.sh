#!/bin/bash

# Version bump helper script for Calorie Tracker
# Usage: ./scripts/bump-version.sh [major|minor|patch]

set -e

VERSION_TYPE=${1:-"minor"}

# Get current version
CURRENT_VERSION=$(node -p "require('../package.json').version")
echo "Current version: $CURRENT_VERSION"

# Split version into major, minor, patch
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

# Increment based on type
case $VERSION_TYPE in
  "major")
    MAJOR=$((MAJOR + 1))
    MINOR=0
    PATCH=0
    ;;
  "minor")
    MINOR=$((MINOR + 1))
    PATCH=0
    ;;
  "patch")
    PATCH=$((PATCH + 1))
    ;;
  *)
    echo "Usage: $0 [major|minor|patch]"
    echo "Default: minor"
    MINOR=$((MINOR + 1))
    PATCH=0
    ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
echo "New version: $NEW_VERSION"

# Update package.json
node -e "const pkg = require('../package.json'); pkg.version = '$NEW_VERSION'; require('fs').writeFileSync('../package.json', JSON.stringify(pkg, null, 2));"

# Update settings.tsx
sed -i '' "s/Version $CURRENT_VERSION/Version $NEW_VERSION/" app/(tabs)/settings.tsx

echo "✅ Version bumped to $NEW_VERSION"
echo "📝 Don't forget to update CHANGELOG.md!"
echo ""
echo "Next steps:"
echo "1. Update CHANGELOG.md with new version details"
echo "2. Commit: git add ."
echo "3. Commit: git commit -m \"chore: bump version to $NEW_VERSION\""
echo "4. Push: git push origin main"
