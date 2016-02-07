import _atom = require('atom')

export function initDelve(mainPath: String): Promise<Delve> {
  var ready: boolean = false;
  return new Promise<Delve>(function(resolve) {
    var dlv = new _atom.BufferedProcess({
      command: process.env.GOPATH + "/bin/dlv",
      args: ['debug'],
      options: {
        'cwd': mainPath
      },
      stdout: function(output) {
        if (!ready) {
          ready = true;
          resolve(new Delve(dlv));
        }
      }
    });
  });
}

export class Delve {
  private dlv: AtomCore.IBufferedProcess;
  private commandQueue: string[] = [];
  private promiseResolverQueue: ((string) => void)[] = [];
  private outputBuffer: string;

  constructor(dlv: AtomCore.IBufferedProcess) {
    var that = this;
    this.dlv = dlv;
    dlv.process.stdout.setEncoding('utf8');
    this.dlv.process.stdout.on('data', function(output: string) {
      that.outputBuffer += output;
      if (output.lastIndexOf("(dlv) ") == output.length - 6) {
        that.promiseResolverQueue.shift()(that.outputBuffer);
        that.outputBuffer = "";
        that.executeNext();
      }
    });
  }

  public step(): Promise<string> {
    return this.schedule("step");
  }

  public next(): Promise<string> {
    return this.schedule("next");
  }

  public continue(): Promise<string> {
    return this.schedule("continue");
  }

  public break(address: string): Promise<string> {
    return this.schedule("break " + address);
  }

  public locals(): Promise<string> {
    return this.schedule("locals");
  }

  public exit(): Promise<string> {
    return this.schedule("exit");
  }

  public clear(breakpointId: number): Promise<string> {
    return this.schedule("clear " + breakpointId);
  }

  private schedule(command: string): Promise<string> {
    var that = this;
    return new Promise<string>(function(resolve) {
      that.commandQueue.push(command);
      that.promiseResolverQueue.push(resolve);
      if (that.promiseResolverQueue.length == 1) {
        that.executeNext();
      }
    })
  }

  private executeNext() {
    if (this.commandQueue.length > 0) {
      this.dlv.process.stdin.write(this.commandQueue.shift() + "\n");
    }
  }
}
