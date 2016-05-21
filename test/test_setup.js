
// Set up testing environment to run like a browser in the command line
import jsdom from 'jsdom';
global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.window = global.document.defaultView;
global.navigator = global.window.navigator;
global.__test__ = true;
global.__DEV__ = false;
global.__OFFLINE__ = false;
global.__DEVELOPMENT__ = false;
global.__SERVER__ = false;
global.__CLIENT__ = true;
global.window.localStorage = {};

// Add the root project directory to the app module search path:
import appModulePath from 'app-module-path';
import path from 'path';
appModulePath.addPath(path.resolve(path.join(__dirname, '../src')));