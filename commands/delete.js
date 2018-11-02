exports.command = 'delete <command>';
exports.description = 'Delete resources built by kubefctl';
exports.builder = (yargs) => yargs
  .commandDir('delete')
  .check((argv) => {
    const command = argv.command;

    if (command) {
      return `Error: unknown command "${command}" for "kubefctl"`;
    }

    return true;
  }); ;
