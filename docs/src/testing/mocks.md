# Mocks

`@angular-redux2/store/mocks` replaces the store in unit tests. The test sets the state, and dispatches are recorded
instead of reaching a reducer.

```ts
import { TestBed } from '@angular/core/testing';
import { MockNgRedux, provideMockNgRedux } from '@angular-redux2/store/mocks';

let store: MockNgRedux<AppState>;

beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [ Counter ],
        providers: [ provideMockNgRedux<AppState>({ counter: 0, todos: [] }) ]
    });

    store = TestBed.inject(MockNgRedux<AppState>);
});
```

```ts
provideMockNgRedux<State>(initialState?: State): Array<Provider>
```

`provideMockNgRedux` provides one instance as both `NgRedux` and `MockNgRedux`. It returns plain providers, so it goes
in a `TestBed` or a component's `providers`. Without `initialState` the state starts as `undefined`. Outside Angular,
`new MockNgRedux<State>(initialState?)` creates one directly. The component injects `NgRedux` and gets
the mock, and the test injects `MockNgRedux` to control it.

## Setting the state

```ts
test('should show the counter', async () => {
    const fixture = TestBed.createComponent(Counter);

    store.patchState({ counter: 42 });
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('42');
});
```

The mock is a real `NgRedux`, so `injectSelect`, `select$`, and sub-stores follow the state that the test sets. That
includes the keys of feature reducers that a lazy route added with `provideNgReduxFeature`.

## Checking dispatches

```ts
test('should dispatch increment', () => {
    TestBed.createComponent(Counter).componentInstance.increment();

    expect(store.dispatched).toEqual([ counter.actions.increment() ]);
});
```

`dispatch` records the action and leaves the state alone, so a test checks what the component sent, not what a reducer
made of it. A sub-store dispatch is recorded too, with its route attached.

## API

| Member              | Notes                                                    |
|---------------------|----------------------------------------------------------|
| `dispatched`        | The actions dispatched since creation or the last reset. |
| `setState(state)`   | Replaces the whole state.                                |
| `patchState(patch)` | Merges top-level keys into the state.                    |
| `reset()`           | Clears `dispatched` and returns to the starting state.   |

## See also

- [NgRedux](/store/ng-redux)
- [Sub-stores](/store/sub-store)
