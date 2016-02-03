import commands = require('./commands');

export interface PackageState {
}

export function activate(state: PackageState) {
  commands.registerCommands();
}

export function deactivate() {

}

export function serialize(): PackageState {
    return {};
}

export function deserialize() {
    /* do any tear down here */
}
