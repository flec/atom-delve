"use strict";
(function (BreakpointEvent) {
    BreakpointEvent[BreakpointEvent["Add"] = 0] = "Add";
    BreakpointEvent[BreakpointEvent["Remove"] = 1] = "Remove";
})(exports.BreakpointEvent || (exports.BreakpointEvent = {}));
var BreakpointEvent = exports.BreakpointEvent;
var Breakpoints = (function () {
    function Breakpoints() {
        this.breakpoints = {};
        this.listeners = [];
        this.listeners[BreakpointEvent.Add] = [];
        this.listeners[BreakpointEvent.Remove] = [];
    }
    Breakpoints.prototype.toggle = function () {
        var editor = atom.workspace.getActiveTextEditor();
        var row = editor.getCursorBufferPosition().row;
        var key = editor.buffer.file.path + ":" + row;
        if (this.breakpoints[key]) {
            this.breakpoints[key].destroy();
            delete this.breakpoints[key];
            this.notify(BreakpointEvent.Remove, key);
        }
        else {
            var marker = editor.markBufferRange([[row, 0], [row, 0]], { invalidate: 'never' });
            var decoration = editor.decorateMarker(marker, { type: 'line-number', class: "atom-delve-breakpoint" });
            this.breakpoints[key] = marker;
            this.notify(BreakpointEvent.Add, key);
        }
    };
    Breakpoints.prototype.notify = function (event, address) {
        for (var _i = 0, _a = this.listeners[event]; _i < _a.length; _i++) {
            var listener = _a[_i];
            listener(address);
        }
    };
    Breakpoints.prototype.addListener = function (event, listener) {
        this.listeners[event].push(listener);
    };
    Breakpoints.prototype.removeListener = function (event, listener) {
        this.listeners[event] = this.listeners[event].filter(function (fn) {
            return fn != listener;
        });
    };
    Breakpoints.prototype.getBreakpoints = function () {
        var keys = [];
        for (var key in this.breakpoints) {
            keys.push(key);
        }
        return keys;
    };
    return Breakpoints;
}());
exports.Breakpoints = Breakpoints;
