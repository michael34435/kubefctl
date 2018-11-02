exports.command = 'create <command>';
exports.description = 'Create resources built by kubefctl';
exports.builder = (yargs) => yargs
  .commandDir('create')
  .check((argv) => {
    const command = argv.command;

    if (command) {
      return `Error: unknown command "${command}" for "kubefctl"`;
    }

    return true;
  }); ;
