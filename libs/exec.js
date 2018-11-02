const { exec } = require('child_process');

module.exports = (cmd, options = {}) => new Promise((resolve) => {
  const command = exec(cmd, options);

  command.stdout.on('data', (data) => {
    console.log(data.trim());
  });

  command.on('error', () => {});
  command.on('exit', resolve);
});
