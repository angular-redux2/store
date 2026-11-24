# Slices

`createSlice` turns one handler per action into a reducer and one typed action creator per handler.

```ts
import { createSlice } from '@angular-redux2/store';

interface TodoInterface {
    title: string;
    done: boolean;
}

export const todos = createSlice('todos', <Array<TodoInterface>> [], {
    add(state, title: string) {
        state.push({ title, done: false });
    },
    toggle(state, index: number) {
        state[index].done = !state[index].done;
    },
    clear() {
        return [];
    }
});

todos.actions.add('Write docs'); // { type: 'todos/add', payload: 'Write docs' }
todos.actions.clear();           // { type: 'todos/clear' }
```

```ts
createSlice<State, Handlers>(name: string, initialState: State, handlers: Handlers): SliceInterface<State, Handlers>
```

| Member    | Notes                                                                             |
|-----------|-----------------------------------------------------------------------------------|
| `name`    | The prefix of every action type, `name/handler`, and the key for a feature.       |
| `reducer` | Combine it into the root reducer, or pass the slice to `provideNgReduxFeature`.   |
| `actions` | One action creator per handler. The payload type comes from the second parameter. |

## Handlers

A handler receives a [draft](/reducers/draft-state) of the state and the payload. It mutates the draft, or returns a
new state. A handler without a second parameter gets an action creator that takes no argument, and TypeScript rejects
a missing or wrong payload.

The reducer finds the handler of an action with one lookup by its full type. Any other action returns the state as it
is, without creating a draft.

## Using a slice

```ts
const rootReducer = combineReducers({ todos: todos.reducer });

store.dispatch(todos.actions.add('Write docs'));
```

A lazy route can add the slice instead: `providers: [ provideNgReduxFeature(todos) ]`. See
[addReducer](/store/ng-redux#addreducer).

## createAction

```ts
createAction<Payload = void>(type: string): ActionCreatorType<Payload>
```

An action creator for one type, for an action that several reducers handle or that no slice owns:

```ts
const reset = createAction('RESET');
const add = createAction<number>('ADD');

reset(); // { type: 'RESET' }
add(0);  // { type: 'ADD', payload: 0 }
```

It keeps a falsy payload such as `0`, `false`, or `''`.

## See also

- [Draft state](/reducers/draft-state)
- [NgRedux](/store/ng-redux#addreducer)
- [Migrating from 5.x](/migration/decorators#class-reducers)
