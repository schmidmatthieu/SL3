#!/bin/bash
cd /Users/matthieuschmid/IdeaProjects/SL3_beta/apps/web

# Remplacer tous les imports @/apps/web/ par @/
find . -type f -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' 's|@/apps/web/|@/|g' "$file"
done
