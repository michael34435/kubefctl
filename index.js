#!/usr/bin/env node

const fs = require('fs-extra');
const which = require('which');
const yargs = require('yargs');
const _ = require('lodash');
const yaml = require('js-yaml');
const dayjs = require('dayjs');
const md5 = require('md5');
const { version } = require('./package.json');
const exec = require('./libs/exec');
const debug = require('./libs/debug');
const Command = require('./libs/command');

(async () => {
  debug('Create kubefctl config and directories');

  // prepare paths
  const clustersConfig = `${process.env.HOME}/.kubefctl/clusters`;
  const clusterNameConfig = `${process.env.HOME}/.kubefctl/cluster-name`;
  const tmpConfig = `${process.env.HOME}/.kubefctl/tmp`;
  const contextConfig = `${process.env.HOME}/.kubefctl/config`;
  const contextListConfig = `${process.env.HOME}/.kubefctl/list`;
  const contextIngressConfig = `${process.env.HOME}/.kubefctl/ingress`;

  // create config folders and desired files
  fs.mkdirpSync(clustersConfig, { throws: false });
  fs.mkdirpSync(tmpConfig, { throws: false });
  fs.mkdirpSync(clusterNameConfig, { throws: false });
  fs.ensureFileSync(contextConfig);
  fs.ensureFileSync(contextListConfig);
  fs.ensureFileSync(contextIngressConfig);

  debug('Check installed packages');
  const packages = [
    'kubectl',
    // 'kubemci',
    'gcloud',
  ];

  packages.forEach((pkg) => {
    try {
      which.sync(pkg);
    } catch (e) {
      throw new Error(`Error: "${pkg}" is required for kubefctl.`);
    }
  });

  const argv = yargs
    .help('help')
    .alias('help', 'h')
    .version('version', version)
    .alias('version', 'v')
    .command({
      command: 'clusters <command>',
      describe: 'kubefctl controls the Kubernetes federation(kubemci + kubectl), other commands are as same as kubectl',
      builder (yargs) {
        return yargs.commandDir('commands');
      },
    })
    .check((argv) => {
      const command = argv.command;

      if (command) {
        console.log(command);
        throw new Error(`Error: unknown command "${command}" for "kubefctl clusters"`);
      }

      return true;
    })
    .demandCommand()
    .fail((...arg) => {
      const [, error, command] = arg;

      if (error) {
        console.error(error.message);
        process.exit(1);
      } else {
        return command.showHelp();
      }
    })
    .help()
    .argv;

  const args = argv._;

  if (_.has(args, 0) && args[0] !== 'clusters') {
    console.log('Notice: use kubectl/kubemci as default command');

    // check kubefctl config
    const current = fs.readFileSync(contextConfig, 'utf-8').trim();
    if (!current) {
      throw new Error('federation/clusters config not found');
    }

    // get kubefctl cluster config
    const kubeConfig = `${clustersConfig}/${current}.yml`;
    if (!fs.existsSync(kubeConfig)) {
      throw new Error(`federation/clusters config "${current}" was corrupted`);
    }

    // check is single type
    debug('Get resource type');
    if (['ingress', 'ing'].includes(_.get(args, [1], ''))) {
      switch (args[0]) {
        case 'get':
        case 'delete':
        case 'create':
          const map = {
            get: 'get-status',
            delete: 'delete',
            create: 'create',
          };

          if (map[args[0]] === 'get-status' && args[2] === 'all') {
            await exec('kubemci list');
          } else {
            const ingressCommand = new Command(process.argv, 4);

            await exec(`kubemci ${map[args[0]]} ${_.flatten(ingressCommand.getCommands()).join(' ')}`);
          }
          break;
        default:
          throw new Error(`Error: unknown command "${args[0]}" for "kubefctl"`);
      }

      process.exit(0);
    }

    // prepare kubefctl command
    debug('Parse kubelet config file');
    const command = new Command(process.argv);
    const kubeCommand = _.flatten(command.getCommands()).join(' ');
    const kubeYaml = fs.readFileSync(kubeConfig, 'utf-8').trim();
    const { clusters } = _.defaultTo(yaml.load(kubeYaml), { clusters: [] });
    const clusterNames = _.map(clusters, 'name');

    // parse ingress config
    const {
      ingress = [],
      deployment = [],
    } = command
      .getFiles()
      .reduce(
        (value, kubeFile) => {
          if (kubeFile.kind.toLowerCase() === 'ingress') {
            value.ingress.push(kubeFile);
          } else {
            value.deployment.push(kubeFile);
          }

          return value;
        },
        {
          ingress: [],
          deployment: [],
        },
      );

    const kubeIngressConfig = `${tmpConfig}/${current}.ingress.yml`;
    const kubeDeploymentConfig = `${tmpConfig}/${current}.deployment.yml`;

    debug('Create ingress and deployment config here');
    const deploymentYaml = deployment.map(yaml.dump).join('---\n');
    const ingressYaml = ingress.map(yaml.dump).join('---\n');
    fs.writeFileSync(kubeDeploymentConfig, deploymentYaml);
    fs.writeFileSync(kubeIngressConfig, ingressYaml);

    debug('Create ingress with kubemci here');
    if (ingress.length) {
      // create new ingress name
      const multiClusterIngress = `${current}-multi-cluster-ingress-${md5(dayjs().unix()).substr(0, 5)}`;

      // show message
      console.log(`federation/clusters config "${current}" ingress "${multiClusterIngress}"`);

      // execute kubemci
      const createCommand = `kubemci create ${multiClusterIngress} --ingress=${kubeIngressConfig} --kubeconfig=${kubeConfig}`;

      const commands = {
        delete: '',
        apply: `${createCommand} --force`,
        create: createCommand,
      };

      if (commands[argv._[0]]) {
        await exec(commands[argv._[0]]);
      }
    }

    debug('Create deployment with kubectl here');
    for (let clusterNameIndex in clusterNames) {
      // create const
      const clusterName = clusterNames[clusterNameIndex];

      // execute command here
      console.log(`federation/clusters config "${current}" with cluster "${clusterName}"`);

      // execute sync kubectl command in terminal without ingress
      await exec(`kubectl --kubeconfig ${kubeConfig} --context ${clusterName} ${kubeCommand} ${deployment.length ? ` -f ${`${tmpConfig}/${current}.deployment.yml`}` : ' '}`);

      // break new line here
      if (_.toInteger(clusterNameIndex) !== (clusterNames.length - 1)) {
        console.log('\n');
      }
    }
  }
})().catch((error) => {
  // error log message
  console.error(error.message);
  process.exit(1);
});
