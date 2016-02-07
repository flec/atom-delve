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
      var addressParts = result.match(/\.(\/.*?):(\d+)/);
      that.activateLine(addressParts[1], parseInt(addressParts[2], 10));
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

  private activateLine(relPath: string, line: number) {
    var that = this;
    var address = this.mainPath + relPath;
    atom.workspace.open(address, {}).then(function() {
      var editor = atom.workspace.getActiveTextEditor();
      that.activeLine = editor.markBufferRange([[line, 0], [line, 0]], { invalidate: 'never' });
      var decoration = editor.decorateMarker(that.activeLine, { type: 'line', class: "atom-delve-active-line" });
    });
  }
}
