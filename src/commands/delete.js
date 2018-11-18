exports.command = 'delete <command>';
exports.description = 'Delete context built by kubefctl';
exports.builder = (yargs) => yargs
  .commandDir('delete')
  .check((argv) => {
    const command = argv.command;

    if (command) {
      throw new Error(`Error: unknown command "${command}" for "kubefctl clusters delete"`);
    }

    return true;
  });
