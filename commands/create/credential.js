const exec = require('../../libs/exec');
const fs = require('fs-extra');
const _ = require('lodash');
const { execSync } = require('child_process');

exports.command = 'credential <CLUSTER_NAME>';
exports.describe = 'Create federation credential from existing GKE cluster';
exports.builder = {
  cluster: {
    alias: 'c',
    type: 'array',
    describe: 'GKE clusters with region or zone. For example, k8s,asia-east1',
    default: [],
  },
};
exports.handler = async (command) => {
  const inputClusters = command.cluster;
  const clusterName = command.CLUSTER_NAME;
  const kubeConf = `${process.env.HOME}/.kubefctl/clusters/${clusterName}.yml`;
  const kubeList = `${process.env.HOME}/.kubefctl/list`;
  const kubeCurrent = `${process.env.HOME}/.kubefctl/config`;
  const kubeName = `${process.env.HOME}/.kubefctl/cluster-name/${clusterName}.json`;

  if (fs.existsSync(kubeConf)) {
    throw new Error(`Error: federation/clusters "${clusterName}" already exists`);
  }

  const clusterNames = { region: {}, zone: {} };
  const cluster = { region: [], zone: [] };
  for (let inputCluster of inputClusters) {
    const [name, zoneOrRegion] = inputCluster.split(',');
    const split = zoneOrRegion.split('-');
    const [,, zone] = split;
    const flag = zone ? 'zone' : 'region';

    await exec(`KUBECONFIG=${kubeConf} gcloud container clusters get-credentials ${name} --${flag}=${zoneOrRegion}`);

    cluster[flag].push(zoneOrRegion);
    clusterNames[flag][zoneOrRegion] = _.defaultTo(clusterNames[flag][zoneOrRegion], []);
    clusterNames[flag][zoneOrRegion].push(name);
  }

  // write to cluster name list
  fs.writeJsonSync(kubeName, clusterNames);

  // push cluster info to list
  const list = _.defaultTo(fs.readJsonSync(kubeList, { throws: false }), []);
  const nodes = JSON.parse(execSync(`kubectl --kubeconfig=${kubeConf} get nodes -o json`, { encoding: 'utf-8' }));
  const machineType = _(nodes.items)
    .map(node => _.get(node, ['metadata', 'labels', 'beta.kubernetes.io/instance-type']))
    .uniq()
    .value();

  list.push(
    {
      clusterName,
      machineType,
      zones: cluster.zone,
      regions: cluster.region,
      numNodes: nodes.items.length,
    },
  );
  fs.writeJsonSync(kubeList, list);
  fs.writeFileSync(kubeCurrent, clusterName);

  console.log(`federation/clusters "${clusterName}" created`);
};
