# Contributing

## `funcionalidades.md` Governance

`funcionalidades.md` is NeuFlorest's living source of truth for product capabilities, ownership, feature status, and architectural decisions. It exists so reviewers can evaluate code changes together with their impact on the system map.

Keeping this file current is a hard requirement for pull request approval. A PR may be blocked if it changes system behavior, ownership, feature scope, service boundaries, or architectural direction without updating `funcionalidades.md` or explaining why no update is needed.

Update `funcionalidades.md` when a PR does any of the following:

- Adds, removes, renames, or materially changes a feature.
- Changes a feature status using the status vocabulary defined at the top of `funcionalidades.md`.
- Changes the owner or expected ownership level of a domain or feature.
- Changes service boundaries between Django, Quarkus, React, PostgreSQL, MQTT, Nginx, or ESP32 firmware.
- Introduces a new cross-service contract, operational responsibility, security assumption, or data ownership rule.
- Implements, reverses, or materially changes an architectural decision that belongs in the ADR section.
- Rejects an important alternative that the team is likely to revisit later.

Do not use `funcionalidades.md` for implementation details. Code structure, endpoint internals, SQL mechanics, component props, and low-level firmware details belong in source files, migrations, tests, or dedicated technical docs. `funcionalidades.md` should describe what the system does, who owns it, what state it is in, and which major decisions have been made.

Every PR must complete the `funcionalidades.md` gate in the pull request template. Reviewers should treat that gate as part of the code review, not as a post-merge cleanup task.

Small changes such as typo fixes, formatting-only changes, dependency lockfile refreshes, or internal refactors may skip a document update, but the PR author must explicitly say why in the template.
