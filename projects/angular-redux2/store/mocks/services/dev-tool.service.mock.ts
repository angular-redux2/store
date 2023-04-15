/**
 * Imports third-party libraries
 */

import { Injectable } from '@angular/core';

/**
 * Angular-redux
 */

import { DevToolsExtension } from '../../src/public-api';

/**
 * MockDevToolsExtension
 */

@Injectable()
export class MockDevToolsExtension extends DevToolsExtension {}
