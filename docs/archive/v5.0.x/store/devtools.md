# DevTools

`DevToolsExtension` connects the store to the [Redux DevTools](https://github.com/reduxjs/redux-devtools) browser
extension. `NgReduxModule` provides it.

```ts
import { isDevMode, NgModule } from '@angular/core';
import { DevToolsExtension, NgRedux, NgReduxModule } from '@angular-redux2/store';

@NgModule({
    imports: [ NgReduxModule ]
})
export class StoreModule {
    constructor(ngRedux: NgRedux<AppStateInterface>, devTools: DevToolsExtension) {
        const enhancers = isDevMode() && devTools.isEnabled() ? [ devTools.enhancer() ] : [];

        ngRedux.configureStore(rootReducer, INITIAL_STATE, [], enhancers);
    }
}
```

| Method               | Notes                                                                                          |
|----------------------|------------------------------------------------------------------------------------------------|
| `isEnabled()`        | `true` when the extension is installed in this browser.                                        |
| `enhancer(options?)` | The extension's store enhancer, `options` passed through to it. `null` when it is not enabled. |

::: warning Check before passing it on
`enhancer()` returns `null` without the extension, and a `null` in the enhancer list breaks `configureStore`. Test
`isEnabled()` first, as above.
:::

The enhancer also keeps the views in step while you travel through history in the extension: a state change it causes
from outside the Angular zone triggers change detection.

The extension is looked up on `window`, so on the server `isEnabled()` is `false`.

## See also

- [NgRedux](/store/ng-redux#configurestore)
- [Getting Started](/guide)
