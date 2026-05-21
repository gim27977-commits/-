# CLAUDE.md

This file provides guidance to AI assistants (Claude Code and others) working in this repository.

## Repository Status

This repository is in early initialization. The only committed file so far is this CLAUDE.md. The conventions below apply as the codebase grows.

- **Repository**: `gim27977-commits/-`
- **Current working branch**: `claude/add-claude-documentation-6Y0Pc`
- **Branches**: feature branches only; `main` is the protected base branch

## Git Workflow

- Create feature branches from `main` using descriptive names (e.g., `feat/user-auth`, `fix/login-bug`)
- Write clear, concise commit messages in the imperative mood ("Add feature" not "Added feature")
- Always commit before pushing; always push with `git push -u origin <branch-name>`
- Do not amend published commits; create new commits instead
- Never force-push to `main` or `master`
- Never skip hooks (`--no-verify`) unless the user explicitly requests it

### Commit Message Format

Use a HEREDOC to pass commit messages to avoid shell escaping issues:

```bash
git commit -m "$(cat <<'EOF'
Short imperative summary (50 chars max)

Optional longer explanation of why, not what.
EOF
)"
```

### Pull Requests

Do not create a pull request unless the user explicitly asks for one.

## Code Style Conventions

- Prefer editing existing files over creating new ones
- Do not add comments unless the "why" is non-obvious (hidden constraints, workarounds, subtle invariants)
- Never write multi-paragraph docstrings or multi-line comment blocks
- Do not add error handling, fallbacks, or validation for scenarios that cannot happen
- Do not introduce abstractions beyond what the current task requires
- No feature flags or backwards-compatibility shims unless explicitly needed

## Security

- Never commit secrets, credentials, API keys, or `.env` files
- Validate only at system boundaries (user input, external APIs); trust internal code
- Avoid OWASP Top 10 vulnerabilities: SQL injection, XSS, command injection, etc.
- If insecure code is written accidentally, fix it immediately before moving on

## AI Assistant Guidance

### General Principles

- Read files before editing them
- Run independent tool calls in parallel where possible
- For exploratory questions, respond with a 2–3 sentence recommendation plus the main trade-off; do not implement until the user agrees
- Match the scope of changes to what was actually requested; do not gold-plate

### Risky Actions — Always Confirm First

Before taking any of these actions, explain what you're about to do and ask the user to confirm:

- Deleting files or branches
- Force-pushing
- `git reset --hard`
- Modifying CI/CD pipelines
- Pushing to shared or protected branches
- Sending messages or comments to external services (GitHub issues, Slack, email)

## Project Setup (To Be Updated)

As the project takes shape, update this section with:

- **Language / Runtime**: e.g., Node 20, Python 3.12, Go 1.22
- **Package manager**: e.g., `npm`, `pnpm`, `uv`, `cargo`
- **Install dependencies**: e.g., `npm install`
- **Run tests**: e.g., `npm test`
- **Lint / format**: e.g., `npm run lint`, `ruff check .`
- **Start dev server**: e.g., `npm run dev`
- **Build for production**: e.g., `npm run build`

## Directory Structure (To Be Updated)

Document the top-level layout here once files are added:

```
/
├── src/          # Application source code
├── tests/        # Test files
├── docs/         # Documentation
└── CLAUDE.md     # This file
```

## Testing Conventions (To Be Updated)

- Describe the test framework (Jest, pytest, Go test, etc.)
- Explain how to run a single test vs. the full suite
- Note any test data or fixtures setup required
- Specify coverage thresholds if any
