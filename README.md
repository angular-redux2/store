# angular-redux3/store

Angular-redux3/store is a powerful library for building Angular applications with Redux.
Redux is a state management pattern that has become very popular in the JavaScript community for its simplicity and predictability.
It provides a single source of truth for your application's state and uses a unidirectional data flow to manage data changes.

Angular-redux3/store builds upon Redux to provide seamless integration with Angular.
It provides a set of services and decorators that make it easy to manage your application's state and bind it to your Angular components.

[![npm version](https://img.shields.io/npm/v/@angular-redux3/store.svg)](https://www.npmjs.com/package/@angular-redux3/store)
[![downloads per month](https://img.shields.io/npm/dm/@angular-redux3/store.svg)](https://www.npmjs.com/package/@angular-redux3/store)

## support 
We currently provide support for `Angular` versions `14` and `15`, as well as `Redux` version `4.2.1` and `RxJS` version `7.8.0`.
In the near future, our support will be extended to include backwards compatibility with `RxJS` version `7.5.0`,
and support for `Angular` versions `12` and `13`, while continuing to support `Redux` version `4.2.1`.

## Changes from @angular-redux/store

Please note that function names have been changed in this version of the library (as it is a new codebase).
You'll need to adjust accordingly when using it, e.g. select => Select,
with substore => Substore, dispatch => Dispatch etc.

## Getting Started

- I already know what Redux and RxJS are. [Give me the TL;DR](markdown/quickstart.md).
- Take me to the [API docs](https://angular-redux3.github.io/store).
- [Select](markdown/select.md).
- [Dispatch](markdown/dispatch.md).
- [Reducer](markdown/reducer.md).
- [Sub store](markdown/sub-store.md).
- [Middleware](markdown/middleware.md).
- [Mocks](markdown/mock.md).

## Plugins

- [Undo](https://github.com/angular-redux2/undo).
- [Sync](https://github.com/angular-redux2/sync).

## Resources

- [Getting started with Redux](https://egghead.io/courses/getting-started-with-redux)
- [Awesome Redux: Community Resources](https://github.com/xgrommx/awesome-redux)

## Hacking on angular-redux/store

Want to hack on angular-redux3/store or any of the related packages? Feel free to do so, but please test your changes before making any PRs.
Here's how to do that:
1.  Write unit tests. You can check that they work by running `ng test`.
2.  Run the linter. If your editor doesn't do it automatically, do it manually with `ng lint`.
