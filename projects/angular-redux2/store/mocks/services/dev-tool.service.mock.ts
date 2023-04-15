/**
 * Imports third-party libraries
 */

import { Injectable } from '@angular/core';

/**
 * angular-redux2
 */

import { DevToolsExtension } from '../../src/public-api';

/**
 * MockDevToolsExtension
 */

@Injectable()
export class MockDevToolsExtension extends DevToolsExtension {}
