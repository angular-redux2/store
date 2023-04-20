/**
 * Imports third-party libraries
 */

import { Injectable } from '@angular/core';

/**
 * angular-redux2
 */

import { DevToolsExtension } from '@angular-redux2/store';

/**
 * MockDevToolsExtension
 */

@Injectable()
export class MockDevToolsExtension extends DevToolsExtension {}
