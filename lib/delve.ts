import _atom = require('atom')

export function initDelve(mainPath: String): Promise<Delve> {
  return new Promise<Delve>(function(resolve) {
    var dlv = new _atom.BufferedProcess({
      command: process.env.GOPATH + "/bin/dlv",
      args: ['debug'],
      options: {
        'cwd': mainPath
      },
      stdout: function(output) {
        resolve(new Delve(dlv));
      }
    });
  });
}

export class Delve {
  private dlv: AtomCore.IBufferedProcess;

  constructor(dlv: AtomCore.IBufferedProcess) {
    this.dlv = dlv;
  }

  public addOutputListener(stdout: (out: string) => void) {
    this.dlv.process.stdout.on('data', stdout);
  }

  public help() {
    this.write("help");
  }

  public step() {
    this.write("step");
  }

  public continue() {
    this.write("continue");
  }

  public exit() {
    this.write("exit");
  }

  private write(command: String) {
    this.dlv.process.stdin.write(command + "\n")
  }
}
