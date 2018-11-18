const fs = require('fs-extra');
const exec = require('../../libs/exec');
const _ = require('lodash');

exports.command = 'credential <CLUSTER_NAME>';
exports.description = 'Delete stored federation clusters on GKE.';
exports.handler = async (command) => {
  const clusterName = command.CLUSTER_NAME;
  const kubeConf = `${process.env.HOME}/.kubefctl/clusters/${clusterName}.yml`;
  const kubeDeploymentConf = `${process.env.HOME}/.kubefctl/tmp/${clusterName}.ingress.yml`;
  const kubeIngressConf = `${process.env.HOME}/.kubefctl/tmp/${clusterName}.ingress.yml`;
  const kubeNamesConf = `${process.env.HOME}/.kubefctl/cluster-name/${clusterName}.json`;
  const kubeList = `${process.env.HOME}/.kubefctl/list`;
  const kubemciIngressConf = `${process.env.HOME}/.kubefctl/ingress`;

  if (!fs.existsSync(kubeConf)) {
    throw new Error(`Error: federation/clusters "${clusterName}" not found`);
  }

  // TODO: bad, should avoid nested for loop
  const clusterNames = fs.readJsonSync(kubeNamesConf, { throws: false });
  for (let type in clusterNames) {
    for (let regionOrZone in clusterNames[type]) {
      for (let cluster of clusterNames[type][regionOrZone]) {
        await exec(`gcloud container clusters delete ${cluster} --${type} ${regionOrZone}`, ['y']);

        console.log('Y');
      }
    }
  }

  const federations = fs.readJsonSync(kubeList, { throws: false });
  federations.splice(federations.findIndex((federation) => federation.clusterName === clusterName), 1);

  // delete ingress
  const ingresses = _.defaultTo(fs.readJsonSync(kubemciIngressConf), {});

  if (ingresses[clusterName]) {
    await exec(`kubemci delete ${ingresses[clusterName]} --ingress=${kubeIngressConf} --kubeconf=${kubeConf}`);

    delete ingresses[clusterName];
    fs.writeJsonSync(kubemciIngressConf, ingresses);
  }

  fs.ensureFileSync(kubeNamesConf);
  fs.unlinkSync(kubeConf);
  fs.unlinkSync(kubeNamesConf);
  fs.unlinkSync(kubeDeploymentConf);
  fs.unlinkSync(kubeIngressConf);
  fs.writeJsonSync(kubeList, federations);

  console.log(`federation/clusters "${clusterName}" deleted`);
};
