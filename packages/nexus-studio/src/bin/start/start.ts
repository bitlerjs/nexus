import { Command } from 'commander';

import { start } from '../../start/start.js';

const attachStart = (command: Command) => {
  const startCmd = command.command('start');
  startCmd.option('-c, --config <config>', 'config file path');
  startCmd.action(async (options) => {
    const { config } = options;
    await start(config);
  });
};

export { attachStart };
