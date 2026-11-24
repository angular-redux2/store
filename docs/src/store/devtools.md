# DevTools

The `devTools` option connects the store to the [Redux DevTools](https://github.com/reduxjs/redux-devtools) browser
extension, in Firefox or Chrome:

```ts
import { isDevMode } from '@angular/core';
import { provideNgRedux } from '@angular-redux2/store';

provideNgRedux({
    reducer: rootReducer,
    devTools: isDevMode() && { name: 'my app', trace: true }
});
```

`true` connects it with the extension's defaults, and an object is passed to the extension as its
[options](https://github.com/reduxjs/redux-devtools/blob/main/extension/docs/API/Arguments.md). Dispatch an action
from the extension, jump to or skip any action, and import or export the history. The views follow, because every
change reaches the state signal.

The store reads the extension from `globalThis`, so nothing is connected when the extension is not installed or during
server-side rendering. It is safe to leave the option on.

Sub-store actions carry a serializable route, so the extension records and replays them like any other action.

## See also

- [NgRedux](/store/ng-redux)
- [Middleware](/store/middleware)
