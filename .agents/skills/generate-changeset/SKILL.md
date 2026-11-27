---
name: generate-changeset
description: Analyzes code changes to generate a standard, user-facing changeset markdown file.
---

# Context

You are an expert release manager and technical writer. Your task is to analyze code modifications and generate a standard "changeset" markdown file. This file will be consumed by release tools to bump package versions and generate user-facing changelogs.

# Guidelines

## 1. Gather the Changes (The Diff)

Run a git diff comparing the current working branch against the integration branch (default to `main` if nothing provided). Use the three-dot syntax to isolate only the changes introduced in the current branch:
`git diff main...HEAD`

## 2. Determine the Version Bump (Semantic Versioning)

Analyze the changes to determine the impact on the public API:

- **patch**: Bug fixes, performance improvements, internal refactoring, or documentation updates that do not add new features or break existing ones.
- **minor**: New features, new non-breaking public APIs, or deprecation notices.
- **major**: Breaking changes, removal of public APIs, or fundamental changes to existing expected behavior.

> **Special case — MAJOR version `0`:** while a package's MAJOR version is `0`, the semantics shift down by one slot: `0.[semantic major].[semantic minor/patch]` instead of `MAJOR.MINOR.PATCH` (which is the normal situation once MAJOR >= 1). In that case, write **minor** for semantic-major changes (breaking changes, removal of public APIs, …) and **patch** for semantic-minor and semantic-patch changes (new features, non-breaking APIs, bug fixes, …).

## 3. Identify Affected Packages

List only the packages/workspaces that were meaningfully affected and require a release. Do not include test packages or purely internal tooling unless requested.

## 4. Write the Changelog Description

- **Audience:** End-users and developers consuming the package, NOT the internal contributors.
- **Tone:** Professional, clear, concise, and direct.
- **Content:** Focus on _what_ changed and _why_ it matters to the user, not _how_ it was implemented. (e.g., Use "Fixed a crash when loading large images" instead of "Refactored image processing loop to use async iterators").
- **Length:** Keep it brief. Use a short paragraph or a few bullet points if multiple distinct user-facing changes occurred.

## 5. Add the Pull Request Link

The changelog template renders a link next to the summary. Add a `pr:` line as the first
line of the summary when the change is part of a pull request:

```md
---
'fabrique': minor
---

pr: #42

Here is the human-readable, user-facing summary of the changes.
```

- `pr: #42` (or `pr: 42`) is parsed by the changelog generator, rendered as a link, and
  removed from the displayed summary.
- It must sit at the start of its own line to be parsed.
- Omit it when the change does not belong to a pull request: the summary simply renders
  without any link.

## 6. Strict Output Format

You must output **ONLY** the raw changeset content. Do not include greetings, explanations, or wrap the output in markdown code blocks (` ``` `).

The format MUST strictly follow this structure:

```md
---
'name-of-affected-package-1': patch | minor | major
'name-of-affected-package-2': patch | minor | major
---

Here is the human-readable, user-facing summary of the changes.
```

## 7. Save and Commit the File

Create a new markdown file inside the `.changeset` directory at the root of the project
(from this skill's location: `../../../.changeset`).
Name the file using a short, descriptive slug based on the core change (e.g., `.changeset/fix-image-loading-crash.md` or `.changeset/add-dark-mode.md`), unique across the repository. Write the strictly formatted content from Step 6 into this file.

Commit the changeset as part of the pull request: the release flow consumes it from the
integration branch after the merge, and the pull request link only resolves for changeset
files that are committed.
