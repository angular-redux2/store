/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { UnknownAction, StoreEnhancer } from 'redux';

/**
 * Imports
 */

import '@angular/compiler';
import { NgRedux } from '@services/ng-redux.service';
import { provideNgRedux } from '@modules/ng-redux.provider';
import { DevToolsExtension } from '@services/dev-tool.service';
import { TestBed, TestComponentRenderer } from '@angular/core/testing';
import {
    ApplicationInitStatus, ApplicationModule, ErrorHandler, NgModule, platformCore, provideZonelessChangeDetection, ɵINJECTOR_SCOPE
} from '@angular/core';

/**
 * Tests
 */

interface StateInterface {
    counter: number;
    lastAction: string;
}

const INITIAL_STATE: StateInterface = { counter: 0, lastAction: '' };

function reducer(state: StateInterface = INITIAL_STATE, action: UnknownAction): StateInterface {
    return action.type === 'INCREMENT' ? { ...state, counter: state.counter + 1 } : state;
}

@NgModule({
    imports: [ ApplicationModule ],
    providers: [
        provideZonelessChangeDetection(),
        { provide: ɵINJECTOR_SCOPE, useValue: 'root' },
        { provide: TestComponentRenderer, useValue: new TestComponentRenderer() },
        { provide: ErrorHandler, useClass: ErrorHandler }
    ]
})
class TestEnvironmentModule {
}

TestBed.initTestEnvironment(TestEnvironmentModule, platformCore());

describe('provideNgRedux', () => {
    async function start(config: Parameters<typeof provideNgRedux<StateInterface>>[0]): Promise<NgRedux<StateInterface>> {
        TestBed.configureTestingModule({
            providers: [
                // Built by hand: the specs compile the library in JIT mode, without constructor metadata.
                { provide: NgRedux, useFactory: () => new NgRedux() },
                { provide: DevToolsExtension, useFactory: () => new DevToolsExtension(<any> undefined, <any> undefined) },
                provideNgRedux(config)
            ]
        });
        await TestBed.inject(ApplicationInitStatus).donePromise;

        return TestBed.inject(NgRedux<StateInterface>);
    }

    afterEach(() => {
        xJet.restoreAllMocks();
        TestBed.resetTestingModule();
    });

    test('should configure the store before the application starts', async () => {
        const ngRedux = await start({ reducer, initialState: INITIAL_STATE });
        ngRedux.dispatch({ type: 'INCREMENT' });

        expect(ngRedux.getState()).toEqual({ counter: 1, lastAction: '' });
    });

    test('should run the reducer middleware', async () => {
        const ngRedux = await start({
            reducer,
            initialState: INITIAL_STATE,
            middleware: [ (state, action, next) => next({ ...state, lastAction: action.type }) ]
        });
        ngRedux.dispatch({ type: 'INCREMENT' });

        expect(ngRedux.getState()).toEqual({ counter: 1, lastAction: 'INCREMENT' });
    });

    test('should connect no DevTools enhancer when devTools is off', async () => {
        const enhancer = xJet.spyOn(DevToolsExtension.prototype, 'enhancer');
        await start({ reducer, initialState: INITIAL_STATE });

        expect(enhancer).not.toHaveBeenCalled();
    });

    test('should pass the DevTools options and add the enhancer after the configured ones', async () => {
        const calls: Array<string> = [];
        const trace = (name: string): StoreEnhancer => createStore => (...args: Array<any>) => {
            calls.push(name);

            return (<any> createStore)(...args);
        };

        const enhancer = xJet.spyOn(DevToolsExtension.prototype, 'enhancer').mockReturnValue(trace('devtools'));
        await start({ reducer, initialState: INITIAL_STATE, enhancers: [ trace('custom') ], devTools: { name: 'app' } });

        expect(enhancer).toHaveBeenCalledWith({ name: 'app' });
        expect(calls).toEqual([ 'custom', 'devtools' ]);
    });

    test('should leave the enhancers alone when the extension is not installed', async () => {
        const ngRedux = await start({ reducer, initialState: INITIAL_STATE, devTools: true });

        expect(ngRedux.getState()).toEqual(INITIAL_STATE);
    });
});
