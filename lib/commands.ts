import actions = require('./actions')

export function registerCommands() {
  atom.commands.add('atom-workspace', 'atom-delve:toggle-breakpoint', actions.toggleBreakpoint);
  atom.commands.add('atom-workspace', 'atom-delve:debug', actions.debug);
  atom.commands.add('atom-workspace', 'atom-delve:continue', actions.cont);
  atom.commands.add('atom-workspace', 'atom-delve:next', actions.next);
  atom.commands.add('atom-workspace', 'atom-delve:step', actions.step);
}
