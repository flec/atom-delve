"use strict";
var _atom = require('atom');
function initDelve(mainPath) {
    var ready = false;
    return new Promise(function (resolve) {
        var dlv = new _atom.BufferedProcess({
            command: process.env.GOPATH + "/bin/dlv",
            args: ['debug'],
            options: {
                'cwd': mainPath
            },
            stdout: function (output) {
                if (!ready) {
                    ready = true;
                    resolve(new Delve(dlv));
                }
            }
        });
    });
}
exports.initDelve = initDelve;
var Delve = (function () {
    function Delve(dlv) {
        this.commandQueue = [];
        this.promiseResolverQueue = [];
        var that = this;
        this.dlv = dlv;
        dlv.process.stdout.setEncoding('utf8');
        this.dlv.process.stdout.on('data', function (output) {
            that.outputBuffer += output;
            if (output.lastIndexOf("(dlv) ") == output.length - 6) {
                that.promiseResolverQueue.shift()(that.outputBuffer);
                that.outputBuffer = "";
                that.executeNext();
            }
        });
    }
    Delve.prototype.step = function () {
        return this.schedule("step");
    };
    Delve.prototype.next = function () {
        return this.schedule("next");
    };
    Delve.prototype.continue = function () {
        return this.schedule("continue");
    };
    Delve.prototype.break = function (address) {
        return this.schedule("break " + address);
    };
    Delve.prototype.locals = function () {
        return this.schedule("locals");
    };
    Delve.prototype.exit = function () {
        return this.schedule("exit");
    };
    Delve.prototype.clear = function (breakpointId) {
        return this.schedule("clear " + breakpointId);
    };
    Delve.prototype.schedule = function (command) {
        var that = this;
        return new Promise(function (resolve) {
            that.commandQueue.push(command);
            that.promiseResolverQueue.push(resolve);
            if (that.promiseResolverQueue.length == 1) {
                that.executeNext();
            }
        });
    };
    Delve.prototype.executeNext = function () {
        if (this.commandQueue.length > 0) {
            this.dlv.process.stdin.write(this.commandQueue.shift() + "\n");
        }
    };
    return Delve;
}());
exports.Delve = Delve;
