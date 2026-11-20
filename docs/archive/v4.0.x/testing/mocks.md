# Mocks

`@angular-redux2/store/testing` replaces the store in unit tests.

```ts
import { TestBed } from '@angular/core/testing';
import { MockNgRedux, MockNgReduxModule } from '@angular-redux2/store/testing';

beforeEach(() => {
    MockNgRedux.reset();

    TestBed.configureTestingModule({
        declarations: [ CounterComponent ],
        imports: [ MockNgReduxModule ]
    });
});

it('should show the counter', () => {
    const fixture = TestBed.createComponent(CounterComponent);
    MockNgRedux.getSelectorStub('count').next(42);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('42');
});
```

| Member                                                | Notes                                                 |
|-------------------------------------------------------|-------------------------------------------------------|
| `MockNgRedux.getSelectorStub(selector?, comparator?)` | The subject behind that selection.                    |
| `MockNgRedux.getSubStore(...paths)`                   | The mock for a sub-store, one path per nesting level. |
| `MockNgRedux.reset()`                                 | Drops every selector and sub-store stub.              |

## See also

- [@Select](/decorators/select)
