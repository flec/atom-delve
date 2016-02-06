import path = require('path')
import delve = require('./delve');

var breakpoints: {[key:string]:AtomCore.IDisplayBufferMarker} = {};

export function toggleBreakpoint() {
  var editor = atom.workspace.getActiveTextEditor();
  var row = editor.getCursorBufferPosition().row;
  var key = editor.buffer.file.path + ":" + row;
  if (breakpoints[key]) {
    breakpoints[key].destroy();
    delete breakpoints[key];
  } else {
    var marker = editor.markBufferRange([[row, 0], [row, 0]], {invalidate: 'never'})
    var decoration = editor.decorateMarker(marker, { type: 'line-number', class: "atom-delve-breakpoint" })
    breakpoints[key] = marker;  
  }
}

export function debug() {
  var editor = atom.workspace.getActiveTextEditor()
  delve.initDelve(path.dirname(editor.buffer.file.path)).then(function(dlv: delve.Delve) {
    dlv.addOutputListener(function(out) {
      console.log(out);
    });
    dlv.break("main.main")
    dlv.continue();
    dlv.next();
    dlv.locals();
    dlv.exit();
  });

}
