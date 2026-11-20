/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { xJetConfig } from '@remotex-labs/xjet';

/**
 * Imports
 */

import { version } from 'process';

/**
 * Config
 */

export default {
    parallel: 1,
    build: {
        target: [ `node${ version.slice(1) }` ],
        platform: 'node',
        packages: 'bundle'
    }
} as xJetConfig;
