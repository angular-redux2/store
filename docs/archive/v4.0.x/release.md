# Release Notes

::: warning 🗄️ Archived version
These are the notes for an archived version. See the [current release notes](/v6.0.x/release) for the supported line.
:::

What changed in the `v4.0.x` line of `@angular-redux2/store`, the first line of the package, a new codebase replacing
`@angular-redux/store`.

## v4.0.4

- **Changed**: The peers are looser: `redux` 4.1 and later, `broadcast-channel` 4.8 and later, and
  `redux-devtools-extension` is no longer required.
- **Fixed**: `deepCopy` is typed by its generic parameter rather than returning `any`.
- **Changed**: The license file is MIT.

## v4.0.0

The initial release.

- **Added**: [`NgRedux`](/store/ng-redux) with `configureStore`, `provideStore`, `select`, `dispatch`, and the static
  `NgRedux.store`, plus `NgReduxModule` and `DevToolsExtension`.
- **Added**: The [`@Select`, `@Select$`](/decorators/select), [`@Dispatch`](/decorators/dispatch), and
  [`@Substore`](/decorators/substore) decorators.
- **Added**: [Sub-stores](/store/sub-store) through `configureSubStore`.
- **Added**: [Class reducers](/reducers/class-reducers) with `@Action(type)` and `createReducerFromClass`.
- **Added**: [Tab sync](/advanced/sync) with `reduxSyncMiddleware`, and `deepCopy`.
- **Added**: [`@angular-redux2/store/testing`](/testing/mocks) with `MockNgRedux` and `MockNgReduxModule`.
- **Migration**: Coming from `@angular-redux/store`, the decorators are capitalized: `select` is `Select`, `dispatch` is
  `Dispatch`, and `WithSubStore` is `Substore`, which reads the path from `getBasePath()`.

## See also

- [Getting Started](/guide)
- [NgRedux](/store/ng-redux)
