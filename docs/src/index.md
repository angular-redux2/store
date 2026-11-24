---
layout: home
title: 'angular-redux2'
titleTemplate: 'Angular bindings for Redux'
hero:
  name: 'angular-redux2'
  text: 'Redux for Angular, built on signals'
  tagline: A Redux store whose state is an Angular signal, with typed slices, mutable drafts, and sub-stores scoped to a component.
  actions:
    - theme: brand
      text: Get Started
      link: ./guide
    - theme: alt
      text: Migrating from 5.x
      link: ./migration/decorators
    - theme: alt
      text: GitHub
      link: https://github.com/angular-redux2/store
  image:
    src: /logo.png
    alt: 'angular-redux2 logo'
features:
  - title: Signals built in
    icon: 📡
    details: 'The state is an Angular signal and every selection is a `computed`, so it works with templates, `computed`, `effect`, `linkedSignal`, OnPush, and zoneless apps, with no pipe, subscription, or decorator.'
  - title: Faster than 5.x
    icon: ⚡
    details: 'A dispatch sets one signal, and a selector runs only when something reads it. In the benchmarks, dispatches run ~500× faster than 5.x, and scenarios with 1,000 selections ~13-50× faster.'
  - title: Observables when you need them
    icon: 🌊
    details: '`select$` emits synchronously for every change, so RxJS pipelines see each value in order.'
  - title: Typed slices
    icon: 🧱
    details: '`createSlice` turns one handler per action into a reducer and typed action creators.'
  - title: Draft state
    icon: ✏️
    details: Mutate the state inside a slice or a `draft` reducer. Only the paths you touch are copied.
  - title: Sub-stores
    icon: 🌿
    details: '`injectSubstore` gives a component a store rooted at a path, which can follow a signal input.'
  - title: Testing mocks
    icon: 🧪
    details: '`provideMockNgRedux` swaps in a store whose state the test sets and whose dispatches it records.'
---
