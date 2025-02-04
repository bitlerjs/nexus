type ContainerDependency<T> = new (container: Container) => T;

function isClass<T>(dependency: ContainerDependency<T>): dependency is new (container: Container) => T {
  return 'prototype' in dependency;
}

type ContainerOptions = {
  lower?: Container;
  dependencies?: Map<ContainerDependency<unknown>, unknown>;
};

const magic = Symbol('magic');

class Container {
  #dependencies = new Map<ContainerDependency<unknown>, unknown>();
  #lower?: Container;

  constructor(options: ContainerOptions = {}) {
    this.#lower = options.lower;
    if (options.dependencies) {
      this.#dependencies = options.dependencies;
    }
  }

  get [magic]() {
    return this.#dependencies;
  }

  public get lower(): Container | undefined {
    return this.#lower;
  }

  public has = <T>(dependency: ContainerDependency<T>): boolean => {
    if (this.#lower?.has(dependency)) {
      return true;
    }
    return this.#dependencies.has(dependency);
  };

  public set = <T>(dependency: ContainerDependency<T>, instance?: T): void => {
    this.#dependencies.set(dependency, instance ?? new dependency(this));
  };

  public remove = <T>(dependency: ContainerDependency<T>): void => {
    this.#dependencies.delete(dependency);
  };

  public destroy = async () => {
    for (const dependency of this.#dependencies.keys()) {
      if (isClass(dependency)) {
        const instance = this.#dependencies.get(dependency);
        if (
          instance &&
          typeof instance === 'object' &&
          'destroy' in instance &&
          typeof instance.destroy === 'function'
        ) {
          await instance.destroy();
        }
      }
    }
    this.#dependencies.clear();
  };

  public get = <T>(dependency: ContainerDependency<T>): T => {
    if (!this.has(dependency)) {
      const instance = new dependency(this);
      if (this.#lower) {
        this.#lower.set(dependency, instance);
      } else {
        this.#dependencies.set(dependency, instance);
      }
    }
    const instance = this.#lower?.has(dependency) ? this.#lower.get(dependency) : this.#dependencies.get(dependency);
    if (!instance) {
      throw new Error('Instance not found');
    }
    return instance as T;
  };

  public upper = (upper?: Container | Map<ContainerDependency<unknown>, unknown>): Container => {
    const container = new Container({ lower: this });
    const upperMap = upper instanceof Container ? upper[magic] : (upper ?? new Map());
    for (const [dependency, instance] of upperMap) {
      container.set(dependency, instance);
    }
    return container;
  };

  public static combine = (...containers: (Container | Map<ContainerDependency<unknown>, unknown>)[]): Container => {
    const head = containers.map((container) => (container instanceof Container ? container[magic] : container));
    return new Container({ dependencies: new Map(Object.assign({}, ...head)) });
  };
}

export { Container, type ContainerDependency, type ContainerOptions };
