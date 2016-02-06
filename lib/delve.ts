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
    dlv.process.stdout.setEncoding('utf8');
  }

  public addOutputListener(stdout: (out: string) => void) {
    this.dlv.process.stdout.on('data', stdout);
  }

  public step() {
    this.write("step");
  }

  public next() {
    this.write("next");
  }

  public continue() {
    this.write("continue");
  }

  public break(address: string) {
    this.write("break " + address);
  }

  public locals() {
    this.write("locals");
  }

  public exit() {
    this.write("exit");
  }

  private write(command: String) {
    this.dlv.process.stdin.write(command + "\n")
  }
}
