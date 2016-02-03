import path = require('path')
import delve = require('./delve');

export function setBreakpoint() {

}

export function debug() {
  var editor = atom.workspace.getActiveTextEditor()
  delve.initDelve(path.dirname(editor.buffer.file.path)).then(function(dlv: delve.Delve){
    dlv.addOutputListener(function(out){
      console.log(out);
    });
    dlv.continue();
    dlv.exit();
  });

}
