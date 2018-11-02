exports.command = 'config <command>';
exports.description = 'Set config built by kubefctl';
exports.builder = (yargs) => yargs
  .commandDir('config')
  .check((argv) => {
    const command = argv.command;

    if (command) {
      return `Error: unknown command "${command}" for "kubefctl"`;
    }

    return true;
  });
