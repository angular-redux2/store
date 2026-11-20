# DevTools

`DevToolsExtension` connects the store to the [Redux DevTools](https://github.com/reduxjs/redux-devtools) browser
extension, in Firefox or Chrome. With `provideNgRedux`, turn it on with the `devTools` option:

```ts
import { isDevMode } from '@angular/core';
import { provideNgRedux } from '@angular-redux2/store';

export const appConfig: ApplicationConfig = {
    providers: [
        provideNgRedux({
            reducer: rootReducer,
            initialState: INITIAL_STATE,
            devTools: isDevMode() && { name: 'my app', trace: true }
        })
    ]
};
```

`true` connects it with the extension's defaults, and an object is passed to the extension as its
[options](https://github.com/reduxjs/redux-devtools/blob/main/extension/docs/API/Arguments.md). Every editing feature
is on by default: dispatch an action from the extension, jump to or skip any action, reorder them, and import or
export the history. Nothing is connected when the extension is not installed.

## Without provideNgRedux

The service is provided in the root injector, so it can also be injected and its enhancer passed to
[`configureStore`](/store/ng-redux#configurestore) directly:

| Method               | Notes                                                                                           |
|----------------------|-------------------------------------------------------------------------------------------------|
| `isEnabled()`        | `true` when the extension is installed in this browser.                                         |
| `enhancer(options?)` | The extension's `StoreEnhancer`, `options` passed through to it; `null` when it is not enabled. |

```ts
const enhancer = isDevMode() ? inject(DevToolsExtension).enhancer() : null;
ngRedux.configureStore(rootReducer, INITIAL_STATE, [], enhancer ? [ enhancer ] : []);
```

::: warning Check before passing it on
`enhancer()` is typed `StoreEnhancer | null` and returns `null` without the extension. A `null` in the enhancer list
breaks `configureStore`, so keep it out, as above. `provideNgRedux` does this for you.
:::

The enhancer also keeps the views in step while you travel through history in the extension: a state change it causes
from outside the Angular zone re-enters the zone, so a zone-based app renders it. A zoneless app renders it through the
`async` pipe and signals.

The extension is looked up on `window`, so on the server `isEnabled()` is `false`.

## See also

- [NgRedux](/store/ng-redux#configurestore)
- [Getting Started](/guide)
