/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { UnknownAction } from 'redux';
import type { DraftContextInterface } from './interfaces/draft-component.interface';

/**
 * Imports
 */

import { types } from 'util';
import { createDraft, draft, finalize } from './draft.component';

/**
 * Tests
 */

const JOINED = new Date(Date.UTC(2024, 0, 1));

function createState(): any {
    return {
        counter: 0,
        profile: { name: 'Bob', nickname: null, joined: JOINED },
        tags: [ 'a' ],
        items: [{ id: 1, done: false }, { id: 2, done: true }],
        other: { deep: { value: 1 } }
    };
}

function apply(recipe: (state: any, action: UnknownAction) => any, state = createState()): any {
    return draft(undefined, recipe)(state, { type: 'TEST' });
}

function createContext(): DraftContextInterface {
    return { nodes: new Map(), results: new Map(), search: true };
}

describe('createDraft', () => {
    test('should register the proxy in the context', () => {
        const context = createContext();
        const proxy = createDraft({ a: 1 }, context);

        expect(context.nodes.get(proxy)?.base).toEqual({ a: 1 });
    });

    test('should write to the copy and leave the base untouched', () => {
        const base = { count: 0 };
        const proxy = createDraft(base, createContext());

        proxy['count'] = 1;

        expect(proxy['count']).toBe(1);
        expect(base.count).toBe(0);
    });

    test('should return the same child draft on every read', () => {
        const proxy = createDraft({ user: { name: 'Ada' } }, createContext());

        expect(proxy['user']).toBe(proxy['user']);
        expect(types.isProxy(proxy['user'])).toBe(true);
    });

    test('should record the key of an assignment and flag a new key', () => {
        const context = createContext();
        const proxy = createDraft({ a: 1 }, context);
        const node = context.nodes.get(proxy)!;

        proxy['a'] = 2;
        expect(node.keys.has('a')).toBe(true);
        expect(node.modified).toBe(false);

        proxy['b'] = 3;
        expect(node.modified).toBe(true);
    });
});

describe('finalize', () => {
    test('should return the base of a draft that the recipe did not change', () => {
        const base = { user: { name: 'Ada' } };
        const context = createContext();
        const proxy = createDraft(base, context);
        void proxy['user'];

        expect(finalize(proxy, context)).toBe(base);
    });

    test('should leave a new plain value unsearched when search is off', () => {
        const context = createContext();
        const proxy = createDraft({ a: { b: 1 } }, context);
        const holder = { child: proxy['a'] };

        context.search = false;

        expect(types.isProxy(finalize(holder, context) && holder.child)).toBe(true);
    });

    test('should resolve a draft inside a new plain value when search is on', () => {
        const base = { a: { b: 1 } };
        const context = createContext();
        const proxy = createDraft(base, context);
        const holder = finalize({ child: proxy['a'] }, context);

        expect((<any> holder).child).toBe(base.a);
    });

    test('should return a value that is not plain as it is', () => {
        const date = new Date();

        expect(finalize(date, createContext())).toBe(date);
    });
});

describe('draft', () => {
    describe('the state it returns', () => {
        test('should return the same state when the recipe only reads', () => {
            const state = createState();
            const next = apply(draft => {
                void draft.profile.name;
                void draft.items[0].done;
            }, state);

            expect(next).toBe(state);
        });

        test('should return the same state when the recipe assigns the values it already holds', () => {
            const state = createState();
            const next = apply(draft => {
                draft.counter = 0;
                draft.profile.name = 'Bob';
            }, state);

            expect(next).toBe(state);
        });

        test('should return the same state when the recipe sets a value back to what it was', () => {
            const state = createState();
            const next = apply(draft => {
                draft.counter = 5;
                draft.counter = 0;
                draft.profile.name = 'Robert';
                draft.profile.name = 'Bob';
            }, state);

            expect(next).toBe(state);
        });

        test('should return a new state when the recipe adds a key holding undefined', () => {
            const state = createState();
            const next = apply(draft => {
                draft.extra = undefined;
            }, state);

            expect(next).not.toBe(state);
            expect('extra' in next).toBe(true);
        });

        test('should resolve the items that splice moves and share them', () => {
            const state = createState();
            const next = apply(draft => {
                draft.items.splice(0, 1);
            }, state);

            expect(next.items).toEqual([{ id: 2, done: true }]);
            expect(next.items[0]).toBe(state.items[1]);
            expect(types.isProxy(next.items[0])).toBe(false);
        });

        test('should drop the items that a shorter length cuts off', () => {
            const next = apply(draft => {
                void draft.items[1].id;
                draft.items.length = 1;
            });

            expect(next.items).toEqual([{ id: 1, done: false }]);
            expect(next.items).toHaveLength(1);
        });

        test('should copy only the path to a write and share every other branch', () => {
            const state = createState();
            const next = apply(draft => {
                draft.profile.name = 'Robert';
            }, state);

            expect(next).not.toBe(state);
            expect(next.profile).not.toBe(state.profile);
            expect(next.profile.name).toBe('Robert');
            expect(next.tags).toBe(state.tags);
            expect(next.other).toBe(state.other);
        });

        test('should copy an array that the recipe pushes onto and share its items', () => {
            const state = createState();
            const next = apply(draft => {
                draft.items.push({ id: 3, done: false });
            }, state);

            expect(next.items).toEqual([ ...state.items, { id: 3, done: false }]);
            expect(next.items).not.toBe(state.items);
            expect(next.items[0]).toBe(state.items[0]);
        });

        test('should leave the state it received as it was', () => {
            const state = createState();
            apply(draft => {
                draft.profile.name = 'Robert';
                draft.tags.push('b');
                delete draft.other;
            }, state);

            expect(state).toEqual(createState());
        });

        test('should keep the key order of a written object', () => {
            const next = apply(draft => {
                draft.counter = 1;
            });

            expect(Object.keys(next)).toEqual([ 'counter', 'profile', 'tags', 'items', 'other' ]);
        });

        test('should drop a deleted key', () => {
            const next = apply(draft => {
                delete draft.other;
            });

            expect('other' in next).toBe(false);
        });

        test('should leave no proxy in the returned state', () => {
            const next = apply(draft => {
                draft.items[0].done = true;
            });

            expect(types.isProxy(next)).toBe(false);
            expect(types.isProxy(next.items)).toBe(false);
            expect(types.isProxy(next.items[0])).toBe(false);
        });

        test('should draft a frozen state without an error', () => {
            const state = Object.freeze({ list: Object.freeze([ 1 ]) });
            const next = apply(draft => {
                draft.list.push(2);
            }, state);

            expect(next).toEqual({ list: [ 1, 2 ] });
        });
    });

    describe('the values it returns', () => {
        test('should use a new value that the recipe returns', () => {
            expect(apply(() => ({ fresh: true }))).toEqual({ fresh: true });
        });

        test('should resolve drafts inside a returned copy', () => {
            const state = createState();
            const next = apply(draft => ({ ...draft, counter: draft.counter + 1 }), state);

            expect(next.counter).toBe(1);
            expect(next.profile).toBe(state.profile);
            expect(types.isProxy(next.profile)).toBe(false);
        });

        test('should resolve a returned child draft to its original when it is unchanged', () => {
            const state = createState();

            expect(apply(draft => draft.profile, state)).toBe(state.profile);
        });

        test('should resolve drafts inside a filtered array', () => {
            const state = createState();
            const next = apply(draft => {
                draft.items = draft.items.filter((item: any) => item.done);
            }, state);

            expect(next.items).toEqual([{ id: 2, done: true }]);
            expect(next.items[0]).toBe(state.items[1]);
        });

        test('should resolve a draft moved to another key', () => {
            const next = apply(draft => {
                draft.copy = draft.profile;
                draft.copy.name = 'Robert';
            });

            expect(next.copy).toEqual({ name: 'Robert', nickname: null, joined: JOINED });
            expect(next.copy).toBe(next.profile);
            expect(types.isProxy(next.copy)).toBe(false);
        });

        test('should pass a frozen returned value through without an error', () => {
            const initial = Object.freeze({ counter: 0, nested: Object.freeze({ value: 1 }) });

            expect(apply(() => initial)).toBe(initial);
        });

        test('should not walk a payload assigned while the root is the only draft', () => {
            let reads = 0;
            const payload = {
                get value(): number {
                    reads++;

                    return 1;
                }
            };
            const next = apply(draft => {
                draft.payload = payload;
            });

            expect(next.payload).toBe(payload);
            expect(reads).toBe(0);
        });

        test('should still resolve a draft inside a payload once a child draft exists', () => {
            const next = apply(draft => {
                draft.wrapper = { inner: draft.profile };
                draft.wrapper.inner.name = 'Robert';
            });

            expect(next.wrapper.inner).toEqual({ name: 'Robert', nickname: null, joined: next.profile.joined });
            expect(types.isProxy(next.wrapper.inner)).toBe(false);
        });
    });

    describe('the values it does not draft', () => {
        test('should read a null property without throwing (issue #34)', () => {
            let read: unknown = 'unset';
            apply(draft => {
                read = draft.profile.nickname;
            });

            expect(read).toBeNull();
        });

        test('should hand a Date to the recipe unproxied, so its methods work (PR #31)', () => {
            let year = 0;
            const next = apply(draft => {
                year = draft.profile.joined.getUTCFullYear();
                draft.counter = 1;
            });

            expect(year).toBe(2024);
            expect(next.profile.joined).toBe(JOINED);
        });

        test('should pass a primitive state to the recipe as it is', () => {
            const reducer = draft(0, (state: number) => state + 1);

            expect(reducer(4, { type: 'TEST' })).toBe(5);
        });

        test('should keep a primitive state when the recipe returns nothing', () => {
            const reducer = draft<number>(0, () => undefined);

            expect(reducer(4, { type: 'TEST' })).toBe(4);
        });
    });

    test('should start from the initial state when it receives undefined', () => {
        const reducer = draft({ count: 0 }, (state: { count: number }) => {
            state.count++;
        });

        expect(reducer(undefined, { type: 'TEST' })).toEqual({ count: 1 });
    });
});
