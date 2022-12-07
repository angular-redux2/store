/**
 * Imports third-party libraries
 */

import { Observable } from 'rxjs';
import { Component } from '@angular/core';
import { map, toArray } from 'rxjs/operators';
import { TestBed } from '@angular/core/testing';

/**
 * Import angular-redux2
 */

import { Dispatch, NgRedux, Select, Select$ } from '@angular-redux2/store';

/**
 * Mocks
 */

import { MockNgRedux } from './ng-redux.service.mock';
import { MockNgReduxModule } from "../ng-redux.module.mock";

/**
 * Mock component
 */

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

/**
 * NgReduxMock spec
 */

describe('NgReduxMock', () => {

    /**
     * Spy vars
     */

    let select: any, dispatch: any;

    /**
     * Before each test
     */

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ TestComponent ],
            imports: [ MockNgReduxModule ],
        }).compileComponents();

        MockNgRedux.reset();
        select = jest.spyOn(MockNgRedux.store, 'select');
        dispatch = jest.spyOn(MockNgRedux.store, 'dispatch');
    });

    /**
     * After each test
     */

    afterAll(() => {
        jest.restoreAllMocks();
    });

    test('should call mock select', () => {
        const testComponent = TestBed.createComponent(TestComponent).componentInstance;

        testComponent.obs$.subscribe(() => {
        });
        expect(select).toBeCalled();
    });

    test('should call mock dispatch', () => {
        const testComponent = TestBed.createComponent(TestComponent).componentInstance;

        testComponent.test();
        expect(dispatch).toBeCalled();
    });

    test('should reset stubs used by @select', (done) => {
        const instance = TestBed.createComponent(TestComponent).componentInstance;

        const stub1 = MockNgRedux.getSelectorStub('foo');
        stub1.next(1);
        stub1.next(2);
        stub1.complete();

        instance.obs$.pipe(toArray()).subscribe((values: number[]) => {
            expect(values).toEqual([ 1, 2 ]);
            done();
        });

        MockNgRedux.reset();

        // Reset should result in a new stub getting created.
        const stub2 = MockNgRedux.getSelectorStub('foo');
        expect(stub1 === stub2).toBe(false);

        stub2.next(3);
        stub2.complete();

        instance.obs$.pipe(toArray()).subscribe((values: number[]) => {
            expect(values).toEqual([ 3 ]);
            done();
        });
    });

    test('should reset stubs used by @select$', (done) => {
        const instance = TestBed.createComponent(TestComponent).debugElement
            .componentInstance;

        const stub1 = MockNgRedux.getSelectorStub('bar');
        stub1.next(1);
        stub1.next(2);
        stub1.complete();

        instance.barTimesTwo$.pipe(toArray()).subscribe((values: number[]) => {
            expect(values).toEqual([ 2, 4 ]);
            done();
        });

        MockNgRedux.reset();

        // Reset should result in a new stub getting created.
        const stub2 = MockNgRedux.getSelectorStub('bar');
        expect(stub1 === stub2).toBe(false);

        stub2.next(3);
        stub2.complete();

        instance.obs$.pipe(toArray()).subscribe((values: number[]) => {
            expect(values).toEqual([ 6 ]);
            done();
        });
    });

    test('should reset stubs used by .select', (done) => {
        const instance = TestBed.createComponent(TestComponent).debugElement
            .componentInstance;

        const stub1 = MockNgRedux.getSelectorStub('baz');
        stub1.next(1);
        stub1.next(2);
        stub1.complete();

        instance.baz$.pipe(toArray()).subscribe((values: number[]) => {
            expect(values).toEqual([ 1, 2 ]);
            done();
        });

        MockNgRedux.reset();

        // Reset should result in a new stub getting created.
        const stub2 = MockNgRedux.getSelectorStub('baz');
        expect(stub1 === stub2).toBe(false);

        stub2.next(3);
        stub2.complete();

        instance.obs$.pipe(toArray()).subscribe((values: number[]) => {
            expect(values).toEqual([ 3 ]);
            done();
        });
    });
});
