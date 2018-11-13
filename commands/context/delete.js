const fs = require('fs-extra');
const _ = require('lodash');
const exec = require('../../libs/exec');

exports.command = 'delete <CLUSTER_NAME>';
exports.description = 'Delete stored federation clusters on GKE.';
exports.handler = async (command) => {
  const clusterName = command.CLUSTER_NAME;
  const federations = `${process.env.HOME}/.kubefctl/list`;
  const list = fs.readJsonSync(federations, { throws: false });
  const index = _.defaultTo(list, []).indexOf(clusterName);

  if (index === -1) {
    throw new Error(`Error: federation/clusters "${clusterName}" not found`);
  }

  const { zones = [], regions = [] } = list.splice(index, 1).pop();
  const zonesOrRegions = [zones, regions];

  // remove sliced clusters
  for (let index in zonesOrRegions) {
    const values = zonesOrRegions[index];
    const flag = index === 0 ? '--zone' : '--region';

    for (let value of values) {
      console.log(`federation/cluster ${clusterName} on ${value}`);

      await exec(`gcloud container clusters delete ${clusterName} ${flag} ${value}`);
    }
  }

  fs.unlinkSync(`${process.env.HOME}/.kubefctl/clusters/${clusterName}.yml`);
  fs.writeJsonSync(federations, list);

  console.log(`federation/clusters "${clusterName}" deleted`);
};
