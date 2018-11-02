const fs = require('fs-extra');
const _ = require('lodash');

exports.command = 'instance <CLUSTER_NAME>';
exports.description = 'Delete stored federation clusters on GKE.';
exports.handler = (command) => {
  const clusterName = command.CLUSTER_NAME;
  const federations = `${process.env.HOME}/.kubefctl/list`;
  const list = fs.readJsonSync(federations, { throws: false });
  const index = _.defaultTo(list, []).indexOf(clusterName);

  if (index === -1) {
    console.error(`Error: federation/clusters "${clusterName}" not found`);

    process.exit(1);
  }

  list.splice(index, 1);

  fs.unlinkSync(`${process.env.HOME}/.kubefctl/${clusterName}.yml`);
  fs.writeJsonSync(federations, list);

  console.log(`federation/clusters "${clusterName}" deleted`);
};
