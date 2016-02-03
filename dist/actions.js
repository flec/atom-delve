"use strict";
var path = require('path');
var delve = require('./delve');
function setBreakpoint() {
}
exports.setBreakpoint = setBreakpoint;
function debug() {
    var editor = atom.workspace.getActiveTextEditor();
    delve.initDelve(path.dirname(editor.buffer.file.path)).then(function (dlv) {
        dlv.addOutputListener(function (out) {
            console.log(out);
        });
        dlv.continue();
        dlv.exit();
    });
}
exports.debug = debug;
