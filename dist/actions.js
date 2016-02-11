"use strict";
var path = require('path');
var dbg = require('./debugger');
var bp = require('./breakpoints');
var breakpoints = new bp.Breakpoints();
var dbgr;
function toggleBreakpoint() {
    breakpoints.toggle();
}
exports.toggleBreakpoint = toggleBreakpoint;
function debug() {
    var editor = atom.workspace.getActiveTextEditor();
    dbg.initDebugger(path.dirname(editor.buffer.file.path), breakpoints).then(function (d) {
        dbgr = d;
        d.continue();
    });
}
exports.debug = debug;
function cont() {
    if (dbgr) {
        dbgr.continue();
    }
}
exports.cont = cont;
function step() {
    if (dbgr) {
        dbgr.step();
    }
}
exports.step = step;
function next() {
    if (dbgr) {
        dbgr.next();
    }
}
exports.next = next;
