const exec = require('../../libs/exec');
const fs = require('fs-extra');

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
  const clusters = command.cluster;
  const clusterName = command.CLUSTER_NAME;
  const kubeConf = `${process.env.HOME}/.kubefctl/clusters/${clusterName}`;

  if (fs.existsSync(kubeConf)) {
    throw new Error(`Error: federation/clusters "${clusterName}" already exists`);
  }

  for (let cluster of clusters) {
    const [name, zoneOrRegion] = cluster.split(',');
    const [geo, location, zone] = zoneOrRegion.split('-');

    if (zone) {
      await exec(`gcloud container clusters get-credentials ${name} --zone=${geo}-${location}-${zone}`, { env: { KUBECONFIG: kubeConf } });
    } else {
      await exec(`gcloud container clusters get-credentials ${name} --region=${geo}-${location}`, { env: { KUBECONFIG: kubeConf } });
    }
  }

  console.log(`federation/clusters "${clusterName}" created`);
};
