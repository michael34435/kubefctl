const _ = require('lodash');

module.exports = class Command {
  constructor (argv, slice = 2) {
    const {
      files = [],
      commands = [],
    } = _(argv)
      .slice(slice)
      .value()
      .reduce(
        (value, accu) => {
          if (/^(-f|--file)$/.test(accu[0])) {
            value.files.push(accu[1]);
          } else if (_.findIndex(value, (arrayValue) => arrayValue[0] === accu[0]) === -1) {
            value.commands.push(accu);
          }

          return value;
        },
        {
          commands: [],
          files: [],
        },
      );

    this.commands = commands;
    this.files = files;
  }

  getCommands () {
    return this.commands;
  }

  getFiles () {
    return this.files;
  }
};
