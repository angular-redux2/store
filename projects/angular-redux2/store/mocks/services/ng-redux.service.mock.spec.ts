/**
 * Import third-party libraries
 */

import { map } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

/**
 * Import third-party types
 */

import { Observable } from 'rxjs';

/**
 * angular-redux2
 */

import { NgRedux } from '@angular-redux3/store';
import { Dispatch, Select, Select$ } from '@angular-redux3/store';

/**
 * Mocks
 */

import { MockNgRedux } from './ng-redux.service.mock';
import { MockNgReduxModule } from '../ng-redux.module.mock';

@Component({
    template: 'whatever',
    selector: 'test-component'
})
class TestComponent {
    @Select('foo') readonly obs$: Observable<number>;
    @Select$('bar', (obs$: any) => obs$.pipe(map((x: any) => 2 * x)))

    readonly barTimesTwo$: Observable<number>;
    readonly baz$: Observable<number>;

    constructor(public ngRedux: NgRedux<any>) {
        this.baz$ = ngRedux.select('baz');
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
        select = jest.spyOn(MockNgRedux.store, 'select');
        dispatch = jest.spyOn(MockNgRedux.store, 'dispatch');

        TestBed.configureTestingModule({
            declarations: [ TestComponent ],
            imports: [ MockNgReduxModule ],
        }).compileComponents();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test('should call mock select', () => {
        const testComponent = TestBed.createComponent(TestComponent).componentInstance;

        testComponent.obs$.subscribe(jest.fn());
        expect(select).toBeCalled();
    });

    test('should call mock dispatch', () => {
        const testComponent = TestBed.createComponent(TestComponent).componentInstance;

        testComponent.test();
        expect(dispatch).toBeCalled();
    });

    test('should reset stubs used by @select', (done) => {
        const instance = TestBed.createComponent(TestComponent).componentInstance;

        const stub_foo = MockNgRedux.getSelectorStub('foo');
        stub_foo.next(1);
        stub_foo.next(2);
        stub_foo.complete();

        instance.obs$.pipe(toArray()).subscribe((values: number[]) => {
            expect(values).toEqual([ 1, 2 ]);
            done();
        });

        MockNgRedux.reset();

        // Reset should result in a new stub getting created.
        const stub1_foo = MockNgRedux.getSelectorStub('foo');
        expect(stub_foo === stub1_foo).toBe(false);

        stub1_foo.next(3);
        stub1_foo.complete();

        instance.obs$.pipe(toArray()).subscribe((values: number[]) => {
            expect(values).toEqual([ 3 ]);
            done();
        });
    });

    test('should reset stubs used by @select$', (done) => {
        const instance = TestBed.createComponent(TestComponent).debugElement
            .componentInstance;

        const stub_bar = MockNgRedux.getSelectorStub('bar');
        stub_bar.next(1);
        stub_bar.next(2);
        stub_bar.complete();

        instance.barTimesTwo$.pipe(toArray()).subscribe((values: number[]) => {
            expect(values).toEqual([ 2, 4 ]);
            done();
        });

        MockNgRedux.reset();

        // Reset should result in a new stub getting created.
        const stub2_bar = MockNgRedux.getSelectorStub('bar');
        expect(stub_bar === stub2_bar).toBe(false);

        stub2_bar.next(3);
        stub2_bar.complete();

        instance.obs$.pipe(toArray()).subscribe((values: number[]) => {
            expect(values).toEqual([ 6 ]);
            done();
        });
    });

    test('should reset stubs used by .select', (done) => {
        const instance = TestBed.createComponent(TestComponent).debugElement
            .componentInstance;

        const stub_baz = MockNgRedux.getSelectorStub('baz');
        stub_baz.next(1);
        stub_baz.next(2);
        stub_baz.complete();

        instance.baz$.pipe(toArray()).subscribe((values: number[]) => {
            expect(values).toEqual([ 1, 2 ]);
            done();
        });

        MockNgRedux.reset();

        // Reset should result in a new stub getting created.
        const stub2_baz = MockNgRedux.getSelectorStub('baz');
        expect(stub_baz === stub2_baz).toBe(false);

        stub2_baz.next(3);
        stub2_baz.complete();

        instance.obs$.pipe(toArray()).subscribe((values: number[]) => {
            expect(values).toEqual([ 3 ]);
            done();
        });
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
});
