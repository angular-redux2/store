# angular-redux2/store

Angular-redux2/store is a powerful library for building Angular applications with Redux.
Redux is a state management pattern that has become very popular in the JavaScript community for its simplicity and predictability.
It provides a single source of truth for your application's state and uses a unidirectional data flow to manage data changes.

Angular-redux2/store builds upon Redux to provide seamless integration with Angular.
It provides a set of services and decorators that make it easy to manage your application's state and bind it to your Angular components.

[![Discord](https://img.shields.io/discord/1050521693795405874?logo=Angular-redux2)](https://discord.gg/cSRtr4Wv)
[![npm version](https://img.shields.io/npm/v/@angular-redux2/store.svg)](https://www.npmjs.com/package/@angular-redux2/store)
[![downloads per month](https://img.shields.io/npm/dm/@angular-redux2/store.svg)](https://www.npmjs.com/package/@angular-redux2/store)

## Changes from @angular-redux/store

Please note that function names have been changed in this version of the library (as it is a new codebase).
You'll need to adjust accordingly when using it, e.g. select => Select, withsubstore => Substore, dispatch => Dispatch etc.

## Getting Started

- I already know what Redux and RxJS are. [Give me the TL;DR](markdown/quickstart.md).
- Take me to the [API docs](https://angular-redux2.github.io/store).
- [Select](markdown/select.md).
- [Dispatch](markdown/dispatch.md).
- [Reducer](markdown/reducer.md).
- [Sub store](markdown/sub-store.md).
- [Middleware](markdown/middleware.md).
- [Mocks](markdown/mock.md).

## Resources

- [Getting started with Redux](https://egghead.io/courses/getting-started-with-redux)
- [Awesome Redux: Community Resources](https://github.com/xgrommx/awesome-redux)

## Hacking on angular-redux/store

Want to hack on angular-redux2/store or any of the related packages? Feel free to do so, but please test your changes before making any PRs.
Here's how to do that:
1.  Write unit tests. You can check that they work by running `ng test`.
2.  Run the linter. If your editor doesn't do it automatically, do it manually with `ng lint`.
