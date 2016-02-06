import actions = require('./actions')

export function registerCommands() {
  atom.commands.add('atom-workspace', 'atom-delve:toggle-breakpoint', actions.toggleBreakpoint);
  atom.commands.add('atom-workspace', 'atom-delve:debug', actions.debug);
}
