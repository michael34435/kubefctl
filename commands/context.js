exports.command = 'context <command>';
exports.description = 'Set context built by kubefctl';
exports.builder = (yargs) => yargs
  .commandDir('context')
  .check((argv) => {
    const command = argv.command;

    if (command) {
      throw new Error(`Error: unknown command "${command}" for "kubefctl clusters context"`);
    }

    return true;
  });
