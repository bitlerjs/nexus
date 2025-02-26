/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface ServerSpecs {
  tasks: {
    "llm.completion": {
      input: {
        systemPrompt?: string;
        model?: string;
        prompt: string;
        dialog?: {
          role: "user" | "assistant" | "system";
          content: string;
        }[];
        tasks?: string[];
        schema?: unknown;
        maxTokens?: number;
        temperature?: number;
      };
      output: {
        type: string;
        content: unknown;
        toolsUsed?: {
          kind: string;
          input: unknown;
          output?: unknown;
          error?: string;
        }[];
      };
    };
    "llm.list-models": {
      input: {};
      output: {
        kind: string;
        name: string;
        provider: string;
      }[];
    };
    "configs.list": {
      input: {};
      output: {
        kind: string;
        name?: string;
        description?: string;
        hasValue: boolean;
      }[];
    };
    "configs.set-value": {
      input: {
        kind: string;
        value: unknown;
      };
      output: {
        success: boolean;
      };
    };
    "configs.get-value": {
      input: {
        kind: string;
      };
      output: unknown;
    };
    "configs.describe": {
      input: {
        kind: string;
      };
      output: {
        kind: string;
        name?: string;
        description?: string;
        schema: unknown;
      };
    };
    "configs.remove-value": {
      input: {
        kind: string;
      };
      output: {
        success: boolean;
      };
    };
  };
  events: {
    "configs.types-updated": {
      input: {};
      output: {
        kinds: string[];
      };
    };
  };
  sources: {};
  entities: {};
}
