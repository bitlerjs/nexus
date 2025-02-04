import { start } from '../start/start.js';

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
