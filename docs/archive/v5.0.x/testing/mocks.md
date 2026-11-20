# Mocks

`@angular-redux2/store/mocks` replaces the store in unit tests. Selections become subjects the test pushes values into,
and dispatches are recorded instead of reaching a reducer.

```ts
import { TestBed } from '@angular/core/testing';
import { MockNgRedux, MockNgReduxModule } from '@angular-redux2/store/mocks';

beforeEach(() => {
    MockNgRedux.reset();

    TestBed.configureTestingModule({
        declarations: [ CounterComponent ],
        imports: [ MockNgReduxModule ]
    });
});
```

`MockNgReduxModule` provides `MockNgRedux` in place of `NgRedux`, and a `DevToolsExtension` that is never enabled.
`MockNgRedux.reset()` drops every stub, so each test starts clean.

::: warning Reset first
A component builds its [`@Select`](/decorators/select#how-the-selection-is-resolved) selections once and keeps them.
Call `reset()` before creating the component; a reset afterwards does not reach the selections it already has.
:::

::: warning One store at a time
Every `MockNgRedux` registers itself as `NgRedux.store` when created, and that includes the mocks behind
`getSubStore` and behind a `@Substore` component. Decorated members read after one is created select from it, not
from the root mock. Create sub-store mocks after the root selections a test relies on have been read.
:::

## Selector stubs

`getSelectorStub` returns the `Subject` behind a selection. Push values into it and the component sees them:

```ts
test('should show the counter', () => {
    const fixture = TestBed.createComponent(CounterComponent);
    const counter = MockNgRedux.getSelectorStub<AppStateInterface, number>('counter');

    counter.next(42);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('42');
});
```

A stub is keyed by its selector and comparator, so pass the same selector the component uses. With no selector, it is
the stub for the whole state.

## Sub-store stubs

`getSubStore` returns the mock for a sub-store. Each argument is one path, so nested sub-stores are reached in order:

```ts
const bob = MockNgRedux.getSubStore([ 'users', 'bob' ]);
bob.getSelectorStub('name').next('Bob Smith');
```

## Dispatches

`MockNgRedux.store.dispatch` returns the action and does nothing else. Spy on it to assert what a component sent:

```ts
test('should dispatch INCREMENT', () => {
    const dispatch = spyOn(MockNgRedux.store, 'dispatch');
    const fixture = TestBed.createComponent(CounterComponent);

    fixture.componentInstance.increment();

    expect(dispatch).toHaveBeenCalledWith({ type: 'INCREMENT' });
});
```

`getState` returns `{}`; spy on it the same way to hand a component a state.

## API

| Member                                                | Notes                                                 |
|-------------------------------------------------------|-------------------------------------------------------|
| `MockNgRedux.store`                                   | The mock instance the module provides.                |
| `MockNgRedux.getSelectorStub(selector?, comparator?)` | The subject behind that selection.                    |
| `MockNgRedux.getSubStore(...paths)`                   | The mock for a sub-store, one path per nesting level. |
| `MockNgRedux.reset()`                                 | Drops every selector and sub-store stub.              |

## See also

- [@Select](/decorators/select)
- [Sub-stores](/store/sub-store)
