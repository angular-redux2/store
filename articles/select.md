# The Select Pattern

The select pattern allows you to get slices of your state as RxJS observables. These plug in very efficiently to
Angular's change detection mechanism and this is the preferred approach to accessing store data in Angular.

## The @Select decorator

The `@Select` decorator can be added to the property of any class or angular component/injectable. It will turn the
property into an observable which observes the Redux Store value which is selected by the decorator's parameter.

The decorator expects to receive a `string`, an array of `string`s, a `function` or no parameter at all.

- If a `string` is passed the `@Select` decorator will attempt to observe a store property whose name matches
  the `string`.
- If an array of strings is passed, the decorator will attempt to match that path through the store (similar
  to `immutableJS`'s `getIn`).
- If a `function` is passed the `@Select` decorator will attempt to use that function as a selector on the RxJS
  observable.
- If nothing is passed then the `@Select` decorator will attempt to use the name of the class property to find a
  matching value in the Redux store. Note that a utility is in place here where any $ characters will be ignored from
  the class property's name.

```typescript
// this selects `counter` from the store and attaches it to this property
// it uses the property name to select, and ignores the $ from it
@Select()
counter$;

// this selects `counter` from the store and attaches it to this property
@Select()
counter;

// this selects `counter` from the store and attaches it to this property
@Select('counter')
counterSelectedWithString;

// this selects `pathDemo.foo.bar` from the store and attaches it to this
// property.
@Select([ 'pathDemo', 'foo', 'bar' ])
pathSelection;

// this selects `counter` from the store and attaches it to this property
@Select(state => state.counter)
counterSelectedWithFunction;

// this selects `counter` from the store and multiples it by two
@Select(state => state.counter * 2)
counterSelectedWithFuntionAndMultipliedByTwo
:
Observable<any>;
```

## Select Without Decorators

If you like RxJS, but aren't comfortable with decorators, you can also make store selections using
the `ngRedux.select()` function.

```typescript
export class Counter {
    private count$: Observable<number>;

    constructor(private ngRedux: NgRedux<IAppState>) {
    }

    ngOnInit() {
        let { increment, decrement } = CounterActions;
        this.counter$ = this.ngRedux.select('counter');
    }

    incrementIfOdd = () =>
        this.ngRedux.dispatch(<any>CounterActions.incrementIfOdd());

    incrementAsync = () =>
        this.ngRedux.dispatch(<any>CounterActions.incrementAsync());
}
```

`ngRedux.select` can take a property name or a function which transforms a property. Since it's an observable, you can
also transform data using observable operators like `.map`, `.filter`, etc.

## The @Select$ decorator

The `@Select$` decorator works similar to `@Select`, however you are able to specify observable chains to execute on the
selected result.

```typescript
export const debounceAndTriple = obs$ => obs$.debounce(300).map(x => 3 * x);

class Foo {
    @Select$([ 'foo', 'bar' ], debounceAndTriple)
    readonly debouncedFooBar$: Observable<number>;
}
```
