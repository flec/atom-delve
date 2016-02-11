export enum BreakpointEvent { Add, Remove }

export class Breakpoints {
  private breakpoints: { [address: string]: AtomCore.IDisplayBufferMarker };
  private listeners: (((address: string) => void)[])[];

  constructor() {
    this.breakpoints = {};
    this.listeners = [];
    this.listeners[BreakpointEvent.Add] = [];
    this.listeners[BreakpointEvent.Remove] = [];
  }

  public toggle(): void {
    var editor = atom.workspace.getActiveTextEditor();
    var row = editor.getCursorBufferPosition().row;
    var key = editor.buffer.file.path + ":" + (row + 1);
    if (this.breakpoints[key]) {
      this.breakpoints[key].destroy();
      delete this.breakpoints[key];
      this.notify(BreakpointEvent.Remove, key);
    } else {
      var marker = editor.markBufferRange([[row, 0], [row, 0]], { invalidate: 'never' })
      var decoration = editor.decorateMarker(marker, { type: 'line-number', class: "atom-delve-breakpoint" })
      this.breakpoints[key] = marker;
      this.notify(BreakpointEvent.Add, key);
    }
  }

  private notify(event: BreakpointEvent, address: string): void {
    for (var listener of this.listeners[event]) {
      listener(address);
    }
  }

  public addListener(event: BreakpointEvent, listener: (address: string) => void): void {
    this.listeners[event].push(listener);
  }

  public removeListener(event: BreakpointEvent, listener: (address: string) => void): void {
    this.listeners[event] = this.listeners[event].filter(function(fn: (address: string) => void) {
      return fn != listener;
    });
  }

  public getBreakpoints(): string[] {
    var keys = [];
    for (var key in this.breakpoints) {
      keys.push(key);
    }
    return keys;
  }
}
