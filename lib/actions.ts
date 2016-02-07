import path = require('path')
import dbg = require('./debugger');
import bp = require('./breakpoints');

var breakpoints: bp.Breakpoints = new bp.Breakpoints();

export function toggleBreakpoint() {
  breakpoints.toggle();
}

export function debug() {
  var editor = atom.workspace.getActiveTextEditor()
  dbg.initDebugger(path.dirname(editor.buffer.file.path), breakpoints).then(function(d: dbg.Debugger) {
    d.continue()
  });

}
