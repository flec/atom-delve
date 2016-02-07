"use strict";
var path = require('path');
var dbg = require('./debugger');
var bp = require('./breakpoints');
var breakpoints = new bp.Breakpoints();
function toggleBreakpoint() {
    breakpoints.toggle();
}
exports.toggleBreakpoint = toggleBreakpoint;
function debug() {
    var editor = atom.workspace.getActiveTextEditor();
    dbg.initDebugger(path.dirname(editor.buffer.file.path), breakpoints).then(function (d) {
        d.continue();
    });
}
exports.debug = debug;
