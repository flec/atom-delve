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
            that.handlePositionOutput(result);
        });
    };
    Debugger.prototype.step = function () {
        var that = this;
        this.delve.step().then(function (result) {
            that.handlePositionOutput(result);
        });
    };
    Debugger.prototype.next = function () {
        var that = this;
        this.delve.next().then(function (result) {
            that.handlePositionOutput(result);
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
    Debugger.prototype.handlePositionOutput = function (output) {
        var addressParts = output.match(/\>\s.+?\)\s(.*?):(\d+)/);
        if (addressParts) {
            var path = addressParts[1];
            if (path.charAt(0) == ".") {
                path = this.mainPath + path.substr(1);
            }
            this.activateLine(path, parseInt(addressParts[2], 10));
        }
        else {
            this.removeActiveLine();
        }
    };
    Debugger.prototype.activateLine = function (path, line) {
        var that = this;
        atom.workspace.open(path, { initialLine: line }).then(function () {
            var editor = atom.workspace.getActiveTextEditor();
            if (path.slice(-2) == ".s") {
                atom.views.getView(editor).setAttribute("data-atom-delve", "asm");
            }
            that.removeActiveLine();
            that.activeLine = editor.markBufferRange([[line, 0], [line, 0]], { invalidate: 'never' });
            editor.decorateMarker(that.activeLine, { type: 'line', class: "atom-delve-active-line" });
        });
    };
    Debugger.prototype.removeActiveLine = function () {
        if (this.activeLine) {
            this.activeLine.destroy();
        }
    };
    return Debugger;
}());
exports.Debugger = Debugger;
