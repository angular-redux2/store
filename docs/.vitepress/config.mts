/**
 * Imports
 */

import { defineVersionedConfig } from '@viteplus/versions';

/**
 * Doc config
 */

export default defineVersionedConfig({
    title: 'angular-redux2',
    base: '/store/',
    description: 'Angular bindings for Redux: an injectable store, selection decorators, class reducers, and sub-stores',
    head: [
        [ 'link', { rel: 'icon', type: 'image/png', href: '/store/logo.png' }],
        [ 'meta', { name: 'theme-color', content: '#764abc' }],
        [ 'script', { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-XQ325E8BEX' }],
        [
            'script', {},
            'window.dataLayer = window.dataLayer || [];function gtag(){ dataLayer.push(arguments); }gtag(\'js\', new Date());gtag(\'config\', \'G-XQ325E8BEX\');'
        ]
    ],
    versionsConfig: {
        current: 'v6.0.x',
        versionSwitcher: false
    },
    themeConfig: {
        logo: '/logo.png',

        search: {
            provider: 'local'
        },

        nav: {
            root: [
                { text: 'Home', link: '/' },
                { text: 'Guide', link: '/guide' },
                { text: 'Example', link: '/example' },
                {
                    text: 'Store',
                    items: [
                        { text: 'NgRedux', link: '/store/ng-redux' },
                        { text: 'Selectors', link: '/store/selectors' },
                        { text: 'Sub-stores', link: '/store/sub-store' },
                        { text: 'Middleware', link: '/store/middleware' },
                        { text: 'DevTools', link: '/store/devtools' }
                    ]
                },
                {
                    text: 'Decorators',
                    items: [
                        { text: '@Select', link: '/decorators/select' },
                        { text: '@Dispatch', link: '/decorators/dispatch' },
                        { text: '@Substore', link: '/decorators/substore' }
                    ]
                },
                {
                    text: 'Reducers',
                    items: [
                        { text: 'Class reducers', link: '/reducers/class-reducers' },
                        { text: 'Draft state', link: '/reducers/draft-state' }
                    ]
                },
                { text: 'Testing', link: '/testing/mocks' },
                { component: 'VersionSwitcher' }
            ],
            'v5.0.x': [
                { text: 'Home', link: '/' },
                { text: 'Guide', link: '/guide' },
                {
                    text: 'Store',
                    items: [
                        { text: 'NgRedux', link: '/store/ng-redux' },
                        { text: 'Selectors', link: '/store/selectors' },
                        { text: 'Sub-stores', link: '/store/sub-store' },
                        { text: 'Middleware', link: '/store/middleware' },
                        { text: 'DevTools', link: '/store/devtools' }
                    ]
                },
                {
                    text: 'Decorators',
                    items: [
                        { text: '@Select', link: '/decorators/select' },
                        { text: '@Dispatch', link: '/decorators/dispatch' },
                        { text: '@Substore', link: '/decorators/substore' }
                    ]
                },
                {
                    text: 'Reducers',
                    items: [
                        { text: 'Class reducers', link: '/reducers/class-reducers' },
                        { text: 'Draft state', link: '/reducers/draft-state' }
                    ]
                },
                { text: 'Testing', link: '/testing/mocks' },
                { component: 'VersionSwitcher' }
            ],
            'v4.0.x': [
                { text: 'Home', link: '/' },
                { text: 'Guide', link: '/guide' },
                {
                    text: 'Store',
                    items: [
                        { text: 'NgRedux', link: '/store/ng-redux' },
                        { text: 'Selectors', link: '/store/selectors' },
                        { text: 'Sub-stores', link: '/store/sub-store' }
                    ]
                },
                {
                    text: 'Decorators',
                    items: [
                        { text: '@Select', link: '/decorators/select' },
                        { text: '@Dispatch', link: '/decorators/dispatch' },
                        { text: '@Substore', link: '/decorators/substore' }
                    ]
                },
                { text: 'Reducers', link: '/reducers/class-reducers' },
                { text: 'Tab sync', link: '/advanced/sync' },
                { text: 'Testing', link: '/testing/mocks' },
                { component: 'VersionSwitcher' }
            ]
        },

        sidebar: {
            root: [
                { text: 'Getting Started', link: '/guide' },
                { text: 'Example', link: '/example' },
                { text: 'Release Notes', link: '/release' },
                {
                    text: 'Store',
                    collapsed: false,
                    items: [
                        { text: 'NgRedux', link: '/store/ng-redux' },
                        { text: 'Selectors', link: '/store/selectors' },
                        { text: 'Sub-stores', link: '/store/sub-store' },
                        { text: 'Middleware', link: '/store/middleware' },
                        { text: 'DevTools', link: '/store/devtools' }
                    ]
                },
                {
                    text: 'Decorators',
                    collapsed: false,
                    items: [
                        { text: '@Select', link: '/decorators/select' },
                        { text: '@Dispatch', link: '/decorators/dispatch' },
                        { text: '@Substore', link: '/decorators/substore' }
                    ]
                },
                {
                    text: 'Reducers',
                    collapsed: false,
                    items: [
                        { text: 'Class reducers', link: '/reducers/class-reducers' },
                        { text: 'Draft state', link: '/reducers/draft-state' }
                    ]
                },
                {
                    text: 'Testing',
                    collapsed: false,
                    items: [{ text: 'Mocks', link: '/testing/mocks' }]
                }
            ],
            'v5.0.x': [
                { text: 'Getting Started', link: '/guide' },
                { text: 'Release Notes', link: '/release' },
                {
                    text: 'Store',
                    collapsed: false,
                    items: [
                        { text: 'NgRedux', link: '/store/ng-redux' },
                        { text: 'Selectors', link: '/store/selectors' },
                        { text: 'Sub-stores', link: '/store/sub-store' },
                        { text: 'Middleware', link: '/store/middleware' },
                        { text: 'DevTools', link: '/store/devtools' }
                    ]
                },
                {
                    text: 'Decorators',
                    collapsed: false,
                    items: [
                        { text: '@Select', link: '/decorators/select' },
                        { text: '@Dispatch', link: '/decorators/dispatch' },
                        { text: '@Substore', link: '/decorators/substore' }
                    ]
                },
                {
                    text: 'Reducers',
                    collapsed: false,
                    items: [
                        { text: 'Class reducers', link: '/reducers/class-reducers' },
                        { text: 'Draft state', link: '/reducers/draft-state' }
                    ]
                },
                {
                    text: 'Testing',
                    collapsed: false,
                    items: [{ text: 'Mocks', link: '/testing/mocks' }]
                }
            ],
            'v4.0.x': [
                { text: 'Getting Started', link: '/guide' },
                { text: 'Release Notes', link: '/release' },
                {
                    text: 'Store',
                    collapsed: false,
                    items: [
                        { text: 'NgRedux', link: '/store/ng-redux' },
                        { text: 'Selectors', link: '/store/selectors' },
                        { text: 'Sub-stores', link: '/store/sub-store' }
                    ]
                },
                {
                    text: 'Decorators',
                    collapsed: false,
                    items: [
                        { text: '@Select', link: '/decorators/select' },
                        { text: '@Dispatch', link: '/decorators/dispatch' },
                        { text: '@Substore', link: '/decorators/substore' }
                    ]
                },
                {
                    text: 'Reducers',
                    collapsed: false,
                    items: [{ text: 'Class reducers', link: '/reducers/class-reducers' }]
                },
                {
                    text: 'Advanced',
                    collapsed: false,
                    items: [{ text: 'Tab sync', link: '/advanced/sync' }]
                },
                {
                    text: 'Testing',
                    collapsed: false,
                    items: [{ text: 'Mocks', link: '/testing/mocks' }]
                }
            ]
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/angular-redux2/store' },
            { icon: 'npm', link: 'https://www.npmjs.com/package/@angular-redux2/store' },
            { icon: 'discord', link: 'https://discord.com/invite/7BnsAqst6W' }
        ],

        docFooter: {
            prev: true,
            next: true
        },
        footer: {
            message: 'Released under the Mozilla Public License 2.0',
            copyright: `Copyright © ${ new Date().getFullYear() } @angular-redux2/store Contributors`
        }
    }
});
