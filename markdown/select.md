# How to use `select` method
select method is a method of NgRedux service, which provides a way to select a slice of the state.
It returns an observable of the selected value, which will emit each time the value changes. It accepts two optional arguments:

* selector - a function, path or string that selects a slice of the state to be observed. It uses the resolver function to convert the selector to a function, which is used to select the value from the state. If no selector is provided, the observable will emit the whole state object.
* comparator - a function that determines whether two values are equal. If provided, it will be used to determine whether the emitted value has changed since the last emission.

Example:
```typescript
import { Component } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { Observable } from 'rxjs';

interface State {
  counter: number;
}

@Component({
  selector: 'app-counter',
  template: `
    <p>Counter: {{ counter$ | async }}</p>
    <button (click)="increment()">Increment</button>
  `
})
export class CounterComponent {
  counter$: Observable<number>;

  constructor(private ngRedux: NgRedux<State>) {
    this.counter$ = ngRedux.select('counter');
  }

  increment() {
    this.ngRedux.dispatch({ type: 'INCREMENT' });
  }
}
```

## Angular-redux2 select types
In Angular-redux, select is a method that retrieves a specific slice of the store state and returns it as an observable.
It accepts an optional selector function as its argument and returns an Observable of the selected state.
The selector function can be of three types:

* `PropertySelector`: A string representing the name of a property in the store state object. It selects only that property from the state object.
* `PathSelector`: An array of strings that represents a path to a property in the state object. It selects the value of the property at the given path.
* `FunctionSelector<RootState, State>`: A function that takes the whole store state object as input and returns the selected slice of the state object
  * {RootState} state - The root state object to select from.
  * {State} - The selected subset of the root state object.

The select method also accepts an optional `comparator` function as its second argument,
which can be used to compare the previous and current values of the selected slice of the store state object.

Here is an example usage of the `select` method with a `PropertySelector`:
```typescript
import { NgRedux } from '@angular-redux/store';

// Assume we have a store state object like this:
const storeState = {
  name: 'John',
  age: 30,
  address: {
    city: 'New York',
    state: 'NY'
  }
};

// We can select only the 'name' property from the store state object like this:
const name$ = ngRedux.select('name');

// The name$ observable will emit the value 'John' initially, and then emit again only if the value of the 'name' property in the store state object changes.
```

Here is an example usage of the `select` method with a `PathSelector`:
```typescript
import { NgRedux } from '@angular-redux/store';

// Assume we have a store state object like this:
const storeState = {
  name: 'John',
  age: 30,
  address: {
    city: 'New York',
    state: 'NY'
  }
};

// We can select only the 'city' property of the 'address' property from the store state object like this:
const city$ = ngRedux.select(['address', 'city']);

// The city$ observable will emit the value 'New York' initially, and then emit again only if the value of the 'city' property in the store state object changes.

```

Here is an example usage of the select method with a FunctionSelector:
```typescript
import { NgRedux } from '@angular-redux/store';

// Assume we have a store state object like this:
const storeState = {
  name: 'John',
  age: 30,
  address: {
    city: 'New York',
    state: 'NY'
  }
};

// We can select only the 'name' and 'age' properties from the store state object like this:
const nameAndAge$ = ngRedux.select((state) => ({ name: state.name, age: state.age }));

// The nameAndAge$ observable will emit the value { name: 'John', age: 30 } initially, and then emit again only if the value of the 'name' or 'age' property in the store state object changes.

```

> Note that the `FunctionSelector` is the most flexible of the three selector types and allows you to select any part of the store state object that you want.
> The `PropertySelector` and `PathSelector` are easier to use, but are more limited in what they can select.

# How to use `Select` and `Select$` decorators

`Select` and `Select$` decorators can be used to simplify the process of selecting a slice of the state and binding it to a property of a component or a directive.
They are similar to `select` method, but instead of returning an observable, they bind the selected value to a property.

## Select
The `Select` decorator is used to select an observable from the store and attach it to a decorated property.
Here's an example of how to use it:
```typescript
import { Select } from '@angular-redux2/store';

class SomeClass {
  @Select(['foo','bar']) foo$: Observable<string>
}
```

### selector
The `selector` parameter is a selector function, property name string, or property name path (array of strings/array indices) that locates the store data to be selected.
If the parameter is not provided, the decorator will use the name of the decorated property.

### comparator
The `comparator` parameter is an optional function that is used to determine if this selector has changed.
It takes two parameters, the old state and the new state, and should return a boolean value.
If the value is `true`, the selector will be considered changed, and the observable will emit a new value. If the value is `false`,
the selector will not be considered changed, and the observable will not emit a new value.

Here's an example of how to use the comparator parameter:
```typescript
import { Select } from '@angular-redux2/store';

class SomeClass {
  @Select(['foo','bar'], (oldState, newState) => oldState.foo.bar === newState.foo.bar) foo$: Observable<string>
}
```
In this example, the `comparator` function checks if the `foo.bar` property of the old and new state are the same.
If they are the same, the selector will not be considered changed, and the observable will not emit a new value.

## Select$
The `Select$` function is used to select an observable from the store using a path selector, and then transform that observable using a transformer function.
The transformed observable is then attached to the decorated property, and is run through distinctUntilChanged with an optional comparator function.

Here's an example of how to use the `Select$` function:
```typescript
import { Select$ } from 'angular-redux2/store';
import { debounceTime, map } from 'rxjs/operators';

export const debounceAndTriple = obs$ => obs$
  .pipe(
    debounceTime(300),
    map(x => 3 * x)
  );

class Foo {
  @Select$(['foo', 'bar'], debounceAndTriple)
  readonly debouncedFooBar$: Observable<number>;
}
```

In this example, we're selecting the value of `foo.bar` from the store using the path selector `['foo', 'bar']`.
We then pass the selected observable into our `debounceAndTriple` transformer function, which applies a 300ms debounce and triples the value of the observable.
Finally, the transformed observable is attached to the `debouncedFooBar$` property of the `Foo` class.

### comparator 
The `comparator` parameter is optional, and is used to determine if the selector has changed.
If a comparator function is provided, it will be used in the `distinctUntilChanged` operator to determine if the observable has changed since the last emission.

### transformer 
Note that the `transformer` parameter is a function that operates on observables instead of values, and should return an observable.
This allows you to compose multiple transformations on the selected observable before attaching it to the decorated property.
