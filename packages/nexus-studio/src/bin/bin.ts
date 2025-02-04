import { program } from 'commander';

import { attachStart } from './start/start.js';

attachStart(program);

program.parse(process.argv);
