const exec = require('../../libs/exec');
const randomstring = require('randomstring');
const fs = require('fs-extra');
const _ = require('lodash');

exports.command = 'instance <CLUSTER_NAME>';
exports.description = 'Create federation clusters on GKE.';
exports.builder = {
  zone: {
    alias: 'z',
    describe: 'Create cluster with specified zones',
    type: 'array',
    default: [],
  },
  region: {
    alias: 'r',
    describe: 'Create cluster with specified regions',
    type: 'array',
    default: [],
  },
  'machine-type': {
    default: 'n1-standard-1',
    alias: 'm',
    describe: `The type of machine to use for nodes. Defaults to n1-standard-1.

    The list of predefined machine types is available using the following

    $ gcloud compute machine-types list

    You can also specify custom machine types with the string
    For example, to create a node pool using custom machines with 2 vCPUs '--machine-type=custom-2-12288'`,
  },
  'num-nodes': {
    default: 3,
    describe: `The number of nodes to be created in each of the cluster's zones.`,
  },
  'cluster-version': {
    default: 'latest',
    describe: `The Kubernetes version to use for the master and nodes. Defaults to server-specified.

    The default Kubernetes version is available using the following command.`,
  },
};
exports.handler = async (command) => {
  const clusterName = command.CLUSTER_NAME;
  const zones = command.zone;
  const regions = command.region;
  const numNodes = command.numNodes;
  const machineType = command.machineType;
  const clusterVersion = command.clusterVersion;
  const kubeConf = `${process.env.HOME}/.kubefctl/clusters/${clusterName}.yml`;

  if (fs.existsSync(kubeConf)) {
    console.error(`Error: federation/clusters "${clusterName}" already exists`);

    process.exit(1);
  }

  if ([zones, regions].every(value => value.length === 0)) {
    console.error('Error: At most one of --region | --zone must be specified.');

    process.exit(1);
  }

  if ([zones, regions].every(value => value.length > 0)) {
    console.error('Error: At most one of --region | --zone may be specified.');

    process.exit(1);
  }

  // create kubernetes cluster by zones or regions
  if (zones.length) {
    for (let zone of zones) {
      const cluster = `${clusterName}-${randomstring.generate(5)}`;

      if (zone.includes(',')) {
        const childZones = zone.split(',');

        await exec(`gcloud container clusters create ${cluster} --cluster-version ${clusterVersion} --zone ${childZones[0]} --node-locations ${childZones.slice(1).join(',')} --machine-type ${machineType} --num-nodes ${numNodes}`, { env: { KUBECONFIG: kubeConf } });
      } else {
        await exec(`gcloud container clusters create ${cluster} --cluster-version ${clusterVersion} --zone ${zone} --machine-type ${machineType} --num-nodes ${numNodes}`, { env: { KUBECONFIG: kubeConf } });
      }
    }
  } else {
    for (let region of regions) {
      const cluster = `${clusterName}-${randomstring.generate(5)}`;

      await exec(`gcloud container clusters create ${cluster} --cluster-version ${clusterVersion} --region ${region} --machine-type ${machineType} --num-nodes ${numNodes}`, { env: { KUBECONFIG: kubeConf } });
    }
  }

  // write current kubefctl config
  fs.writeFileSync(`${process.env.HOME}/.kubefctl/config`, clusterName);

  // write current kubefctl to list
  const listJsonFile = `${process.env.HOME}/.kubefctl/list`;
  const list = _.defaultTo(fs.readJsonSync(listJsonFile, { throws: false }), []);
  list.push(
    {
      clusterName,
      machineType,
      zones,
      clusterVersion,
      numNodes: numNodes * zones.length,
    },
  );
  fs.writeJsonSync(listJsonFile, list);

  // console.log to the terminal
  console.log(`federation/clusters "${clusterName}" created`);
};
