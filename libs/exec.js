const { exec } = require('child_process');

module.exports = (cmd, options = {}) => new Promise((resolve, reject) => {
  const command = exec(cmd, options);

  command.stdout.pipe(process.stdout);
  command.stderr.pipe(process.stdout);

  command.on('error', reject);
  command.on('exit', resolve);
});
