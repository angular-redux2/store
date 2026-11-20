---
layout: home
title: 'angular-redux2'
titleTemplate: 'Angular bindings for Redux'
hero:
  name: 'angular-redux2'
  text: 'Redux for Angular, without the boilerplate'
  tagline: An injectable store, selection and dispatch decorators, class reducers, sub-stores, and state shared across browser tabs.
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
    details: '`NgRedux` wraps a Redux store and exposes it as RxJS observables that work with the `async` pipe.'
  - title: Decorators
    icon: 🎯
    details: '`@Select` and `@Select$` bind a slice of state to a property, and `@Dispatch` sends whatever a method returns.'
  - title: Class reducers
    icon: 🧱
    details: 'Map action types to methods with `@Action(type)` and build the reducer with `createReducerFromClass`.'
  - title: Sub-stores
    icon: 🌿
    details: Root a store at a path with its own reducer, from code or with `@Substore` on a component.
  - title: Tab sync
    icon: 🔄
    details: '`reduxSyncMiddleware` replays actions in every open tab over a `BroadcastChannel`.'
  - title: Testing mocks
    icon: 🧪
    details: '`MockNgReduxModule` swaps the store for one whose selections are subjects you drive from the test.'
---
