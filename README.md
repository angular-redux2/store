# angular-redux2/store
> Please note that **function names are changed** from the `@angular-redux/store` version (this is a new code source) and  need to adjust accordingly
>
> **like**: `select => Select`, `withsubstore => Substore`, `dispatch => Dispatch`<br>
> **Docs**: https://angular-redux2.github.io/store/modules/src.html

[![npm version](https://img.shields.io/npm/v/@angular-redux2/store.svg)](https://www.npmjs.com/package/@angular-redux2/store)
[![downloads per month](https://img.shields.io/npm/dm/@angular-redux2/store.svg)](https://www.npmjs.com/package/@angular-redux2/store)

## What is Redux?

Redux is a popular approach to managing state in applications. It emphasises:

- A single, immutable data store.
- One-way data flow.
- An approach to change based on pure functions and a stream of actions.

You can find lots of excellent documentation here: [Redux](http://redux.js.org/).

## What is @angular-redux2 ?

We provide a set of npm packages that help you integrate your redux store
into your Angular 2+ applications. Our approach helps you by bridging the gap
with some of Angular advanced features, including:

- Change processing with RxJS observables.
- Compile time optimizations with `NgModule` and Ahead-of-Time compilation.
- Integration with the Angular change detector.

## Getting Started

- I already know what Redux and RxJS are. [Give me the TL;DR](articles/quickstart.md).
- Take me to the [API docs](https://angular-redux2.github.io/store).

## Resources

- [Getting started with Redux](https://egghead.io/courses/getting-started-with-redux)
- [Awesome Redux: Community Resources](https://github.com/xgrommx/awesome-redux)

## Hacking on angular-redux/store

Want to hack on angular-redux2/store or any of the related packages? Feel free to do so, but please test your changes before making any PRs.

Here's how to do that:

1.  Write unit tests. You can check that they work by running
    `ng test`.
2.  Run the linter. If your editor doesn't do it automatically, do it
    manually with `ng lint`.
