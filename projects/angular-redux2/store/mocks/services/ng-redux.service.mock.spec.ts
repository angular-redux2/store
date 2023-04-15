/**
 * Import third-party library
 */

import { map } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

/**
 * Import third-party types
 */

import type { Observable } from 'rxjs';

/**
 * angular-redux2
 */

import { NgRedux } from '../../src/services/ng-redux.service';
import { Dispatch } from '../../src/decorators/dispatch.decorator';
import { Select, Select$ } from '../../src/decorators/select.decorator';

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
