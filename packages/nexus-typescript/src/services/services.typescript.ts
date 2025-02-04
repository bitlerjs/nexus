import { createContext, runInContext } from 'vm';

import * as micromatch from 'micromatch';
import { transpile } from 'typescript';

type ExecuteCode = {
  allowModules?: string[];
  code: string;
  params?: unknown;
};

class TypeScriptService {
  #modules: Map<string, unknown>;

  constructor() {
    this.#modules = new Map<string, unknown>();
  }

  public transpile = (code: string) => {
    const transpiledCode = transpile(code, {
      compilerOptions: {
        target: ['ES2020'],
        module: ['ES2020'],
        moduleResolution: ['Node'],
      },
    });
    return transpiledCode;
  };

  public registerModules = (modules: Record<string, unknown>) => {
    Object.entries(modules).forEach(([key, value]) => {
      this.#modules.set(key, value);
    });
  };

  public listModules = () => {
    return Array.from(this.#modules.keys());
  };

  public execute = <T = unknown>(code: ExecuteCode) => {
    const { code: codeToExecute, allowModules = [] } = code;
    const transpiledCode = this.transpile(codeToExecute);
    const require = (module: string) => {
      const isAllowed = micromatch.isMatch(module, allowModules);
      if (!isAllowed || !this.#modules.has(module)) {
        throw new Error(`Module ${module} not found`);
      }
      return this.#modules.get(module);
    };
    const exports = {};
    const module = { exports };
    const context = createContext({
      exports,
      module,
      require,
      params: code.params,
    });
    runInContext(transpiledCode, context);
    return {
      result: module.exports as T,
    };
  };
}

export { TypeScriptService };
