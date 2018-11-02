const fs = require('fs-extra');
const _ = require('lodash');

exports.command = 'use-context <CLUSTER_NAME>';
exports.description = 'Use stored federation clusters.';
exports.handler = (command) => {
  const clusterName = command.CLUSTER_NAME;
  const list = fs.readJsonSync(`${process.env.HOME}/.kubefctl/list`, { throws: false });

  if (!_.defaultTo(list, []).includes(clusterName)) {
    console.error(`Error: federation/clusters "${clusterName}" not found`);

    process.exit(1);
  }

  fs.writeFileSync(`${process.env.HOME}/.kubefctl/config`, clusterName);
  console.log(`federation/clusters "${clusterName}" configured`);
};
