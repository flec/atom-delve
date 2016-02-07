import path = require('path')
import delve = require('./delve');
import bp = require('./breakpoints');

var breakpoints: bp.Breakpoints = new bp.Breakpoints();

export function toggleBreakpoint() {
  breakpoints.toggle();
}

export function debug() {
  var editor = atom.workspace.getActiveTextEditor()
  delve.initDelve(path.dirname(editor.buffer.file.path)).then(function(dlv: delve.Delve) {
    var outputHandler = function(output) {
      console.log(output);
    };
    dlv.break("main.main").then(outputHandler);
    dlv.continue().then(outputHandler);
    dlv.next().then(outputHandler);
    dlv.locals().then(outputHandler);
    dlv.exit().then(outputHandler);
  });

}
