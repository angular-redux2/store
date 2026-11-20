---
layout: home
title: 'angular-redux2'
titleTemplate: 'Angular bindings for Redux'
hero:
  name: 'angular-redux2'
  text: 'Redux for Angular, without the boilerplate'
  tagline: An injectable store, selection and dispatch decorators, class reducers you can mutate safely, and sub-stores scoped to a component.
  actions:
    - theme: brand
      text: Get Started
      link: ./guide
    - theme: alt
      text: NgRedux
      link: ./store/ng-redux
    - theme: alt
      text: GitHub
      link: https://github.com/angular-redux2/store
  image:
    src: /logo.png
    alt: 'angular-redux2 logo'
features:
  - title: Injectable store
    icon: 💉
    details: '`NgRedux` is provided in root, wraps a Redux store, and exposes it as RxJS observables for the `async` pipe or as signals with `injectSelect`.'
  - title: Decorators
    icon: 🎯
    details: '`@Select` and `@Select$` bind a slice of state to a property, and `@Dispatch` sends whatever a method returns.'
  - title: Class reducers
    icon: 🧱
    details: 'Write a reducer as a class of `@Action` methods and get typed action creators from `ReducerActionsType<T>`.'
  - title: Draft state
    icon: ✏️
    details: Mutate `state` inside a reducer; only the paths you touch are copied, so unchanged branches keep their identity.
  - title: Sub-stores
    icon: 🌿
    details: Root a store at a path with its own reducer, from code or with `@Substore` on a component.
  - title: Testing mocks
    icon: 🧪
    details: '`MockNgReduxModule` swaps the store for one whose selections are subjects you drive from the test.'
---
