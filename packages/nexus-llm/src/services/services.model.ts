type ModelDefinition = {
  kind: string;
  api: {
    url?: string;
    key: string;
  };
  provider: string;
  model: string;
  name: string;
};

class ModelsService {
  #models: Map<string, ModelDefinition>;
  #defaultModel?: string;

  constructor() {
    this.#models = new Map();
  }

  public get defaultModel() {
    return this.#defaultModel;
  }

  public set defaultModel(model: string | undefined) {
    this.#defaultModel = model;
  }

  public register = (model: ModelDefinition[]) => {
    model.forEach((m) => {
      this.#models.set(m.kind, m);
    });
  };

  public list = () => {
    return Array.from(this.#models.values());
  };

  public get = (kind: string) => {
    return this.#models.get(kind);
  };

  public getDefault = () => {
    if (!this.#defaultModel) {
      throw new Error('Default model not set');
    }
    return this.#models.get(this.#defaultModel);
  };
}

export { ModelsService, type ModelDefinition };
