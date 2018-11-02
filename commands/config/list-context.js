const fs = require('fs-extra');
const _ = require('lodash');
const Table = require('cli-table');

exports.command = 'list-context';
exports.description = 'List stored federation clusters.';
exports.handler = () => {
  const list = fs.readJsonSync(`${process.env.HOME}/.kubefctl/list`, { throws: false });
  const table = _.defaultTo(list, [])
    .reduce(
      (value, accu) => {
        value.push(
          [
            fs.readFileSync(`${process.env.HOME}/.kubefctl/config`).toString() === accu.clusterName ? '*' : '',
            accu.clusterName,
            accu.zones.join(', '),
            accu.clusterVersion,
            accu.machineType,
            accu.numNodes,
          ],
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
          'VERSION',
          'MACHINE_TYPE',
          'NUM_NODES',
        ],
      }),
    );

  console.log(table.toString());
};
