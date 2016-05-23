// Set up testing environment to run like a browser in the command line
import jsdom from 'jsdom';
global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.window = global.document.defaultView;
global.navigator = global.window.navigator;
global.window.localStorage = {};

// Add the root project directory to the app module search path:
import appModulePath from 'app-module-path';
import path from 'path';
appModulePath.addPath(path.resolve(path.join(__dirname, '../src')));
appModulePath.addPath(path.resolve(path.join(__dirname, '../test')));
