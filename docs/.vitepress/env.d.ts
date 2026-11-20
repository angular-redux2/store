/**
 * Shim for single-file components so the IDE can type `*.vue` imports.
 * VitePress/Vite handles the real resolution at build time.
 */

declare module '*.vue' {
    import type { DefineComponent } from 'vue';
    const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
    export default component;
}

/**
 * Shim for side effect CSS imports so the IDE stops flagging TS2882.
 * Vite handles the real resolution at build time.
 */

declare module '*.css';
