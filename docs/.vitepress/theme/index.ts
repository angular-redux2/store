/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { VNode } from '@vue/runtime-core';
import type { Awaitable, Theme } from 'vitepress';

/**
 * Styles
 */

import './style.css';

/**
 * Imports
 */

import { h } from 'vue';
import DefaultTheme from 'vitepress/theme';
import VersionSwitcher from '@viteplus/versions/components/version-switcher.component.vue';

export default {
    extends: DefaultTheme,
    Layout: (): VNode => {
        return h(DefaultTheme.Layout, null, {
        });
    },
    enhanceApp({ app }): Awaitable<void> {
        app.component('VersionSwitcher', VersionSwitcher);
    }
} satisfies Theme;
