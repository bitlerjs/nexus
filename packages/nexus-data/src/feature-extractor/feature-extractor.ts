import { FeatureExtractionPipeline, cos_sim, pipeline } from '@huggingface/transformers';
import { toSql } from 'pgvector';

class Vector {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #value: any;
  #dimentions: number;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(value: any, dimentions: number) {
    this.#value = value;
    this.#dimentions = dimentions;
  }

  public get value() {
    return this.#value;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public set value(value: any) {
    this.#value = value;
  }

  public get dimentions() {
    return this.#dimentions;
  }

  public toSql = () => {
    return toSql(this.#value);
  };

  public distanceTo = (other: Vector) => {
    return cos_sim(this.#value, other.value);
  };
}

type ExtractOptions = {
  input: string[];
  model?: string;
};

type Extractor = {
  extractor: FeatureExtractionPipeline;
  dimensions: number;
};

class FeatureExtractor {
  #extractors = new Map<string, Promise<Extractor>>();

  #setupExctractor = async (model: string) => {
    const extractor = await pipeline('feature-extraction', model, {});
    const { config } = extractor.model;
    if (!('hidden_size' in config) || typeof config.hidden_size !== 'number') {
      throw new Error('Invalid model configuration');
    }
    return {
      extractor,
      dimensions: config.hidden_size,
    };
  };

  #getExtractor = async (name: string) => {
    if (!this.#extractors.has(name)) {
      this.#extractors.set(name, this.#setupExctractor(name));
    }
    const extractor = await this.#extractors.get(name);
    if (!extractor) {
      throw new Error('Extractor not found');
    }

    return extractor;
  };

  public extract = async (options: ExtractOptions) => {
    const { input, model = 'mixedbread-ai/mxbai-embed-large-v1' } = options;
    const { extractor, dimensions } = await this.#getExtractor(model);
    const output = await extractor(input, { pooling: 'cls' });
    return output.tolist().map((v: any) => new Vector(v, dimensions));
  };

  public getDimensions = async (model: string) => {
    const { dimensions } = await this.#getExtractor(model);
    return dimensions;
  };

  public getFieldType = async (model: string) => {
    const dimensions = await this.getDimensions(model);
    return `vector(${dimensions})`;
  };
}

export { FeatureExtractor, Vector };
