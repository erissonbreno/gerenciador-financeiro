---
description: Commit staged/unstaged changes with a short, concise message
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*)
---

Create a git commit for the current changes. Follow these steps:

1. Run `git status` and `git diff` (staged + unstaged) to understand what changed.
2. Stage all relevant modified/new files (prefer specific files over `git add .`). Do NOT stage files that contain secrets (.env, credentials, etc).
3. Write a commit message in **Portuguese** that is:
   - One line only, max 72 characters
   - Lowercase, no period at the end
   - Imperative mood (e.g. "adiciona", "corrige", "remove", "atualiza")
   - Focused on **what** changed, not why
   - No co-author, no emojis, no conventional commit prefixes
4. Commit and show the result.

If there are no changes to commit, say so and stop.
