"use strict";
var commands = require('./commands');
function activate(state) {
    commands.registerCommands();
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
function serialize() {
    return {};
}
exports.serialize = serialize;
function deserialize() {
}
exports.deserialize = deserialize;
