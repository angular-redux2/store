# Benchmarks

Version 6 against 5.0.2, the last 5.x release, on the same reducers and the same state. Lower is better.

| Scenario                                                  |     5.0.2 |     6.x | Faster |
|-----------------------------------------------------------|----------:|--------:|-------:|
| 1,000 dispatches, no selections                           | 287.00 ms | 0.56 ms |  ~500× |
| 1,000 selections, 100 dispatches, all read after each one |  54.00 ms | 4.00 ms |   ~13× |
| 1,000 selections, 100 dispatches, read every 10th         |  54.00 ms | 1.10 ms |   ~50× |
| Create, read once, and drop 1,000 selections              |   0.50 ms | 0.30 ms |  ~1.7× |

Each number is the median of 15 runs after 3 warm-up runs. Repeated runs gave the same picture, with the 6.x
milliseconds varying by up to about 15%.

## What makes the difference

**Dispatch.** 5.x ran every reducer on a proxy of the state, and after any change it walked the whole state tree to
strip the proxies out again. That cost grows with the size of the state, not with what changed. Version 6 runs a plain
Redux reducer and sets one signal, so the cost of a dispatch depends on what the reducer changes, not on the size of
the state.
Proxies are now opt-in, through [`draft`](/reducers/draft-state) and [slices](/reducers/slices), and copy only the
paths a reducer touches.

**Selections.** In 5.x every selection was an observable subscribed to the store, so every dispatch ran every
selector, read or not. In version 6 a selection is a `computed`, which runs its selector only when something reads it
after a change. When several dispatches land before the next render, which the third row models, each selector runs
once instead of once per dispatch. 5.x cannot batch, so its second and third rows are the same.

**Creating selections.** Both are cheap. Version 6 skips the RxJS pipe and the subscription.

## How it was measured

- **State:** `{ counter, todos, users }` with 1,000 todos and 1,000 users, each user with a nested address.
- **Reducers:** the same plain immutable reducers, combined with `combineReducers`, in both versions.
- **Dispatches:** `INCREMENT` changes the counter, and `TOGGLE` replaces one todo.
- **Selections:** each one selects `state.todos[i].done`. In 5.x it is `select(...).subscribe(...)`. In 6.x it is
  `select(...)`, read by calling it, the way a template reads it.
- **No Zone** in either version, so the numbers measure the store, not change detection.
- **Correctness:** both versions end in the same state after the same sequence of actions.

**Environment:** Node 24.19, Apple M5 Pro, 64 GB. 6.x on Angular 22.3, Redux 5.0.1, RxJS 7.8.2. 5.0.2 on Angular 17,
Redux 4.2.1, RxJS 7.8, its supported range.

These are store-level numbers in Node, without rendering. A real application spends most of its frame in rendering, so
the difference on screen is smaller than the table. The ratio that matters most there is the dispatch cost, because
5.x paid it on every action, and it grew with the state.

## See also

- [Signals](/store/signals)
- [Draft state](/reducers/draft-state)
- [Design decisions](/design)
