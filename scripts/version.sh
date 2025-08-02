#!/bin/bash

# Version management script for VardaDienas
# Usage: ./scripts/version.sh <new_version>
# Example: ./scripts/version.sh 1.2.0

if [ $# -eq 0 ]; then
    echo "Usage: $0 <new_version>"
    echo "Example: $0 1.2.0"
    exit 1
fi

NEW_VERSION=$1

# Validate version format (x.y.z)
if ! [[ $NEW_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Error: Version must be in format x.y.z (e.g., 1.2.0)"
    exit 1
fi

echo "Updating version to $NEW_VERSION..."

# Update package.json
echo "Updating package.json..."
sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" package.json

# Update Android version
echo "Updating Android version..."
sed -i '' "s/versionName \"[^\"]*\"/versionName \"$NEW_VERSION\"/" android/app/build.gradle

# Update iOS versions in Xcode project
echo "Updating iOS versions..."
sed -i '' "s/MARKETING_VERSION = [^;]*;/MARKETING_VERSION = $NEW_VERSION;/g" ios/VardaDienas.xcodeproj/project.pbxproj

# Increment build number (CURRENT_PROJECT_VERSION) for App Store uploads
echo "Incrementing build number..."
# Extract current build number and increment it
CURRENT_BUILD=$(grep -o 'CURRENT_PROJECT_VERSION = [0-9]*;' ios/VardaDienas.xcodeproj/project.pbxproj | head -1 | grep -o '[0-9]*')
NEW_BUILD=$((CURRENT_BUILD + 1))
sed -i '' "s/CURRENT_PROJECT_VERSION = [0-9]*;/CURRENT_PROJECT_VERSION = $NEW_BUILD;/g" ios/VardaDienas.xcodeproj/project.pbxproj

echo "Version updated to $NEW_VERSION successfully!"
echo "Build number incremented to $NEW_BUILD"
echo ""
echo "Files updated:"
echo "- package.json"
echo "- android/app/build.gradle"
echo "- ios/VardaDienas.xcodeproj/project.pbxproj (version and build number)"
echo ""
echo "Next steps:"
echo "1. Commit these changes: git add . && git commit -m \"Bump version to $NEW_VERSION\""
echo "2. Create a tag: git tag v$NEW_VERSION"
echo "3. Push changes: git push && git push --tags"
echo "4. Trigger Codemagic build for App Store submission" 