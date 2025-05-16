#!/bin/bash
#
# Usage:
#   1. Save this script as scripts/bump-version.sh
#   2. Make it executable:
#        chmod +x scripts/bump-version.sh
#   3. Run the script from the project root:
#        ./scripts/bump-version.sh
#
# What it does:
#   - Automatically bumps the version in both package.json files according to these rules:
#       - If current version is X.Y.9, next is X.(Y+1).0
#       - If current version is X.9.9, next is (X+1).0.0
#       - Otherwise, next is X.Y.(Z+1)
#   - Updates the version badge in readme.md
#   - Regenerates lock files (bun & npm) in both root and src/conduit_mcp_server/
#   - Commits, tags, and pushes the changes
#   - Prompts for confirmation before making any changes
#
# Example:
#   ./scripts/bump-version.sh

set -e

# Get current version from root package.json
CUR_VERSION=$(node -p "require('./package.json').version")
IFS='.' read -r MAJOR MINOR PATCH <<< "$CUR_VERSION"

# Calculate next version
if [[ "$PATCH" == "9" ]]; then
  if [[ "$MINOR" == "9" ]]; then
    NEXT_VERSION="$((MAJOR + 1)).0.0"
  else
    NEXT_VERSION="$MAJOR.$((MINOR + 1)).0"
  fi
else
  NEXT_VERSION="$MAJOR.$MINOR.$((PATCH + 1))"
fi

echo "Current version: $CUR_VERSION"
echo "Next version:    $NEXT_VERSION"
read -p "Proceed with version bump? [y/N] " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 1
fi

# 1. Update version in both package.json files (no git tag yet)
npm version --no-git-tag-version "$NEXT_VERSION"
npm version --no-git-tag-version "$NEXT_VERSION" --prefix src/conduit_mcp_server

# 2. Update version badge in readme.md (macOS/BSD sed)
sed -i '' "s/version-[0-9.]*-blue.svg/version-$NEXT_VERSION-blue.svg/g" readme.md

# 3. Regenerate lock files
bun install
npm install
(cd src/conduit_mcp_server && bun install && npm install)

# 4. Commit, tag, and push
git add package.json package-lock.json bun.lock readme.md src/conduit_mcp_server/package.json src/conduit_mcp_server/package-lock.json src/conduit_mcp_server/bun.lock
git commit -m "Bump version to $NEXT_VERSION and update lock files and badge"
git tag "v$NEXT_VERSION"
git push
git push --tags

echo "Version bump to $NEXT_VERSION complete and pushed."
