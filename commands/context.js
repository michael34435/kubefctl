exports.command = 'instance <command>';
exports.description = 'Set context built by kubefctl';
exports.builder = (yargs) => yargs
  .commandDir('context')
  .check((argv) => {
    const command = argv.command;

    if (command) {
      return `Error: unknown command "${command}" for "kubefctl clusters context"`;
    }

    return true;
  });
