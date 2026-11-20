/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Observable } from 'rxjs';

/**
 * Imports
 */

import '@angular/compiler';
import { toArray } from 'rxjs/operators';
import { lastValueFrom, map } from 'rxjs';
import { MockNgRedux } from '@mocks/services/ng-redux.service.mock';
import { TestBed, TestComponentRenderer } from '@angular/core/testing';
import { MockNgReduxModule } from '@mocks/modules/ng-redux.module.mock';
import { NgRedux, Dispatch, Select, Select$ } from '@angular-redux2/store';
import {
    ApplicationModule, ErrorHandler, Injectable, NgModule, inject, platformCore, provideZonelessChangeDetection, ɵINJECTOR_SCOPE
} from '@angular/core';

/**
 * Test environment without a DOM: only the injector is exercised here.
 */

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

@Injectable()
class TestComponent {
    @Select('foo') readonly obs$: Observable<number>;
    @Select$('bar', (obs$: any) => obs$.pipe(map((x: any) => 2 * x)))

    readonly barTimesTwo$: Observable<number>;
    readonly baz$: Observable<number>;
    readonly ngRedux = inject(NgRedux);

    constructor() {
        this.baz$ = this.ngRedux.select('baz');
    }

    @Dispatch
    test() {
        return {
            type: 'UPDATE'
        };
    }
}

describe('NgReduxMock angular component', () => {
    /**
     * Spy vars
     */

    let select: any;
    let dispatch: any;

    /**
     * Before each test
     */

    beforeEach(() => {
        MockNgRedux.reset();
        select = xJet.spyOn(MockNgRedux.store, 'select');
        dispatch = xJet.spyOn(MockNgRedux.store, 'dispatch');

        TestBed.configureTestingModule({
            imports: [ MockNgReduxModule ],
            providers: [ TestComponent ]
        });
    });

    afterEach(() => {
        xJet.restoreAllMocks();
        TestBed.resetTestingModule();
    });

    test('should call mock select', () => {
        const testComponent = TestBed.inject(TestComponent);

        testComponent.obs$.subscribe(xJet.fn());
        expect(select).toHaveBeenCalled();
    });

    test('should call mock dispatch', () => {
        const testComponent = TestBed.inject(TestComponent);

        testComponent.test();
        expect(dispatch).toHaveBeenCalled();
    });

    test('should reset stubs used by @select', async () => {
        const instance = TestBed.inject(TestComponent);

        const stub_foo = MockNgRedux.getSelectorStub('foo');
        stub_foo.next(1);
        stub_foo.next(2);
        stub_foo.complete();

        expect(await lastValueFrom(instance.obs$.pipe(toArray()))).toEqual([ 1, 2 ]);

        MockNgRedux.reset();

        // Reset should result in a new stub getting created.
        const stub1_foo = MockNgRedux.getSelectorStub('foo');
        expect(stub_foo === stub1_foo).toBe(false);

        stub1_foo.next(3);
        stub1_foo.complete();

        expect(await lastValueFrom(MockNgRedux.store.select('foo').pipe(toArray()))).toEqual([ 3 ]);
    });

    test('should reset stubs used by @select$', async () => {
        const instance = TestBed.inject(TestComponent);

        const stub_bar = MockNgRedux.getSelectorStub('bar');
        stub_bar.next(1);
        stub_bar.next(2);
        stub_bar.complete();

        expect(await lastValueFrom(instance.barTimesTwo$.pipe(toArray()))).toEqual([ 2, 4 ]);

        MockNgRedux.reset();

        // Reset should result in a new stub getting created.
        const stub2_bar = MockNgRedux.getSelectorStub('bar');
        expect(stub_bar === stub2_bar).toBe(false);

        stub2_bar.next(3);
        stub2_bar.complete();

        expect(await lastValueFrom(MockNgRedux.store.select('bar').pipe(toArray()))).toEqual([ 3 ]);
    });

    test('should reset stubs used by .select', async () => {
        const instance = TestBed.inject(TestComponent);

        const stub_baz = MockNgRedux.getSelectorStub('baz');
        stub_baz.next(1);
        stub_baz.next(2);
        stub_baz.complete();

        expect(await lastValueFrom(instance.baz$.pipe(toArray()))).toEqual([ 1, 2 ]);

        MockNgRedux.reset();

        // Reset should result in a new stub getting created.
        const stub2_baz = MockNgRedux.getSelectorStub('baz');
        expect(stub_baz === stub2_baz).toBe(false);

        stub2_baz.next(3);
        stub2_baz.complete();

        expect(await lastValueFrom(MockNgRedux.store.select('baz').pipe(toArray()))).toEqual([ 3 ]);
    });
});

describe('MockNgRedux', () => {
    beforeEach(() => {
        MockNgRedux.reset();
    });

    test('should get a selector stub and emit a value', () => {
        const selectorStub = MockNgRedux.getSelectorStub();
        selectorStub.next(5);

        selectorStub.subscribe(value => {
            expect(value).toEqual(5);
        });
    });

    test('should get a substore and emit a value', () => {
        const mockSubStore = MockNgRedux.getSubStore(<any>'path', <any>'to', <any>'substore');

        const selectorStub = mockSubStore.getSelectorStub('property');
        selectorStub.next(10);

        mockSubStore.select('property').subscribe(value => {
            expect(value).toEqual(10);
        });
    });

    test('should ignore replaceStore and keep serving the stubs', () => {
        const store = { getState: xJet.fn(), subscribe: xJet.fn(), dispatch: xJet.fn() };
        MockNgRedux.store.replaceStore(<any> store);
        const stub = MockNgRedux.getSelectorStub<unknown, number>('count');
        const values: Array<number> = [];
        MockNgRedux.store.select<number>('count').subscribe(value => values.push(value));

        stub.next(4);

        expect(store.subscribe).not.toHaveBeenCalled();
        expect(values).toEqual([ 4 ]);
    });

    test('should follow the values pushed into a selector stub with a signal', () => {
        const count = MockNgRedux.store.selectSignal<number>('count');

        expect(count()).toBeUndefined();

        MockNgRedux.getSelectorStub<unknown, number>('count').next(3);
        expect(count()).toBe(3);
    });

    test.each(
        { case: 'a parenthesized parameter', source: '(state) => state.routes.present' },
        { case: 'a bare parameter', source: 'state => state.routes.present' }
    )('should share one stub with the coverage-instrumented selector for $case (issue #9)', ({ source }) => {
        // The shape istanbul gives an arrow selector when tests run with coverage.
        const instrumented = new Function(
            'return state => {\n  cov_jv20rt6qg().f[5]++;\n  cov_jv20rt6qg().s[9]++;\n  return state.routes.present;\n}'
        )();
        const stub = MockNgRedux.getSelectorStub(<any> new Function(`return ${ source }`)());

        expect(MockNgRedux.store.getSelectorStub(instrumented)).toBe(stub);
    });
});
