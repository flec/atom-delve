import dlv = require('./delve');
import bp = require('./breakpoints');

export function initDebugger(mainPath: string, breakpoints: bp.Breakpoints): Promise<Debugger> {
  return new Promise<Debugger>(function(resolve) {
    dlv.initDelve(mainPath).then(function(delve) {
      resolve(new Debugger(mainPath, delve, breakpoints));
    })
  });
}

export class Debugger {
  private mainPath: string;
  private delve: dlv.Delve;
  private breakpoints: { [address: string]: number } = {};
  private activeLine: AtomCore.IDisplayBufferMarker;

  constructor(mainPath: string, delve: dlv.Delve, breakpoints: bp.Breakpoints) {
    var that = this;
    this.mainPath = mainPath;
    this.delve = delve;
    for (var breakpoint of breakpoints.getBreakpoints()) {
      this.setBreakpoint(breakpoint);
    }
    breakpoints.addListener(bp.BreakpointEvent.Add, function(address) {
      that.setBreakpoint(address);
    })
    breakpoints.addListener(bp.BreakpointEvent.Remove, function(address) {
      that.removeBreakpoint(address);
    })
  }

  public continue() {
    var that = this;
    this.delve.continue().then(function(result: string) {
      that.handlePositionOutput(result);
    });
  }

  public step() {
    var that = this;
    this.delve.step().then(function(result: string) {
      that.handlePositionOutput(result);
    });
  }

  public next() {
    var that = this;
    this.delve.next().then(function(result: string) {
      that.handlePositionOutput(result);
    });
  }

  public setBreakpoint(address: string) {
    var that = this;
    this.delve.break(address).then(function(result: string) {
      that.breakpoints[address] = parseInt(result.match(/Breakpoint (\d+)/).pop(), 10);
    });
  }

  public removeBreakpoint(address: string) {
    if (this.breakpoints[address]) {
      this.delve.clear(this.breakpoints[address]);
    } else {
      throw new Error("breakpoint not found")
    }
  }

  private handlePositionOutput(output: string) {
    var addressParts = output.match(/\>\s.+?\)\s(.*?):(\d+)/);
    if (addressParts) {
      var path = addressParts[1];
      if (path.charAt(0) == "."){
        path = this.mainPath + path.substr(1);
      }
      this.activateLine(path, parseInt(addressParts[2], 10));
    } else {
      this.removeActiveLine();
    }
  }

  private activateLine(path: string, line: number) {
    var that = this;
    atom.workspace.open(path, {initialLine:line}).then(function() {
      var editor = atom.workspace.getActiveTextEditor();
      if (path.slice(-2) == ".s") {
        atom.views.getView(editor).setAttribute("data-atom-delve", "asm");
      }
      that.removeActiveLine();
      that.activeLine = editor.markBufferRange([[line, 0], [line, 0]], { invalidate: 'never' });
      editor.decorateMarker(that.activeLine, { type: 'line', class: "atom-delve-active-line" });
    });
  }

  private removeActiveLine() {
    if (this.activeLine) {
      this.activeLine.destroy();
    }
  }
}
