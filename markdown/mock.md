# MockNgRedux 
`MockNgRedux` is a utility class that makes it easier to write unit tests for Angular applications that rely on the `angular-redux2/store`.
It provides a way to create mock sub-stores and selector stubs,
allowing you to simulate different scenarios and verify the behavior of your components and services.

In your test file, you can set up the `MockNgRedux` service before each test using the `beforeEach` hook.
For example:

```typescript
import { TestBed } from '@angular/core/testing';
import { MockNgReduxModule, MockNgRedux } from '@angular-redux3/store/mocks';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AppComponent],
            imports: [MockNgReduxModule],
        });
        MockNgRedux.reset();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });
});
```

In the above example, we are importing the `AppComponent` and the `MockNgRedux`. 
We are also creating a new Angular test bed using the `TestBed.configureTestingModule()` method,
which allows us to define the component that we want to test, as well as any providers that the component relies on.

We are then calling the `MockNgRedux.reset()` method to clear any previously configured stubs.

## Configuration
Now that we have set up the `MockNgRedux`, we can configure it for our test.
We can use the `getSelectorStub` and `getSubStore` methods to create stubs for selectors and sub stores that our component relies on.

For example, if our component has a selector that returns a boolean value,
we can create a selector stub like this:

```typescript
it('should call the selector and update the view', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    const selectorStub = MockNgRedux.getSelectorStub();
    selectorStub.next('The value is true.');
    selectorStub.complete();

    fixture.detectChanges();

    const textContent = fixture.nativeElement.textContent.trim();
    expect(textContent).toEqual('The value is true.');
});
```

In the above example, we are calling the `MockNgRedux.getSelectorStub()` method to create a selector stub.
We are then pushing a value onto the stub using the `next()` method, and completing the stub using the `complete()` method.

We can then call the `fixture.detectChanges()` method to trigger change detection in our component,
and check that the view has been updated correctly.

If our component relies on a sub store, we can create a sub store stub like this:
```typescript
it('should call the sub store and update the view', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    const subStoreStub = MockNgRedux.getSubStore('path', 'to', 'substore');
    const selectorStub = subStoreStub.getSelectorStub();
    selectorStub.next('The value is some value.');
    selectorStub.complete();

    fixture.detectChanges();

    const textContent = fixture.nativeElement.textContent.trim();
    expect(textContent).toEqual('The value is some value.');
});
```

In the above example, we are calling the `MockNgRedux.getSubStore()` method to create a sub store stub.
We are then creating a selector stub for the sub store using the `getSelectorStub`

## Spying on Dispatch
Once you have your test set up, you can use the `MockNgRedux` to mock the store and spy on the `dispatch` method.
Here's an example:

```typescript
it('should dispatch a specific action when a button is clicked', () => {
    const spy = spyOn(MockNgRedux.store, 'dispatch');

    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    
    const button = fixture.debugElement.query(By.css('#undo'));
    button.triggerEventHandler('click', null);

    expect(spy).toHaveBeenCalledWith({ type: 'MY_ACTION' });
});
```

## Return state from `getState()` 
```typescript
it('shold get full state', () => {
    const state = {
        name: 'test',
        value: 'test'
    };
    
    const spy = spyOn(MockNgRedux.store, 'getState').and.returnValue(
        state
    )

    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();

    expect(fixture.getState()).toEqual(state);
});
```



