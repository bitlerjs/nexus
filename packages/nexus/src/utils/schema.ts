import { Static, TSchema } from '@sinclair/typebox';
import { Ajv } from 'ajv';

const ajv = new Ajv({
  strict: false,
  formats: {
    date: true,
    'date-time': true,
  },
});

function parseWithSchema<TInputSchema extends TSchema = TSchema>(schema: TSchema, data: unknown): Static<TInputSchema> {
  const validate = ajv.compile(schema);
  if (!validate(data)) {
    throw new Error(`Validation failed: ${JSON.stringify(validate.errors)}`);
  }
  return cleanObject(data, schema) as Static<TInputSchema>;
}

const cleanObject = <T>(data: T, schema: any): T => {
  if (typeof data !== 'object' || data === null) return data; // Base case

  if (Array.isArray(data)) {
    if (schema.type === 'array' && schema.items) {
      return data.map((item) => cleanObject(item, schema.items)) as T;
    }
    return [] as T; // If array schema is missing, return empty array
  }

  if (schema.type === 'object' && schema.properties) {
    return Object.keys(schema.properties).reduce(
      (acc, key) => {
        if (key in data) acc[key] = cleanObject(data[key as keyof typeof data], schema.properties[key]);
        return acc;
      },
      {} as Record<string | number | symbol, unknown>,
    ) as T;
  }

  return data; // If not an object or array, return as is
};
export { parseWithSchema };
