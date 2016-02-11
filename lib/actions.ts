import path = require('path')
import dbg = require('./debugger');
import bp = require('./breakpoints');

var breakpoints: bp.Breakpoints = new bp.Breakpoints();
var dbgr: dbg.Debugger;

export function toggleBreakpoint() {
  breakpoints.toggle();
}

export function debug() {
  var editor = atom.workspace.getActiveTextEditor()
  dbg.initDebugger(path.dirname(editor.buffer.file.path), breakpoints).then(function(d: dbg.Debugger) {
    dbgr = d;
    d.continue()
  });
}

export function cont() {
  if (dbgr) {
    dbgr.continue();
  }
}

export function step() {
  if (dbgr) {
    dbgr.step();
  }
}

export function next() {
  if (dbgr) {
    dbgr.next();
  }
}

export function exit() {
  if(dbgr) {
    dbgr.exit();
    dbgr = undefined;
  }
}
