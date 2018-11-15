const fs = require('fs-extra');

exports.command = 'federation <CLUSTER_NAME>';
exports.description = 'Use stored federation clusters.';
exports.handler = (command) => {
  const clusterName = command.CLUSTER_NAME;

  if (!fs.existsSync(`${process.env.HOME}/.kubefctl/clusters/${clusterName}.yml`)) {
    throw new Error(`Error: federation/clusters "${clusterName}" not found`);
  }

  fs.writeFileSync(`${process.env.HOME}/.kubefctl/config`, clusterName);
  console.log(`federation/clusters "${clusterName}" configured`);
};
