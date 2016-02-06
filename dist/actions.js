"use strict";
var path = require('path');
var delve = require('./delve');
var breakpoints = {};
function toggleBreakpoint() {
    var editor = atom.workspace.getActiveTextEditor();
    var row = editor.getCursorBufferPosition().row;
    var key = editor.buffer.file.path + ":" + row;
    if (breakpoints[key]) {
        breakpoints[key].destroy();
        delete breakpoints[key];
    }
    else {
        var marker = editor.markBufferRange([[row, 0], [row, 0]], { invalidate: 'never' });
        var decoration = editor.decorateMarker(marker, { type: 'line-number', class: "atom-delve-breakpoint" });
        breakpoints[key] = marker;
    }
}
exports.toggleBreakpoint = toggleBreakpoint;
function debug() {
    var editor = atom.workspace.getActiveTextEditor();
    delve.initDelve(path.dirname(editor.buffer.file.path)).then(function (dlv) {
        dlv.addOutputListener(function (out) {
            console.log(out);
        });
        dlv.break("main.main");
        dlv.continue();
        dlv.next();
        dlv.locals();
        dlv.exit();
    });
}
exports.debug = debug;
