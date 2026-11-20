# Contributing to angular-redux2

Thanks for your interest in contributing.
Bug reports, fixes, features, and documentation improvements are all welcome.
This guide explains how to set up the project and get a change merged.

## Code of conduct

By participating you agree to follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Be respectful and constructive in issues, pull requests, and reviews.

## Ways to contribute

- **Report a bug**: open a [bug report](https://github.com/angular-redux2/store/issues/new?template=bug_report.md) with a minimal reproduction.
- **Request a feature**: open a [feature request](https://github.com/angular-redux2/store/issues/new?template=feature_request.md) describing the use case.
- **Send a pull request**: fix a bug, add a feature, or improve the docs.

Search [existing issues](https://github.com/angular-redux2/store/issues) first to avoid duplicates.

## Development setup

angular-redux2 uses [pnpm](https://pnpm.io) and requires Node.js 22.22 or 24.15 and later, as Angular 22 does.

```bash
git clone https://github.com/angular-redux2/store.git
cd store
pnpm install
```

### Scripts

| Command              | Description                                       |
|----------------------|---------------------------------------------------|
| `pnpm build`         | Build the library into `dist/` with ng-packagr.   |
| `pnpm dev`           | Build in watch mode.                              |
| `pnpm test`          | Run the test suite (xJet).                        |
| `pnpm lint`          | Run markdownlint and ESLint.                      |
| `pnpm lint:md`       | Run markdownlint only.                            |
| `pnpm lint:eslint`   | Run ESLint only.                                  |
| `pnpm docs:dev`      | Serve the VitePress docs locally.                 |
| `pnpm docs:build`    | Build the docs.                                   |

Run `pnpm lint`, `pnpm test`, and `pnpm build` before opening a pull request. CI runs these as separate jobs.

## Workflow

1. Fork the repository and create a branch from `main`.

   ```bash
   git checkout -b feature/short-description
   ```

2. Make your change, with tests and documentation.
3. Verify everything passes:

   ```bash
   pnpm lint
   pnpm test
   pnpm build
   ```

4. Push your branch and open a pull request against `main`. Fill in the pull request template.

Keep pull requests small and focused; they are easier to review and merge.

## Commit messages

Follow the existing history: a lowercase area prefix, a colon, then an imperative summary.

```text
reducer.service: Fix proxy stack access
object.component: Add support for a symbol type
reducer.abstract: Fix the slice reducer returning undefined
dev-tool.service: Update docs and imports, add spec tests
```

- The prefix is a place, not a category. Use the file, module, or folder the change lives in - not a Conventional
  Commits type such as `feat:` or `fix:`.
- Use the imperative mood ("Add", not "Added" or "Adds").
- Keep the first line at or under 72 characters.
- Reference related issues in the body (for example, `Closes #123`).

## Coding standards

- Write **TypeScript** with explicit types; avoid `any`.
- Document every exported symbol with **TSDoc**, including an `@since` tag. Keep the tag order consistent with the
  rest of the codebase: description, `@param`, `@returns`, `@throws`, `@remarks`, `@example`, `@see`, `@since`.
- Keep functions small, pure, and testable.
- Match the surrounding style; `pnpm lint` enforces formatting, imports, and the type check.

## Project layout

```text
package.json          the package manifest; ng-packagr publishes it without scripts and devDependencies
ng-package.json       the build of the main entry point, src/index.ts → dist/
src/
  index.ts            @angular-redux2/store
  abstract/ components/ decorators/ interfaces/ modules/ services/
  specs/              integration specs
mocks/
  ng-package.json     the @angular-redux2/store/mocks entry point
  index.ts
  interfaces/ modules/ services/
```

ng-packagr names an entry point after its folder's path from the root `ng-package.json`, so `mocks/` at the root
publishes as `@angular-redux2/store/mocks`, the way `@angular/core/testing` sits beside `src/` in Angular's own repo.
Under `src/` it would publish as `@angular-redux2/store/src/mocks`. `dist/package.json` gets an `exports` map for `.`
and `./mocks`, and `README.md` and `LICENSE` are copied into `dist/`.

## Imports in the library

Library code under `src/` and `mocks/` imports its own files by **relative** path. The `@services/*`, `@mocks/*`, and similar
aliases in `tsconfig.json` are for specs only: ng-packagr does not rewrite them when it bundles, so an alias in
shipped code still builds, but the published bundle imports `@services/...` and fails to resolve in every consumer.
The mocks reach the main package as `@angular-redux2/store`.

## Tests

Tests use **xJet**. Place a `*.spec.ts` file next to the code it covers, and assert the observable behavior of the unit.

```ts
import { get } from '@components/object.component';

describe('get', () => {
    test('should return undefined for a path that does not exist', () => {
        expect(get({ a: { b: 1 } }, [ 'a', 'c' ])).toBeUndefined();
    });
});
```

Cover edge cases: empty and missing paths, falsy values in state and payloads, and actions dispatched before the
store is configured.

## Documentation

- Update the TSDoc for any public API you change.
- Update the VitePress docs under `docs/src/` when behavior or the API changes, and add a bullet to
  `docs/src/release.md`.
- Run `pnpm lint:md` to keep Markdown clean, and `pnpm docs:build` to check for broken links.

## Versioning

The `version` in `package.json` stays `1.0.0-local`. Publishing a GitHub release runs the publish workflow, which sets
the version from the release tag before it builds, so tag `v6.0.0` publishes `6.0.0`.

angular-redux2 follows [Semantic Versioning](https://semver.org/): MAJOR for incompatible API changes, MINOR for backward-compatible features, and PATCH for backward-compatible fixes.

## License

By contributing, you agree that your contributions are licensed under the project's [Mozilla Public License 2.0](LICENSE).
