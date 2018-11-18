exports.command = 'get <command>';
exports.description = 'Get resources built by kubefctl';
exports.builder = (yargs) => yargs
  .commandDir('get')
  .check((argv) => {
    const command = argv.command;

    if (command) {
      throw new Error(`Error: unknown command "${command}" for "kubefctl clusters get"`);
    }

    return true;
  });
