const fs = require('fs-extra');
const _ = require('lodash');
const Table = require('cli-table');

exports.command = 'credential';
exports.description = 'List stored federation clusters.';
exports.handler = () => {
  const kubeList = `${process.env.HOME}/.kubefctl/list`;
  const kubeConf = `${process.env.HOME}/.kubefctl/config`;
  const list = fs.readJsonSync(kubeList, { throws: false });
  const table = _.defaultTo(list, [])
    .reduce(
      (value, accu) => {
        const current = fs.readFileSync(kubeConf, 'utf-8').trim();

        value.push(
          [
            current === accu.clusterName ? '*' : '',
            accu.clusterName,
            _.concat(accu.zones, accu.regions).join(', '),
            accu.machineType,
            accu.numNodes,
          ].map(
            (value) => _.defaultTo(value, ''),
          ),
        );

        return value;
      },
      new Table({
        chars: {
          'top': '',
          'top-mid': '',
          'top-left': '',
          'top-right': '',
          'bottom': '',
          'bottom-mid': '',
          'bottom-left': '',
          'bottom-right': '',
          'left': '',
          'left-mid': '',
          'mid': '',
          'mid-mid': '',
          'right': '',
          'right-mid': '',
          'middle': ' ',
        },
        style: {
          'padding-left': 0,
          'padding-right': 3,
          head: ['white'],
        },
        head: [
          'CURRENT',
          'NAME',
          'LOCATION',
          'MACHINE_TYPE',
          'NUM_NODES',
        ],
      }),
    );

  console.log(table.toString());
};
