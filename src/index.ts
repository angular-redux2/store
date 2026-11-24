/*
 * Public API Surface of @angular-redux2/store
 */

// Modules
export * from './modules/ng-redux/ng-redux.module';

// Components
export { draft } from './components/draft.component';
export { freezeReducer } from './components/freeze.component';
export { createAction, createSlice } from './components/slice.component';

// Services
export { NgRedux } from './services/ng-redux.service';

// Interfaces
export type * from './interfaces/store.interface';
export type * from './interfaces/slice.interface';
export type * from './interfaces/provider.interface';
