exports.command = 'use <command>';
exports.description = 'Use resources for kubefctl';
exports.builder = (yargs) => yargs
  .commandDir('use')
  .check((argv) => {
    const command = argv.command;

    if (command) {
      throw new Error(`Error: unknown command "${command}" for "kubefctl clusters use"`);
    }

    return true;
  });
