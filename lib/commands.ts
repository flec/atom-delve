import actions = require('./actions')

export function registerCommands() {
  atom.commands.add('atom-workspace', 'atom-delve:set-breakpoint', actions.setBreakpoint);
  atom.commands.add('atom-workspace', 'atom-delve:debug', actions.debug);
}
