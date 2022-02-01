# Fractal Stores

`@angular-redux2/store` supports sub-store's.
 A sub-store expose the same interface as the main Redux store (`dispatch`, `select`, etc.), but is rooted at a particular path in your global state.
In particular, this is useful for Elm-inspired 'fractal components': Components that have instance-specific access to Redux features.

For example, imagine your store looked like this:

```json
{
  users: {
    bob: {
      name: 'Bob Smith',
      occupation: 'Programmer',
      loc: 1023,
    },
    alice: {
      name: 'Alice Jones',
      occupation: 'DevOps Specialist',
      loc: 2314,
    }
  }
}
```

It would be nice to have a 'UserComponent' that could be instanciated for both Alice and Bob and operate independently on the two relevant parts of the store.
We can do this by creating sub-stores whose 'base paths' point to Alice and Bob's portions of the store:

```typescript
interface IUser {
    name: string;
    occupation: string;
    loc: number;
}

export const userComponentReducer = (state, action) =>
    action.type === 'ADD_LOC'
        ? { ...state, loc: state.loc + action.payload }
        : state;

@Component({
    selector: 'user',
    template: `
    <p>name: {{ name$ | async }}</p>
    <p>occupation: {{ occupation$ | async }}</p>
    <p>lines of code: {{ loc$ | async }}</p>
    <button (click)="addCode(100)">Add 100 lines of code</button>
  `,
})
export class UserComponent implements NgOnInit {
    @Input() userId: String;

    loc$: Observable<number>;
    name$: Observable<string>;
    occupation$: Observable<string>;
    
    private subStore: ObservableStore<IUser>;

    constructor(private ngRedux: NgRedux) {
    }

    onInit() {
        // The reducer passed here will affect state under `users.${userID}`
        // in the top-level store.
        this.subStore = this.ngRedux.configureSubStore(
            [ 'users', this.userId ],
            userComponentReducer,
        );

        // Substore selectons are scoped to the base path used to configure
        // the substore.
        this.name$ = this.subStore.select('name');
        this.occupation$ = this.subStore.select('occupation');
        this.loc$ = this.subStore.select((s: IUser) => s.loc || 0);
    }

    addCode(numLines: number) {
        // Dispatching from the sub-store ensures this component instance's
        // subStore only sees the 'ADD_LOC' action.
        this.subStore.dispatch({ type: 'ADD_LOC', payload: numLines });
    }
}
```

```html
<user [userId]="alice"></user> <user [userId]="bob"></user>
```

This way, we use the same type of component for both Alice and Bob, but they act independently of each other in different parts of the global store state.
You can even nest fractal stores by calling `configureSubStore` on an existing sub-store.

## What about @Select, @Select$, @Dispatch ?

the decorator interface has been expanded to support fractal stores as well.

Tag your component or service with the `@WithSubStore` decorator, and a sub-store will be configured behind the scenes; instance of that class's `@Select`, `@Select$`, and `@Dispatch` decorators will now operate on that sub-store instead of the root store. Reworking the example above with the decorator interface looks like this:

```typescript
export const userComponentReducer = (state: any, action: any) =>
    action.type === 'ADD_LOC'
        ? { ...state, loc: state.loc + action.payload }
        : state;

export const defaultToZero = (obs$: Observable<number>) => obs$.pipe(map(n => n || 0));

@Component({
    selector: 'app-test',
    templateUrl: './test.component.html',
    styleUrls: [ './test.component.scss' ]
})
@Substore(userComponentReducer) // <- 
export class UserComponent  implements OnInit {
    @Input() userId: String;

    // The substore will be created from the return value of this function.
    getBasePath(): Array<string | String> | null {
        return this.userId ? ['users', this.userId] : null;
    }

    // These selections are now scoped to the portion of the store rooted
    // at ['users', userId];
    @Select('name') readonly name$: Observable<string>;
    @Select('occupation') readonly occupation$: Observable<string>;
    @Select$('loc', defaultToZero)

    readonly loc$: Observable<number>;

    // These dispatches will be scoped to the substore as well, as if you
    // had called ngRedux.configureSubStore(...).dispatch(numLines).
    @Dispatch
    addCode(numLines: any) {
        // Dispatching from the sub-store ensures this component instance's
        // subStore only sees the 'ADD_LOC' action.
        return { type: 'ADD_LOC', payload: numLines };
    }
}
```