#!/usr/bin/env node

/**
 * Copyright 2017 Volodymyr Shymanskyy
 **/

'use strict';

const chalk = require('chalk')
const debug = require('debug')('Blynk')
const yargs = require('yargs');
const Spinner = require('cli-spinner').Spinner;

const config = require('../lib/configstore.js');

Spinner.setDefaultSpinnerString(19);
Spinner.setDefaultSpinnerDelay(100);


process.on('unhandledRejection', (reason, promise) => {
  console.error(reason)
  process.exit(1)
})

process.on('uncaughtException', (err) => {
  console.error(err.message)
  process.exit(1)
})

yargs.commandDir('../cmds').demandCommand(1, 'Please specify command to execute');

//yargs.count('verbose').alias('v', 'verbose');
//yargs.boolean('silent').alias('s', 'silent');

yargs.scriptName('blynk')
yargs.epilog('Copyright 2017 Volodymyr Shymanskyy')
yargs.alias('h', 'help');
yargs.global('version', false);
yargs.completion('completion', false);
yargs.strict().wrap(Math.min(120, yargs.terminalWidth()));

yargs.fail(function(msg, err, yargs) {
  if (err) {
    debug(err)
    console.error(err.message)
  } else {
    console.error(yargs.help())
    console.error(chalk.yellow.bold(msg))
  }
  process.exit(1)
})

yargs.recommendCommands();

//yargs.group(['help', 'verbose', 'silent'], 'Global Arguments:');

let argv;

// Check for updates
(async function() {
  const now = Math.floor(Date.now()/1000);
  const last = config.get('internal.lastUpdateCheck');

  if (!last || typeof(last) !== 'number' || last-now > 24*60*60) {
    config.set('internal.lastUpdateCheck', now)
    try {
      const semver = require('semver');
      const pkJson = require('package-json');
      
      const latest = await pkJson('blynk-tools')
      if (semver.gt(latest.version, require('../package.json').version)) {
        console.error(chalk.yellow.bold('!'), `New version ${latest.version} is available`)
        console.error(chalk.yellow.bold('!'), 'Update at any time with:', chalk.white.bold('npm install blynk -g'))
      } else if (!config.get('internal.skipHints')) {
        const hints = [
          ['If you like Blynk, give us a github star:', chalk.white.bold('https://github.com/vshymanskyy/blynk-tools')],
          ['Check out our JS client library:', chalk.white.bold('https://github.com/vshymanskyy/blynk-library-js')],
          ['Blynk is used by', chalk.white.bold("380'000"), 'people all around the world'],
          ['Run', chalk.white.bold("blynk --help"), 'to see command options'],
        ];
        console.error(chalk.yellow.bold('Hint:'), ...hints[Math.floor(Math.random()*hints.length)])
      }
    } catch(e) {}
  }

  argv = yargs.argv;
})()

/*
yargs.boolean('interactive').alias('i', 'interactive');


const inquirer = require('inquirer');

function runInquirer(cmd) {

    let commands = cmd.getCommandHandlers();

    inquirer.prompt({
      type: 'list',
      name: 'command',
      message: 'Select command',
      choices: [...Object.keys(commands)]
    }).then(result => {
      let handler = commands[result.command];
      handler.builder(yargs);
      runInquirer(yargs.getCommandInstance())
    })

}

if (argv.i) {
  runInquirer(yargs.getCommandInstance())
}
*/
