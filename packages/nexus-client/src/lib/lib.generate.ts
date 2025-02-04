import { mkdir, writeFile } from 'fs/promises';
import { dirname } from 'path';

import { Specs, Type } from '@bitlerjs/nexus';
import { compile } from 'json-schema-to-typescript';

type GenerateTypesContentOptions = {
  specs: Specs;
  name: string;
};
const generateTypesContent = async ({ specs, name }: GenerateTypesContentOptions) => {
  const schema = Type.Object({
    tasks: Type.Object(
      Object.fromEntries(
        Object.entries(specs.tasks).map(([taskName, taskSpec]) => {
          return [
            taskName,
            Type.Object({
              input: Type.Unsafe(taskSpec.schema.input as any),
              output: Type.Unsafe(taskSpec.schema.output as any),
            }),
          ];
        }),
      ),
    ),
    events: Type.Object(
      Object.fromEntries(
        Object.entries(specs.events).map(([name, spec]) => {
          return [
            name,
            Type.Object({
              input: Type.Unsafe(spec.schema.input as any),
              output: Type.Unsafe(spec.schema.output as any),
            }),
          ];
        }),
      ),
    ),
    sources: Type.Object(
      Object.fromEntries(
        Object.entries(specs.sources).map(([name, spec]) => {
          return [name, Type.Unsafe(spec.schema as any)];
        }),
      ),
    ),
    entities: Type.Object(
      Object.fromEntries(
        Object.entries(specs.entities).map(([name, spec]) => {
          return [name, Type.Unsafe(spec.schema as any)];
        }),
      ),
    ),
  });

  return await compile(schema, name, {
    additionalProperties: false,
  });
};

type GenerateTypeFileOptions = {
  specs: Specs;
  location: string;
  name?: string;
};
const generateTypeFile = async ({ specs, location, name = 'ServerSpecs' }: GenerateTypeFileOptions) => {
  const content = await generateTypesContent({
    specs,
    name,
  });
  const dir = dirname(location);
  await mkdir(dir, { recursive: true });
  await writeFile(location, content);
};

type GenerateTypeFileFromUrlOptions = {
  url: string;
  location: string;
  name?: string;
};
const generateTypeFileFromUrl = async ({ url, location, name = 'ServerSpecs' }: GenerateTypeFileFromUrlOptions) => {
  const specs = await fetch(url).then((res) => res.json());
  await generateTypeFile({ specs, location, name });
};

export { generateTypesContent, generateTypeFile, generateTypeFileFromUrl };
