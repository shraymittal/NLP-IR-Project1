#!/usr/bin/env bash
set -e

# Make sure we're on the master branch before the live branch
git checkout master

# Run the build to get the latest in the build/ folder
yarn build

# Creates the live branch
(git branch -D live && git checkout -b live) || git checkout -b live

# Merge in new changes
git merge master --no-ff --strategy-option theirs --no-edit --allow-unrelated-histories

# The build/ files are ignored by default in the .gitignore
# --all ensures that deletions are taken into account
git add --force --all build/

# Show what's happening
git status

# Need to commit these files since they aren't in the index by default during development
git commit --allow-empty -m "Updating live site with latest code built on $(date)"

# GitLab pages requires files to be in the root directory of the repo,
# so subtree push forces the *contents* of the build directory to become
# the root only on gh-pages
# Update: Using subtree split now to force changes onto gh-pages (https://gist.github.com/cobyism/4730490#gistcomment-1374989)
git push origin `git subtree split --prefix build live`:refs/heads/live --force

# Return to previous branch
git checkout master

# Cleanup branch
git branch -D live

echo -e "\e[32mSuccess!"
