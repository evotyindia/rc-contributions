# Contributing Guide

Welcome! Follow these steps to add yourself to the Wall of Fame.

## 1) Fork the repository
Click the “Fork” button at the top-right of this page to create your own copy.

## 2) Create a branch
- Open your fork in GitHub.
- Create a new branch:
  - Name it something like: feature/add-your-name

## 3) Generate your JSON offline
- Download or clone your fork (optional for this step).
- Double-click index.html to open it locally in your browser (works offline).
- Fill in:
  - Full Name
  - Roll Number (example: 24bca001 -> 2 digits + 3 letters + 3 digits)
  - GitHub Username (your actual GitHub username)
- Click “Download JSON”.
  - The file name should be submissions/yourusername.json
  - If your browser saves to Downloads, move it into the submissions/ folder in your fork.

## 4) Commit your change
- Ensure your file path is submissions/yourusername.json
- Commit with a message like:
  - chore: add contribution for yourusername

## 5) Open a Pull Request
- Push your branch.
- Create a Pull Request from your fork to this repo’s main branch.
- The automated checks will:
  - Validate your data (schema, duplicates, formatting).
  - Ensure you only changed submissions/yourusername.json.
  - Comment on the PR if anything needs fixing.
  - Auto-merge your PR when everything is correct.

## Notes
- Do not modify data/contributors.json or README.md manually; the bot updates them.
- If you made a mistake, just push another commit to your branch. The checks re-run automatically.