"use strict";
var _atom = require('atom');
function initDelve(mainPath) {
    return new Promise(function (resolve) {
        var dlv = new _atom.BufferedProcess({
            command: process.env.GOPATH + "/bin/dlv",
            args: ['debug'],
            options: {
                'cwd': mainPath
            },
            stdout: function (output) {
                resolve(new Delve(dlv));
            }
        });
    });
}
exports.initDelve = initDelve;
var Delve = (function () {
    function Delve(dlv) {
        this.dlv = dlv;
    }
    Delve.prototype.addOutputListener = function (stdout) {
        this.dlv.process.stdout.on('data', stdout);
    };
    Delve.prototype.help = function () {
        this.write("help");
    };
    Delve.prototype.step = function () {
        this.write("step");
    };
    Delve.prototype.continue = function () {
        this.write("continue");
    };
    Delve.prototype.exit = function () {
        this.write("exit");
    };
    Delve.prototype.write = function (command) {
        this.dlv.process.stdin.write(command + "\n");
    };
    return Delve;
}());
exports.Delve = Delve;