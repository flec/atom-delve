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
        var outputHandler = function (output) {
            console.log(output);
        };
        dlv.break("main.main").then(outputHandler);
        dlv.continue().then(outputHandler);
        dlv.next().then(outputHandler);
        dlv.locals().then(outputHandler);
        dlv.exit().then(outputHandler);
    });
}
exports.debug = debug;
