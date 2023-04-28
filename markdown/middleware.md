# Redux middleware 
Redux-Middleware is a function that sits between the action creator and reducer in the Redux data flow process.
Its purpose is to intercept and process actions before they are sent to the reducers.
To use middleware, you must first define a middleware function that conforms to the Redux middleware API.
The middleware function is then added to the middleware chain using the `applyMiddleware` function provided by the `redux` package.
Here is an example of how to define and use middleware in an application:

```typescript
@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        NgReduxModule
    ]
})
export class StoreModule {
    constructor(ngRedux: NgRedux<IAppState>, devTools: DevToolsExtension) {
        let enhancer: Array<any> = [];
        
        // Define a middleware function
        const myMiddleware = store => next => action => {
            console.log('Dispatching action:', action);
            const result = next(action);
            console.log('New state:', store.getState());
            return result;
        };

        if (devTools.enhancer() && isDevMode())
            enhancer = [
                devTools.enhancer(),
                applyMiddleware(myMiddleware)
            ];
        
        ngRedux.configureStore(rootReducer, INITIAL_STATE, [], enhancer);
    }
}
```

In this example, the `myMiddleware` function is defined with three parameters: `store`, `next`, and `action`.
- `store` parameter provides access to the Redux store.
- `next` is a function that calls the next middleware in the chain (or the reducer, if it is the last middleware).
- `action` is the current action being dispatched.

The `myMiddleware` function logs the action to the console, calls the next middleware in the chain (or the reducer), 
logs the new state to the console, and returns the result.
The middleware function is then applied to the Redux store using the `applyMiddleware` function provided by the redux package.
This function *takes one or more middleware* functions as arguments and returns a store `enhancer` that applies the middleware to the store's dispatch function.

> Note that middleware can also modify the `action` before it is sent to the reducer or dispatch additional actions.
> To modify the `action`, simply modify the `action` parameter before calling `next(action)`.
> To dispatch additional actions, call `store.dispatch` within the middleware function.

# Reducer middleware
Angular-redux2 Middleware is a function that sits between reducers in the `Angular-redux2/store` data flow process.
Its purpose is to intercept and process actions reducers.
To use middleware, you must first define a middleware function that conforms to the `Angular-redux2/store` middleware API.
Here is an example of how to define and use middleware in an application:

```typescript
@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        NgReduxModule
    ]
})
export class StoreModule {
    constructor(ngRedux: NgRedux<IAppState>, devTools: DevToolsExtension) {
        const middleware1 = (state: any, action: any, next: any) => {
            console.log('old state: ', state);
            new_state = next(state, action);
            console.log('new state: ', new_state);

            return new_state;
        };

        const middleware2 = (state: any, action: any, next: any) => {
            // `state` is a state from middleware1
            console.log('Middleware 2');
            // change the state fron next reducer
            state = { ...state, name: 'xxx' };
            
            return next(state, action);
        };

        let enhancer: Array<any> = [];
        let middleware: Array<Middleware> = [
            middleware1,
            middleware2
        ];

        if (devTools.enhancer() && isDevMode())
            enhancer = [
                devTools.enhancer(),
            ];

        ngRedux.configureStore(rootReducer, INITIAL_STATE, middleware, enhancer);
    }
}
```
In this example, the `Middleware` function is defined with three parameters: `store`, `next`, and `action`.
- `store` store object from preview reducer.
- `next` is a function that calls the next reducer in the chain.
- `action` is the current action from preview reducer.

> Note that middleware can also modify the `action` or `state` before it is sent to the next reducer.
> To modify the `action` or `state`, simply modify the `action` parameter before calling `next(state, action)`.
> The root reducer is the last member of the middleware chain.
