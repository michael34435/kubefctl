const { exec } = require('child_process');

module.exports = (cmd, stdin = []) => new Promise((resolve, reject) => {
  const command = exec(cmd);

  command.stdout.pipe(process.stdout);
  command.stderr.pipe(process.stdout);

  stdin.forEach((input) => {
    command.stdin.write(input);
    command.stdin.end();
  });

  command.on('error', reject);
  command.on('exit', resolve);
});
