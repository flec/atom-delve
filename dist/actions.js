"use strict";
var path = require('path');
var delve = require('./delve');
var bp = require('./breakpoints');
var breakpoints = new bp.Breakpoints();
function toggleBreakpoint() {
    breakpoints.toggle();
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
