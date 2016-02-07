"use strict";
var dlv = require('./delve');
var bp = require('./breakpoints');
function initDebugger(mainPath, breakpoints) {
    return new Promise(function (resolve) {
        dlv.initDelve(mainPath).then(function (delve) {
            resolve(new Debugger(mainPath, delve, breakpoints));
        });
    });
}
exports.initDebugger = initDebugger;
var Debugger = (function () {
    function Debugger(mainPath, delve, breakpoints) {
        this.breakpoints = {};
        var that = this;
        this.mainPath = mainPath;
        this.delve = delve;
        for (var _i = 0, _a = breakpoints.getBreakpoints(); _i < _a.length; _i++) {
            var breakpoint = _a[_i];
            this.setBreakpoint(breakpoint);
        }
        breakpoints.addListener(bp.BreakpointEvent.Add, function (address) {
            that.setBreakpoint(address);
        });
        breakpoints.addListener(bp.BreakpointEvent.Remove, function (address) {
            that.removeBreakpoint(address);
        });
    }
    Debugger.prototype.continue = function () {
        var that = this;
        this.delve.continue().then(function (result) {
            var addressParts = result.match(/\.(\/.*?):(\d+)/);
            that.activateLine(addressParts[1], parseInt(addressParts[2], 10));
        });
    };
    Debugger.prototype.setBreakpoint = function (address) {
        var that = this;
        this.delve.break(address).then(function (result) {
            that.breakpoints[address] = parseInt(result.match(/Breakpoint (\d+)/).pop(), 10);
        });
    };
    Debugger.prototype.removeBreakpoint = function (address) {
        if (this.breakpoints[address]) {
            this.delve.clear(this.breakpoints[address]);
        }
        else {
            throw new Error("breakpoint not found");
        }
    };
    Debugger.prototype.activateLine = function (relPath, line) {
        var that = this;
        var address = this.mainPath + relPath;
        atom.workspace.open(address, {}).then(function () {
            var editor = atom.workspace.getActiveTextEditor();
            that.activeLine = editor.markBufferRange([[line, 0], [line, 0]], { invalidate: 'never' });
            var decoration = editor.decorateMarker(that.activeLine, { type: 'line', class: "atom-delve-active-line" });
        });
    };
    return Debugger;
}());
exports.Debugger = Debugger;
