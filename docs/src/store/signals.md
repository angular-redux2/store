# Signals

Signals are built into the store, not added on top. `NgRedux.state` is an Angular signal that the store updates after
every dispatch, and every selection is a `computed` over it. Anything that works with a signal works with a selection:
templates, `computed`, `effect`, `linkedSignal`, `input()`, OnPush, and zoneless change detection.

```ts
const store = inject(NgRedux<AppState>);

store.state();                              // the whole state, tracked
const count = store.select(state => state.counter);
count();                                    // 0
```

Nothing has to be subscribed or cleaned up. A selection is garbage-collected with the component that holds it.

## In a template

Call the selection. No `async` pipe, no subscription:

```ts
@Component({
    selector: 'app-counter',
    template: '<button (click)="increment()">{{ count() }}</button>'
})
export class Counter {
    private readonly store = inject(NgRedux<AppState>);
    readonly count = injectSelect((state: AppState) => state.counter);

    increment(): void {
        this.store.dispatch(counter.actions.increment());
    }
}
```

A template that reads a signal is marked for check when the signal changes, so this works the same with
`ChangeDetectionStrategy.OnPush` and with `provideZonelessChangeDetection()`. No `markForCheck`, no Zone.

## Combining selections

A selection is a signal, so `computed` combines it with other selections, sub-store selections, and the component's
own signals:

```ts
export class Cart {
    private readonly store = inject(NgRedux<AppState>);

    readonly quantity = signal(1);
    readonly price = this.store.select(state => state.product.price);
    readonly discount = this.store.select(state => state.user.discount);

    readonly total = computed(() => this.price() * this.quantity() * (1 - this.discount()));
}
```

`total` updates when the store changes either value, or when `quantity` is set.

## Selecting with an input

A selector can read other signals, such as a signal input. The selection then follows both the store and the input:

```ts
export class UserName {
    readonly userId = input.required<string>();

    readonly name = injectSelect((state: AppState) => state.users[this.userId()].name);
}
```

Use this to read one entry. To also dispatch to that entry with its own reducer, use a
[sub-store](/store/sub-store#in-a-component).

## Side effects with effect

`effect` runs when a selection it reads changes, such as saving a setting:

```ts
export class Settings {
    private readonly store = inject(NgRedux<AppState>);
    private readonly theme = this.store.select(state => state.settings.theme);

    constructor() {
        effect(() => localStorage.setItem('theme', this.theme()));
    }
}
```

`getState()` reads the state without tracking it, so an effect can read other values without rerunning when they
change. `state()` and selections are tracked:

```ts
effect(() => {
    const theme = this.theme();                     // tracked: reruns when the theme changes
    const user = this.store.getState().user.id;     // not tracked
    analytics.track('theme', { theme, user });
});
```

An effect reacts to state. To react to an action, such as loading data after `LOAD_USER`, use Redux
[middleware](/store/middleware).

## An editable copy with linkedSignal

`linkedSignal` gives a component a local copy of store state that it can edit, such as a form draft. The copy resets
when the store value changes:

```ts
export class EditName {
    private readonly store = inject(NgRedux<AppState>);
    private readonly saved = this.store.select(state => state.user.name);

    readonly name = linkedSignal(() => this.saved());     // writable

    save(): void {
        this.store.dispatch(user.actions.rename(this.name()));
    }
}
```

The form binds to `name`, typing changes only the local copy, and a new name from the store replaces it.

## Outside a component

`store.select` needs no injection context. A service, a route guard, or a test can call it anywhere:

```ts
@Injectable({ providedIn: 'root' })
export class Auth {
    private readonly store = inject(NgRedux<AppState>);

    readonly loggedIn = this.store.select(state => state.auth.loggedIn);

    canActivate(): boolean {
        return this.loggedIn();
    }
}
```

Only `injectSelect` and `injectSubstore` need an injection context, because they call `inject`.

## Signals and observables

You do not need `toSignal`: a selection is already a signal. For RxJS, use [`select$`](/store/ng-redux#select-observable)
rather than `toObservable(store.select(...))`. `toObservable` emits on Angular's schedule, after change detection, so
it can skip values when several dispatches happen at once. `select$` emits synchronously after each dispatch.

| You need                                    | Use                                   |
|---------------------------------------------|---------------------------------------|
| A value in a template or a `computed`       | `select` / `injectSelect`             |
| To react to a state change                  | `effect` over a selection             |
| An editable copy of store state             | `linkedSignal` over a selection       |
| Every value in order, debounce, `switchMap` | `select$`                             |
| To react to an action                       | Redux [middleware](/store/middleware) |

## Why it is fast

The state is one signal, so a dispatch costs one `signal.set`, whatever the number of selections. A selection runs its
selector only when something reads it after a change, so a selection that no rendered template reads costs nothing,
and many dispatches before the next render run each selector once. See [Benchmarks](/benchmarks).

## See also

- [Selectors](/store/selectors)
- [NgRedux](/store/ng-redux)
- [Sub-stores](/store/sub-store)
- [Benchmarks](/benchmarks)
