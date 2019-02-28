'use strict';

var app = require('app');
var Menu = require('menu');
var MenuItem = require('menu-item');
var BrowserWindow = require('browser-window');
var crashReporter = require('crash-reporter');

/**
 * Keep a global reference of the window object, if you don't, the window will
 * be closed automatically when the javascript object is GCed
 */

var win = null;
var menu = null;

/**
 * Quit when all windows are closed
 */

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

/**
 * Report crashes to our server
 */

app.on('will-finish-launching', function () {
    crashReporter.start({ productName: 'imagemin-app' });
});

/**
 * On ready
 */

app.on('finish-launching', function () {
    win = new BrowserWindow({ width: 500, height: 450 });
    win.loadUrl('file://' + __dirname + '/index.html');

    win.on('closed', function () {
        win = null;
    });
	
	if (process.platform == 'darwin') {
    var template = [
      {
        label: 'Atom Shell',
        submenu: [
          {
            label: 'About Atom Shell',
            selector: 'orderFrontStandardAboutPanel:'
          },
          {
            type: 'separator'
          },
          {
            label: 'Hide Atom Shell',
            accelerator: 'Command+H',
            selector: 'hide:'
          },
          {
            label: 'Hide Others',
            accelerator: 'Command+Shift+H',
            selector: 'hideOtherApplications:'
          },
          {
            label: 'Show All',
            selector: 'unhideAllApplications:'
          },
          {
            type: 'separator'
          },
          {
            label: 'Quit',
            accelerator: 'Command+Q',
            click: function() { app.quit(); }
          },
        ]
      },
      {
        label: 'Edit',
        submenu: [
          {
            label: 'Undo',
            accelerator: 'Command+Z',
            selector: 'undo:'
          },
          {
            label: 'Redo',
            accelerator: 'Shift+Command+Z',
            selector: 'redo:'
          },
          {
            type: 'separator'
          },
          {
            label: 'Cut',
            accelerator: 'Command+X',
            selector: 'cut:'
          },
          {
            label: 'Copy',
            accelerator: 'Command+C',
            selector: 'copy:'
          },
          {
            label: 'Paste',
            accelerator: 'Command+V',
            selector: 'paste:'
          },
          {
            label: 'Select All',
            accelerator: 'Command+A',
            selector: 'selectAll:'
          },
        ]
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Reload',
            accelerator: 'Command+R',
            click: function() { win.restart(); }
          },
          {
            label: 'Enter Fullscreen',
            click: function() { win.setFullscreen(true); }
          },
          {
            label: 'Toggle DevTools',
            accelerator: 'Alt+Command+I',
            click: function() { win.toggleDevTools(); }
          },
        ]
      },
      {
        label: 'Window',
        submenu: [
          {
            label: 'Minimize',
            accelerator: 'Command+M',
            selector: 'performMiniaturize:'
          },
          {
            label: 'Close',
            accelerator: 'Command+W',
            selector: 'performClose:'
          },
          {
            type: 'separator'
          },
          {
            label: 'Bring All to Front',
            selector: 'arrangeInFront:'
          },
        ]
      },
    ];

    menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  } else {
    var template = [
      {
        label: 'File',
        submenu: [
          {
            label: 'Open',
            accelerator: 'Ctrl+O',
          },
          {
            label: 'Close',
            accelerator: 'Ctrl+W',
            click: function() { win.close(); }
          },
        ]
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Reload',
            accelerator: 'Ctrl+R',
            click: function() { win.restart(); }
          },
          {
            label: 'Enter Fullscreen',
            click: function() { win.setFullScreen(true); }
          },
          {
            label: 'Toggle DevTools',
            accelerator: 'Alt+Ctrl+I',
            click: function() { win.toggleDevTools(); }
          },
        ]
      },
    ];

    menu = Menu.buildFromTemplate(template);
    win.setMenu(menu);
  }
});
