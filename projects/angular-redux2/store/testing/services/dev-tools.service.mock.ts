/**
 * Imports third-party libraries
 * todo fix
 */

import { Injectable } from '@angular/core';

/**
 * Import angular-redux2
 */

import { DevToolsExtension } from '@angular-redux2/store';

/**
 * MockDevToolsExtension
 */

@Injectable()
export class MockDevToolsExtension extends DevToolsExtension {}
