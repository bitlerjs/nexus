import { program } from 'commander';

import { generateTypeFileFromUrl } from '../generate.js';

const typeCommand = program.command('type');

const typeFromUrlCommand = typeCommand.command('from-url');
typeFromUrlCommand
  .requiredOption('-u, --url <url>', 'URL to fetch server specs from')
  .requiredOption('-l, --location <location>', 'Location to write the generated types to')
  .option('-n, --name <name>', 'Name of the generated type', 'ServerSpecs')
  .action(async ({ url, location, name }) => {
    await generateTypeFileFromUrl({ url, location, name });
  });

await program.parseAsync(process.argv);
