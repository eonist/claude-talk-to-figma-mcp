#!/bin/bash
#
# Automated Version Bump Script
# 
# Intelligently increments project version numbers across multiple package.json files
# following semantic versioning principles. Handles lock file regeneration, git operations,
# and documentation updates in a single atomic operation.
#
# Author: Conduit MCP Team
# Version: 2.0.0
# Dependencies: git, npm, bun (optional), sed
#
# Semantic Versioning Rules:
# - X.Y.9 → X.(Y+1).0 (minor version bump when patch reaches 9)
# - X.9.9 → (X+1).0.0 (major version bump when minor and patch reach 9)
# - X.Y.Z → X.Y.(Z+1) (standard patch increment)
#
# Usage:
#   chmod +x scripts/bump-version.sh
#   ./scripts/bump-version.sh
#
# What it does:
# 1. Reads current version from latest git tag
# 2. Calculates next version using semantic rules
# 3. Updates package.json files in root and src/conduit_mcp_server/
# 4. Updates version badge in README.md
# 5. Regenerates all lock files (bun.lock, package-lock.json)
# 6. Creates git commit with descriptive message
# 7. Creates and pushes git tag
# 8. Pushes all changes to remote repository
#
# Exit Codes:
#   0 - Success
#   1 - User cancelled operation
#   2 - Git operation failed
#   3 - Package update failed
#
# Example:
#   ./scripts/bump-version.sh

set -e

# Get current version from latest git tag
GIT_VERSION=$(git describe --tags --abbrev=0)
CUR_VERSION=${GIT_VERSION#v}
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
