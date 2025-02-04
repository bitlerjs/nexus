import { OpenAPIV3 } from 'openapi-types';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import { Type } from '@bitlerjs/nexus';

const getEndpointDefinition = (operation: OpenAPIV3.OperationObject) => {
  const { responses } = operation;
  const requestBody = operation.requestBody as OpenAPIV3.RequestBodyObject;

  const parameters = (operation.parameters || []) as OpenAPIV3.ParameterObject[];
  const successResponse = responses[200] as OpenAPIV3.ResponseObject;

  const successSchema = successResponse.content?.['application/json']?.schema;
  const bodySchema = requestBody?.content?.['application/json']?.schema;

  const queryParameters = Object.fromEntries(
    parameters
      .filter((param) => param.in === 'query')
      .map(
        (param) =>
          [param.name, param.required ? Type.Unsafe(param.schema) : Type.Optional(Type.Unsafe(param.schema))] as const,
      ),
  );
  const pathParameters = Object.fromEntries(
    parameters
      .filter((param) => param.in === 'path')
      .map(
        (param) =>
          [param.name, param.required ? Type.Unsafe(param.schema) : Type.Optional(Type.Unsafe(param.schema))] as const,
      ),
  );
  return {
    input: {
      ...(bodySchema ? { body: Type.Unsafe(bodySchema) } : {}),
      ...(Object.keys(queryParameters).length > 0 ? { query: Type.Object(queryParameters) } : {}),
      ...(Object.keys(pathParameters).length > 0 ? { path: Type.Object(pathParameters) } : {}),
    },
    output: successSchema,
  };
};

const getApiDefintion = async (swaggerUrl: string) => {
  const response = await fetch(swaggerUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch OpenAPI schema: ${response.statusText}`);
  }
  const schema = (await response.json()) as OpenAPIV3.Document;
  const dereferencedSchema = (await $RefParser.dereference(schema)) as OpenAPIV3.Document;

  const endpoints = Object.entries(dereferencedSchema.paths).flatMap(([path, methods]) => {
    return Object.entries(methods || []).flatMap(([method, operation]) => {
      if (!operation || typeof operation !== 'object' || !('operationId' in operation)) {
        return [];
      }
      const name = operation.summary || `${method.toUpperCase()} ${path}`;
      return [
        {
          path,
          method,
          name,
          description: operation.description || name,
          ...getEndpointDefinition(operation),
        },
      ];
    });
  });

  return {
    endpoints,
  };
};

export { getApiDefintion };
