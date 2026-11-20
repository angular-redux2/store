# Tab sync

`reduxSyncMiddleware` keeps the store in step across every open tab of the application. Each action is posted on a
[`BroadcastChannel`](https://github.com/pubkey/broadcast-channel) and dispatched again in the other tabs.

```ts
import { reduxSyncMiddleware } from '@angular-redux2/store';

ngRedux.configureStore(rootReducer, INITIAL_STATE, [
    reduxSyncMiddleware({ initState: true, blacklist: [ 'ROUTER_NAVIGATION' ] })
]);
```

## Options

| Option                   | Default              | Notes                                                         |
|--------------------------|----------------------|---------------------------------------------------------------|
| `channelName`            | `'redux_state_sync'` | The channel the tabs share.                                   |
| `initState`              | `false`              | Ask an open tab for its state on start and take it over.      |
| `whitelist`              | -                    | Only these action types are shared.                           |
| `blacklist`              | -                    | These action types are not shared.                            |
| `predicate`              | -                    | A function deciding per action; it wins over both lists.      |
| `prepareState`           | identity             | Transforms the state before it is sent to a new tab.          |
| `broadcastChannelOption` | `{}`                 | Passed to `broadcast-channel`: `type` and `webWorkerSupport`. |

`SyncComponent` is the class behind the middleware, and `ConfigSyncInterface` types the options.

## See also

- [NgRedux](/store/ng-redux#configurestore)
