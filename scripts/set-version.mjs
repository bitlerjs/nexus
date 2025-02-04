import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

import { findWorkspacePackages } from '@pnpm/find-workspace-packages';

const packages = await findWorkspacePackages(process.cwd());

for (const pkg of packages) {
  const pkgPath = join(pkg.dir, 'package.json');
  const pkgJson = JSON.parse(await readFile(pkgPath, 'utf-8'));

  pkgJson.version = process.argv[2];

  await writeFile(pkgPath, JSON.stringify(pkgJson, null, 2) + '\n');
}
